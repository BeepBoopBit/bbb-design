import { spawn } from 'node:child_process'
import { readFile, realpath } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import semver from 'semver'
import { assertSafePath, exists, planFile, readText, safeRelative } from './files.mjs'

const declarations = pkg => ({ ...pkg.devDependencies, ...pkg.optionalDependencies, ...pkg.dependencies })
const slash = value => value.split(sep).join('/')

export async function readProject(directory) {
  const root = await realpath(directory).catch(() => { throw new Error(`Project directory does not exist: ${directory}`) })
  const packagePath = resolve(root, 'package.json')
  let packageText
  try { packageText = await readFile(packagePath, 'utf8') } catch (error) {
    if (error.code !== 'ENOENT') throw new Error(`Could not read ${packagePath}: ${error.message}`)
    throw new Error(`No package.json found in ${root}. BBB init adds components to an existing React/TypeScript/Vite app; it does not create the app.\nCreate the app first with npm create vite@latest <app-directory> -- --template react-ts, then rerun init with --cwd pointing to it.`)
  }
  let pkg
  try { pkg = JSON.parse(packageText) } catch { throw new Error(`Invalid JSON in ${packagePath}. Fix the file before running BBB init.`) }
  if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg)) throw new Error(`Expected a package object in ${packagePath}.`)
  if ((pkg.packageManager && !pkg.packageManager.startsWith('npm@')) || await exists(resolve(root, 'pnpm-lock.yaml')) || await exists(resolve(root, 'yarn.lock')) || await exists(resolve(root, 'bun.lock')) || await exists(resolve(root, 'bun.lockb'))) throw new Error('This CLI currently supports npm projects. Use manual source copying for other package managers.')
  const deps = declarations(pkg)
  for (const [name, range] of [['react', '>=19.2.0 <20'], ['react-dom', '>=19.2.0 <20'], ['typescript', '>=6 <7']]) {
    const declared = semver.validRange(deps[name])
    if (!deps[name] || !declared || !semver.subset(declared, range)) throw new Error(`This source release requires ${name} ${range}. Review your project's declared version first.`)
    const installed = await installedVersion(root, name)
    if (installed && !semver.satisfies(installed, range)) throw new Error(`Installed ${name}@${installed} is unsupported. Align the project dependencies first.`)
  }
  if (!deps.vite || !await exists(resolve(root, 'tsconfig.json'))) throw new Error('Expected a Vite/TypeScript project with vite declared and tsconfig.json present.')
  const configFile = await planFile(root, 'bbb.json', '')
  let config
  if (configFile.previous !== undefined) {
    try { config = JSON.parse(configFile.previous) } catch { throw new Error('bbb.json is not valid JSON.') }
    if (config?.schemaVersion !== 1 || typeof config.registry !== 'string' || typeof config.baseline !== 'boolean') throw new Error('Unsupported bbb.json configuration.')
    safeRelative(config.directory)
    safeRelative(config.stylesheet)
    await assertSafePath(root, resolve(root, config.directory))
  }
  return { root, pkg, config, configFile }
}

async function installedVersion(root, name) {
  // Never resolve against this CLI's own dependencies.
  let current = root
  while (true) {
    const text = await readText(resolve(current, 'node_modules', name, 'package.json'))
    if (text) {
      try { return JSON.parse(text).version } catch { throw new Error(`Invalid installed package metadata: ${name}`) }
    }
    const parent = dirname(current)
    if (parent === current) return undefined
    current = parent
  }
}

export async function planDependencies(project, specifications) {
  const deps = declarations(project.pkg)
  const required = new Map()
  for (const spec of specifications) {
    if (typeof spec !== 'string') throw new Error('Invalid registry dependency.')
    const index = spec.lastIndexOf('@')
    const name = spec.slice(0, index)
    const version = spec.slice(index + 1)
    if (!/^(?:@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(name) || !semver.valid(version)) throw new Error(`Expected an exact registry dependency: ${spec}`)
    if (required.has(name) && required.get(name) !== version) throw new Error(`Conflicting registry dependencies for ${name}.`)
    required.set(name, version)
  }
  const add = []
  const restore = []
  for (const [name, version] of required) {
    if (deps[name]) {
      const range = semver.validRange(deps[name])
      if (!range || !semver.satisfies(version, range)) throw new Error(`Dependency conflict: ${name} requires tested version ${version}, but the project declares ${deps[name]}. Review it before copying.`)
      const installed = await installedVersion(project.root, name)
      // Preserve a compatible installed version; never downgrade a consumer's dependency.
      if (installed && (!semver.satisfies(installed, range) || !semver.satisfies(installed, `^${version}`))) throw new Error(`Installed ${name}@${installed} conflicts with the tested ${version} release.`)
      if (!installed) restore.push(name)
    } else add.push(`${name}@${version}`)
  }
  return { add, restore }
}

export async function installDependencies(root, dependencies) {
  // Install the consumer's existing declarations without rewriting their ranges.
  if (dependencies.restore.length) await runNpm(root, ['install', '--no-audit', '--no-fund'])
  if (dependencies.add.length) await runNpm(root, ['install', '--save-prod', '--save-exact', '--no-audit', '--no-fund', '--', ...dependencies.add])
}

function runNpm(root, args) {
  // npm exec provides npm_execpath. Calling its JS entrypoint also works on Windows.
  const npmPath = process.env.npm_execpath
  const command = npmPath?.endsWith('.js') ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const parameters = npmPath?.endsWith('.js') ? [npmPath, ...args] : args
  return new Promise((resolveInstall, reject) => {
    const child = spawn(command, parameters, { cwd: root, stdio: 'inherit', shell: false })
    child.on('error', error => reject(new Error(`Could not start npm: ${error.message}`)))
    child.on('exit', code => code === 0 ? resolveInstall() : reject(new Error(`npm install failed (${code}). No BBB source, stylesheet, or configuration files were written. Check npm's package/lockfile changes before retrying.`)))
  })
}

export async function setupFiles(project, { directory, stylesheet, baseline, registry }) {
  safeRelative(directory)
  safeRelative(stylesheet)
  if (!stylesheet.endsWith('.css')) throw new Error('Choose a plain CSS stylesheet with --stylesheet src/index.css.')
  await assertSafePath(project.root, resolve(project.root, directory))
  const styles = await planFile(project.root, stylesheet, '')
  if (styles.previous === undefined) throw new Error(`Stylesheet not found: ${stylesheet}. Choose an existing stylesheet imported by your app with --stylesheet.`)
  const target = `${directory}/foundations/${baseline ? 'baseline' : 'styles'}.css`
  let cssPath = slash(relative(dirname(resolve(project.root, stylesheet)), resolve(project.root, target)))
  if (!cssPath.startsWith('.')) cssPath = `./${cssPath}`
  const importLine = `@import ${JSON.stringify(cssPath)};\n`
  const alreadyImported = [...styles.previous.matchAll(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"]/g)].some(match => resolve(project.root, dirname(stylesheet), match[1]) === resolve(project.root, target))
  const charset = styles.previous.match(/^\uFEFF?\s*@charset\s+['"][^'"]+['"];\s*/)?.[0] ?? ''
  styles.content = alreadyImported ? styles.previous : `${charset}${importLine}${styles.previous.slice(charset.length)}`
  const config = { schemaVersion: 1, registry, directory, stylesheet, baseline }
  return [styles, { ...project.configFile, content: `${JSON.stringify(config, null, 2)}\n` }]
}

export async function detectStylesheet(root) {
  for (const entry of ['src/main.tsx', 'src/main.ts', 'src/index.tsx']) {
    const source = await readText(resolve(root, entry))
    if (!source) continue
    for (const match of source.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)) {
      const path = slash(relative(root, resolve(root, dirname(entry), match[1])))
      if (!path.startsWith('..') && await exists(resolve(root, path))) return path
    }
  }
  throw new Error('Could not identify the app stylesheet. Choose an existing, imported CSS file with --stylesheet src/index.css.')
}
