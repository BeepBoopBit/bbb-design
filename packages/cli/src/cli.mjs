import { relative, resolve, sep } from 'node:path'
import { parseArgs } from 'node:util'
import { applyChanges, exists, validateChanges } from './files.mjs'
import { loadBundles, loadManifest, registryLocation } from './registry.mjs'
import { detectStylesheet, installDependencies, planDependencies, readProject, setupFiles } from './project.mjs'
import { planSources, readSourceRecord } from './source.mjs'
import { CLI_VERSION, DEFAULT_REGISTRY_URL } from './config.mjs'

const help = `BBB UI — copy React components into your app and edit the source.

  bbb-ui init [--registry <directory-or-URL>] [--baseline]
  bbb-ui add <name...> [--dry-run]
  bbb-ui list [--registry <directory-or-URL>] [--json]

Options:
  --cwd <path>          Existing React/TypeScript/Vite app (default: current directory)
  --registry <source>   Local registry directory or HTTP(S) base URL
  --release <version>   Exact source release for init or list
  --dir <path>          Copy destination on init (default: src/bbb)
  --stylesheet <path>   Existing app stylesheet (otherwise detected from entrypoint)
  --baseline           Adopt BBB's global page baseline on init
  --dry-run            Show the complete plan without writing or installing
  --no-install         Copy source and print missing npm dependencies
  --json               Machine-readable list output
  --help               Show this help
  --version            Show CLI version

Registry can also be set with BBB_UI_REGISTRY. Additions stay on the release
recorded in your copied directory. Differing files are never overwritten.
Default registry: ${DEFAULT_REGISTRY_URL}
The package is an installer; apps use local source imports, not this package.
Init configures an existing app. Create one first with:
  npm create vite@latest <app-directory> -- --template react-ts
`

export async function runCLI(args, { cwd = process.cwd(), env = process.env, log = console.log, install = installDependencies } = {}) {
  const { values, positionals } = parseArgs({ args, allowPositionals: true, options: {
    cwd: { type: 'string' }, registry: { type: 'string' }, release: { type: 'string' }, dir: { type: 'string' }, stylesheet: { type: 'string' },
    baseline: { type: 'boolean' }, 'dry-run': { type: 'boolean' }, 'no-install': { type: 'boolean' }, json: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' }, version: { type: 'boolean', short: 'v' },
  } })
  if (values.version) { log(CLI_VERSION); return }
  if (values.help || !positionals.length) { log(help); return }
  const [command, ...names] = positionals
  if (!['init', 'add', 'list'].includes(command)) throw new Error(`Unknown command: ${command}. Run bbb-ui --help.`)
  if (command !== 'init' && (values.dir || values.stylesheet || values.baseline)) throw new Error('--dir, --stylesheet, and --baseline are init options.')
  if (command === 'add' && values.release) throw new Error('Add uses the source release already recorded in your project. Review upgrades separately.')
  if (command !== 'list' && values.json) throw new Error('--json is a list option.')
  if ((command !== 'add' && names.length) || (command === 'add' && !names.length)) throw new Error(command === 'add' ? 'Choose one or more names: bbb-ui add button text-field' : `${command} does not take component names.`)
  const directory = resolve(cwd, values.cwd ?? '.')
  const override = values.registry ?? env.BBB_UI_REGISTRY
  // Listing the default/explicit registry needs no app. An initialized app uses
  // its saved registry and release unless the reader chooses another registry.
  const project = command === 'list' && (override !== undefined || !await exists(resolve(directory, 'bbb.json'))) ? undefined : await readProject(directory)
  const config = project?.config
  if (command === 'add' && !config) throw new Error('Initialize this app first with bbb-ui init.')
  const location = registryLocation(override ?? config?.registry, override !== undefined ? cwd : project?.root ?? cwd)
  const target = values.dir ?? config?.directory ?? 'src/bbb'
  const record = project ? await readSourceRecord(resolve(project.root, target)) : undefined
  if (command === 'add' && !record) throw new Error('The source record is missing. Restore .bbb-source.json before adding components.')
  if (record && values.release && record.release !== values.release) throw new Error('This project already uses another source release. Review upgrades separately.')
  const manifest = await loadManifest(location, record?.release ?? values.release)
  if (command === 'list') {
    if (values.json) log(JSON.stringify({ release: manifest.release, items: manifest.items.map(({ name, title, category, description }) => ({ name, title, category, description })) }, null, 2))
    else {
      log(`BBB source ${manifest.release}\n`)
      for (const item of manifest.items) log(`${item.name.padEnd(28)} ${item.title ?? item.name} (${item.category})`)
    }
    return
  }
  if (config && command === 'init' && ((values.dir && values.dir !== config.directory) || (values.stylesheet && values.stylesheet !== config.stylesheet) || (values.baseline && !config.baseline))) throw new Error('This app is already initialized with different paths or baseline settings. Review bbb.json and stylesheet changes manually.')
  const baseline = config?.baseline ?? values.baseline ?? false
  const requested = command === 'init' ? ['foundations', 'theme-provider', ...(baseline ? ['baseline'] : [])] : names
  const bundles = await loadBundles(location, manifest, requested)
  const source = await planSources(bundles, resolve(project.root, target))
  const dependencies = await planDependencies(project, source.dependencies)
  const changes = [...source.changes]
  let stylesheet
  if (command === 'init') {
    stylesheet = values.stylesheet ?? config?.stylesheet ?? await detectStylesheet(project.root)
    const savedRegistry = /^https?:\/\//.test(location) ? location : relative(project.root, location).split(sep).join('/') || '.'
    changes.push(...await setupFiles(project, { directory: target, stylesheet, baseline, registry: savedRegistry }))
  }
  await validateChanges(changes)
  const dryRun = values['dry-run'] ?? false
  log(`${dryRun ? 'Plan' : 'Copy'}: BBB ${source.release}, ${source.added} new files, ${source.reused} identical files reused.`)
  log(`Destination: ${resolve(project.root, target)}`)
  if (stylesheet) log(`Stylesheet: ${stylesheet} (${baseline ? 'whole-app baseline' : 'component styles'})`)
  if (dependencies.add.length) log(`New runtime dependencies: ${dependencies.add.join(' ')}`)
  if (dependencies.restore.length) log(`Install existing declarations: ${dependencies.restore.join(' ')}`)
  if (!dryRun) {
    if (!values['no-install']) await install(project.root, dependencies)
    await applyChanges(changes)
    log('Source copied. Edit these local files freely.')
  }
  if (values['no-install'] || dryRun) {
    if (dependencies.restore.length) log('Install existing project dependencies: npm install')
    if (dependencies.add.length) log(`Install in your app: npm install --save-prod --save-exact ${dependencies.add.join(' ')}`)
  }
  if (command === 'init') {
    log(`\nWrap your app (adjust the relative path from your file):\n\nimport { ThemeProvider } from './${target.replace(/^src\//, '')}/components/ThemeProvider/ThemeProvider'\n\n<ThemeProvider mode="system" locale="en-US">\n  <App />\n</ThemeProvider>\n\nNext: bbb-ui add button text-field --cwd ${JSON.stringify(project.root)}`)
  }
  return { source, changes, dependencies, dryRun }
}
