import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, extname, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { registryConfig as config } from '../registry/config.mjs'
import { syncTokens } from '../src/foundations/sync-tokens.mjs'
import { SITE_URL } from '../packages/cli/src/config.mjs'

export const projectRoot = fileURLToPath(new URL('../', import.meta.url))
export const serializeRegistryArtifact = data => `${JSON.stringify(data, null, 2)}\n`
const hash = content => createHash('sha256').update(content).digest('hex')
const slug = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const read = path => readFile(resolve(projectRoot, path), 'utf8')
const essentials = ['src/foundations/styles.css', 'src/foundations/tokens.css']
const supported = /\.(tsx?|css|mjs)$/

export function destination(path) {
  if (path.startsWith('src/components/')) return path.slice(4)
  if (path.startsWith('src/foundations/')) return path.slice(4)
  if (path.startsWith('src/pages/Gallery/patterns/')) return path.replace('src/pages/Gallery/', '')
  if (/^src\/pages\/Gallery\/components\/(HelpResources|ShellIdentity|FieldStylePicker|fieldStyles)\./.test(path)) return path.replace('src/pages/Gallery/components/', 'examples/')
  if (path === 'src/pages/Gallery/previews/Previews.css') return 'examples/Previews.css'
  if (path === 'src/components/README.md') return 'docs/COMPONENTS.md'
  if (path.startsWith('docs/') || ['LICENSE', 'LICENSE-LUCIDE', 'CHANGELOG.md'].includes(path)) return path
  throw new Error(`Source is outside the copyable directories: ${path}`)
}

export function moduleReferences(path, content) {
  if (path.endsWith('.css')) return [...content.matchAll(/@import\s+['"]([^'"]+)['"]/g)]
    .map(match => ({ specifier: match[1], start: match.index + match[0].indexOf(match[1]), end: match.index + match[0].indexOf(match[1]) + match[1].length }))
  if (!/\.tsx?$/.test(path)) return []
  const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true)
  const imports = []
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const literal = node.moduleSpecifier
      imports.push({ specifier: literal.text, start: literal.getStart(source) + 1, end: literal.end - 1,
        statement: node, binding: ts.isImportDeclaration(node) ? node.importClause?.name?.text : undefined })
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) throw new Error(`Dynamic imports need an explicit registry adapter: ${path}`)
    ts.forEachChild(node, visit)
  }
  visit(source)
  return imports
}

async function resolveLocal(path, specifier) {
  const clean = specifier.split('?')[0]
  const base = posix.normalize(posix.join(dirname(path), clean))
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (await stat(resolve(projectRoot, candidate)).then(value => value.isFile()).catch(() => false)) {
      destination(candidate)
      return candidate
    }
  }
  throw new Error(`Missing dependency: ${path} imports ${specifier}`)
}

export async function catalogEntries() {
  const content = await read(config.gallery)
  const source = ts.createSourceFile(config.gallery, content, ts.ScriptTarget.Latest, true)
  const entries = []
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(source) !== 'galleryItems') continue
      for (const item of declaration.initializer.elements) {
        const values = Object.fromEntries(item.properties.filter(ts.isPropertyAssignment).map(property =>
          [property.name.getText(source), ts.isStringLiteral(property.initializer) ? property.initializer.text : property.initializer.getText(source)]))
        entries.push(values)
      }
    }
  }
  if (!entries.length) throw new Error('Gallery catalog is empty.')
  return entries
}

export async function createRegistry({ checkTokens = false } = {}) {
  await syncTokens({ check: checkTokens })
  const pkg = JSON.parse(await read('package.json'))
  const lock = JSON.parse(await read('package-lock.json'))
  const catalog = await catalogEntries()
  const componentDirs = (await readdir(resolve(projectRoot, config.components), { withFileTypes: true }))
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
  const definitions = []
  for (const directory of componentDirs) {
    const files = (await readdir(resolve(projectRoot, config.components, directory))).filter(file => supported.test(file))
      .map(file => `${config.components}/${directory}/${file}`)
    if (!files.length) throw new Error(`Empty component: ${directory}`)
    definitions.push({ name: slug(directory), title: directory, category: 'components', seeds: files,
      entrypoints: files.filter(file => file.endsWith(`/${directory}.tsx`)) })
  }
  definitions.push({ name: 'foundations', title: 'Foundations', category: 'foundations', seeds: essentials, entrypoints: essentials })
  definitions.push({ name: 'baseline', title: 'Application baseline', category: 'foundations',
    seeds: ['src/foundations/baseline.css'], entrypoints: ['src/foundations/baseline.css'] })
  definitions.push({ name: 'brand-tools', title: 'Brand tools', category: 'foundations',
    seeds: ['src/foundations/brandValidation.ts', 'src/foundations/brandContrast.ts'], entrypoints: ['src/foundations/brands.ts', 'src/foundations/brandValidation.ts', 'src/foundations/brandContrast.ts'] })
  for (const [name, file] of Object.entries(config.patterns)) {
    definitions.push({ name, title: catalog.find(item => item.id === name)?.name ?? name,
      category: 'patterns', seeds: [`src/pages/Gallery/patterns/${file}.tsx`, 'src/pages/Gallery/previews/Previews.css'],
      entrypoints: [`src/pages/Gallery/patterns/${file}.tsx`] })
  }
  const names = new Set(definitions.map(item => item.name))
  const gallery = Object.fromEntries(catalog.flatMap(item => {
    const name = config.aliases[item.id] ?? config.foundationExamples[item.id] ?? item.id
    if (!names.has(name)) {
      if (item.category === 'components' || item.category === 'patterns') throw new Error(`No registry entry for Gallery ${item.id}`)
      return []
    }
    return [[item.id, name]]
  }))
  const items = []
  for (const definition of definitions) {
    const sources = new Map()
    const packages = new Set()
    async function collect(path) {
      if (sources.has(path)) return
      const content = await read(path)
      const references = moduleReferences(path, content)
      sources.set(path, { content, references })
      for (const reference of references) {
        if (reference.specifier.startsWith('.')) {
          reference.source = await resolveLocal(path, reference.specifier)
          if (reference.specifier.includes('?') && !reference.specifier.endsWith('?url')) throw new Error(`Unsupported loader: ${path}: ${reference.specifier}`)
          await collect(reference.source)
        } else {
          const name = reference.specifier.startsWith('@') ? reference.specifier.split('/').slice(0, 2).join('/') : reference.specifier.split('/')[0]
          if (!pkg.dependencies?.[name] && !['react', 'react-dom'].includes(name)) throw new Error(`Undeclared runtime dependency: ${path}: ${name}`)
          if (!['react', 'react-dom'].includes(name)) {
            const version = lock.packages?.[`node_modules/${name}`]?.version
            if (!version) throw new Error(`Runtime dependency is not locked: ${name}`)
            packages.add(`${name}@${version}`)
          }
        }
      }
    }
    for (const path of [...essentials, ...definition.seeds, 'LICENSE', 'LICENSE-LUCIDE']) await collect(path)
    if (sources.has('src/foundations/tokenDeclarations.ts')) await collect('src/foundations/sync-tokens.mjs')
    const files = []
    for (const [path, { content, references }] of [...sources].sort(([a], [b]) => a.localeCompare(b))) {
      let output = content
      for (const reference of [...references].sort((a, b) => b.start - a.start)) {
        if (!reference.source) continue
        if (reference.specifier.endsWith('?url')) {
          if (!reference.binding || !reference.source.endsWith('.md')) throw new Error(`Unsupported asset import: ${path}`)
          const asset = sources.get(reference.source).content
          output = output.slice(0, reference.statement.getStart()) +
            `const ${reference.binding} = ${JSON.stringify(`data:text/markdown;charset=utf-8,${encodeURIComponent(asset)}`)}` + output.slice(reference.statement.end)
          continue
        }
        let specifier = posix.relative(dirname(destination(path)), destination(reference.source))
        if (!extname(reference.specifier)) specifier = specifier.replace(/\.tsx?$/, '')
        if (!specifier.startsWith('.')) specifier = `./${specifier}`
        output = output.slice(0, reference.start) + specifier + output.slice(reference.end)
      }
      // All example-level shared styles travel with their composition.
      if (definition.category !== 'components' && definition.entrypoints.includes(path) && path.endsWith('.tsx')) {
        let shared = posix.relative(dirname(destination(path)), 'examples/Previews.css')
        if (!shared.startsWith('.')) shared = `./${shared}`
        output = `import '${shared}'\n${output}`
      }
      files.push({ path, type: 'registry:file', target: `~/${config.targetRoot}/${destination(path)}`, content: output })
    }
    const dependencies = [...packages].sort()
    const entrypoints = definition.entrypoints.map(destination)
    const description = catalog.find(item => gallery[item.id] === definition.name)?.description ?? `Editable ${definition.title} source and supporting files.`
    const setup = `Copy files beneath ${config.targetRoot}, preserving their relative paths. Import ./bbb/foundations/styles.css once in src/main.tsx. ` +
      (definition.name === 'baseline' ? 'This item intentionally applies application-wide typography, background, margins, and focus styles.' : 'For app-wide typography and resets, explicitly choose the baseline item.') +
      ' Use ThemeProvider for appearance, locale, and portaled controls. React and React DOM 19.2+ are supplied by your app. Keep the included license notices.' +
      (definition.category === 'patterns' ? ' This is a local demonstration. Replace sample data, persistence, authentication, and upload simulations in your app.' : '')
    items.push({ $schema: 'https://ui.shadcn.com/schema/registry-item.json', name: definition.name,
      type: 'registry:item', title: definition.title, description, dependencies, files, docs: setup,
      categories: [definition.category], meta: { bbb: { schemaVersion: config.schemaVersion, release: pkg.version, targetRoot: config.targetRoot,
        category: definition.category, entrypoints, compatibility: { react: '>=19.2.0 <20', typescript: '>=6 <7', framework: 'Vite', styling: 'CSS' },
        components: [...new Set([...sources.keys()].filter(path => path.startsWith('src/components/') && !path.endsWith('.md')).map(path => slug(path.split('/')[2])))].sort(),
        hashes: Object.fromEntries(files.map(file => [file.target, hash(file.content)])) } } })
  }
  return { release: pkg.version, gallery, items }
}

export function registryArtifacts(registry) {
  const catalogItems = registry.items.map(({ $schema: _schema, ...item }) => ({ ...item,
    files: item.files.map(({ content: _content, ...file }) => file) }))
  const manifest = { schemaVersion: 1, release: registry.release, gallery: registry.gallery,
    items: registry.items.map(item => ({ name: item.name, title: item.title, description: item.description, dependencies: item.dependencies,
      docs: item.docs, ...item.meta.bbb, files: item.files.map(({ content: _content, ...file }) => file) })) }
  const artifacts = new Map(registry.items.map(item => [`${registry.release}/${item.name}.json`, item]))
  artifacts.set(`${registry.release}/registry.json`, { $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'bbb-design',
    homepage: SITE_URL, items: catalogItems })
  artifacts.set(`${registry.release}/manifest.json`, manifest)
  artifacts.set('manifest.json', manifest)
  return artifacts
}
