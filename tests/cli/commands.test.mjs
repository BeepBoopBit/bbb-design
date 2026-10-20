import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { after, test } from 'node:test'
import { runCLI } from '../../packages/cli/src/cli.mjs'
import { CLI_VERSION, DEFAULT_REGISTRY_URL } from '../../packages/cli/src/config.mjs'
import { buildRegistry } from '../../scripts/build-registry.mjs'
import { projectRoot } from '../../scripts/registry.mjs'

const registry = await buildRegistry()
const registryPath = resolve(projectRoot, 'registry-dist')
const sandbox = await mkdtemp(resolve(tmpdir(), 'bbb-cli-test-'))
after(() => rm(sandbox, { recursive: true, force: true }))
let count = 0

async function app() {
  const root = resolve(sandbox, `app with spaces ${++count}`)
  await mkdir(resolve(root, 'src'), { recursive: true })
  await writeFile(resolve(root, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { react: '^19.2.0', 'react-dom': '^19.2.0' }, devDependencies: { typescript: '~6.0.2', vite: '^8.3.0' } }, null, 2))
  await writeFile(resolve(root, 'tsconfig.json'), '{}')
  await writeFile(resolve(root, 'src/main.tsx'), "import './index.css'\n")
  await writeFile(resolve(root, 'src/index.css'), '@charset "UTF-8";\nbody { margin: 13px; }\n')
  return root
}
const invoke = (root, args, overrides = {}) => runCLI(['--cwd', root, ...args], { cwd: projectRoot, env: {}, log() {}, ...overrides })
const init = (root, args = [], overrides) => invoke(root, ['init', '--registry', registryPath, '--no-install', ...args], overrides)
const json = async path => JSON.parse(await readFile(path, 'utf8'))
async function snapshot(root) {
  const result = {}
  for (const entry of await readdir(root, { recursive: true, withFileTypes: true })) if (entry.isFile()) {
    const path = resolve(entry.parentPath, entry.name)
    result[path.slice(root.length)] = createHash('sha256').update(await readFile(path)).digest('hex')
  }
  return result
}

test('empty projects explain app creation; malformed package files are diagnosed separately', async () => {
  const root = resolve(sandbox, 'empty destination')
  await mkdir(root)
  await assert.rejects(init(root), error => error.message.includes(root) && /does not create the app/.test(error.message) && /npm create vite/.test(error.message))
  assert.deepEqual(await readdir(root), [])
  await writeFile(resolve(root, 'package.json'), '{ broken json')
  await assert.rejects(init(root), /Invalid JSON in .*package.json/)
  await writeFile(resolve(root, 'package.json'), 'null')
  await assert.rejects(init(root), /Expected a package object/)
})

test('init dry run changes nothing; custom destination, stylesheet, and baseline are repeatable', async () => {
  const root = await app()
  const before = await snapshot(root)
  const plan = await init(root, ['--dry-run', '--dir', 'src/owned ui', '--baseline'])
  assert.equal(plan.dryRun, true)
  assert.ok(plan.dependencies.add.length)
  assert.deepEqual(await snapshot(root), before)
  await init(root, ['--dir', 'src/owned ui', '--baseline'])
  assert.equal((await json(resolve(root, 'bbb.json'))).directory, 'src/owned ui')
  assert.equal((await json(resolve(root, 'src/owned ui/.bbb-source.json'))).release, registry.release)
  const css = await readFile(resolve(root, 'src/index.css'), 'utf8')
  assert.equal(css, '@charset "UTF-8";\n@import "./owned ui/foundations/baseline.css";\nbody { margin: 13px; }\n')
  const initialized = await snapshot(root)
  await init(root)
  assert.deepEqual(await snapshot(root), initialized)
  await assert.rejects(init(root, ['--dir', 'src/different']), /already initialized/)
})

test('add resolves aliases, reuses shared files, and aborts the whole batch on edited source', async () => {
  const root = await app()
  await init(root)
  await invoke(root, ['add', 'button', 'confirmation-dialog', '--no-install'])
  const record = await json(resolve(root, 'src/bbb/.bbb-source.json'))
  assert.ok(record.items.includes('dialog'))
  assert.ok(!record.items.includes('confirmation-dialog'))
  const before = await snapshot(root)
  await invoke(root, ['add', 'button', 'dialog', '--no-install'])
  assert.deepEqual(await snapshot(root), before)
  await writeFile(resolve(root, 'src/bbb/components/Button/Button.tsx'), '// consumer-owned button\n')
  const edited = await snapshot(root)
  await assert.rejects(invoke(root, ['add', 'text-field', 'button', '--no-install']), /Preserved existing file/)
  assert.deepEqual(await snapshot(root), edited)
  await assert.rejects(invoke(root, ['add', 'not-a-component']), /Unknown BBB item/)
  assert.deepEqual(await snapshot(root), edited)
})

test('add reads the recorded release even after discovery points to a new release', async () => {
  const root = await app()
  const local = resolve(sandbox, 'registry with spaces')
  await cp(registryPath, local, { recursive: true })
  await invoke(root, ['init', '--registry', local, '--no-install'])
  const latest = await json(resolve(local, 'manifest.json'))
  latest.release = '99.0.0'
  latest.items = latest.items.map(item => ({ ...item, release: '99.0.0' }))
  await writeFile(resolve(local, 'manifest.json'), JSON.stringify(latest))
  await invoke(root, ['add', 'button', '--no-install'])
  assert.equal((await json(resolve(root, 'src/bbb/.bbb-source.json'))).release, registry.release)
  await assert.rejects(invoke(root, ['add', 'button', '--release', '99.0.0']), /recorded/)
})

test('dependency conflicts, unsupported hosts, and npm failure leave sources and setup untouched', async () => {
  const root = await app()
  const pkgPath = resolve(root, 'package.json')
  const pkg = await json(pkgPath)
  pkg.dependencies['react-aria-components'] = '^0.1.0'
  await writeFile(pkgPath, JSON.stringify(pkg))
  const before = await snapshot(root)
  await assert.rejects(init(root), /Dependency conflict/)
  assert.deepEqual(await snapshot(root), before)
  delete pkg.dependencies['react-aria-components']
  pkg.dependencies.react = '^18.0.0'
  await writeFile(pkgPath, JSON.stringify(pkg))
  await assert.rejects(init(root), /requires react/)
  pkg.dependencies.react = '^19.2.0'
  await writeFile(pkgPath, JSON.stringify(pkg))
  const compatible = await snapshot(root)
  await assert.rejects(invoke(root, ['init', '--registry', registryPath], { install: async () => { throw new Error('simulated npm failure') } }), /simulated npm failure/)
  assert.deepEqual(await snapshot(root), compatible)
  await writeFile(resolve(root, 'pnpm-lock.yaml'), '')
  await assert.rejects(init(root), /supports npm/)
})

test('setup rechecks files after dependency installation and rejects symbolic destinations', async () => {
  const root = await app()
  await assert.rejects(invoke(root, ['init', '--registry', registryPath], { install: async () => {
    await writeFile(resolve(root, 'src/index.css'), '/* concurrent edit */')
  } }), /changed after planning/)
  assert.equal(await readFile(resolve(root, 'src/index.css'), 'utf8'), '/* concurrent edit */')
  assert.equal((await readdir(root)).includes('bbb.json'), false)
  assert.equal((await readdir(resolve(root, 'src'))).includes('bbb'), false)
  const outside = resolve(sandbox, 'outside')
  await mkdir(outside)
  await symlink(outside, resolve(root, 'src/bbb'))
  await assert.rejects(init(root), /symbolic link/)
  assert.deepEqual(await readdir(outside), [])
})

test('HTTP registry validates bundles against the release manifest and reports network failures', async () => {
  let corrupt = false
  let unavailable = false
  const server = createServer(async (request, response) => {
    try {
      if (unavailable) { response.writeHead(503).end(); return }
      const name = request.url.slice('/r/'.length)
      if (name.includes('..')) { response.writeHead(400).end(); return }
      const content = await readFile(resolve(registryPath, name), 'utf8')
      if (corrupt && name.endsWith('/button.json')) {
        const bundle = JSON.parse(content)
        bundle.files[0].content += '\n// different file\n'
        bundle.meta.bbb.hashes[bundle.files[0].target] = createHash('sha256').update(bundle.files[0].content).digest('hex')
        response.end(JSON.stringify(bundle))
      } else response.end(content)
    } catch { response.writeHead(404).end() }
  })
  await new Promise(resolveListen => server.listen(0, '127.0.0.1', resolveListen))
  try {
    const url = `http://127.0.0.1:${server.address().port}/r/`
    const root = await app()
    let listed
    await invoke(root, ['list', '--registry', url, '--json'], { log: value => { listed = JSON.parse(value) } })
    assert.equal(listed.items.length, registry.items.length)
    await invoke(root, ['init', '--registry', url, '--no-install'])
    corrupt = true
    const before = await snapshot(root)
    await assert.rejects(invoke(root, ['add', 'button', '--no-install']), /differs from the release manifest/)
    assert.deepEqual(await snapshot(root), before)
    unavailable = true
    await assert.rejects(invoke(root, ['add', 'button']), /HTTP 503/)
    assert.deepEqual(await snapshot(root), before)
  } finally { await new Promise(resolveClose => server.close(resolveClose)) }
})

test('compatible consumer declarations are preserved, including restoring missing installed packages', async () => {
  const root = await app()
  const path = resolve(root, 'package.json')
  const pkg = await json(path)
  pkg.dependencies['react-aria-components'] = '^1.21.1'
  await writeFile(path, JSON.stringify(pkg))
  let dependencyPlan
  await invoke(root, ['init', '--registry', registryPath], { install: async (_, dependencies) => { dependencyPlan = dependencies } })
  assert.ok(dependencyPlan.restore.includes('react-aria-components'))
  assert.ok(!dependencyPlan.add.some(spec => spec.startsWith('react-aria-components@')))
  assert.equal((await json(path)).dependencies['react-aria-components'], '^1.21.1')
})

test('executable help, version, and invalid arguments work without an app', () => {
  const bin = resolve(projectRoot, 'packages/cli/bin/bbb-ui.mjs')
  assert.match(execFileSync(process.execPath, [bin, '--help'], { encoding: 'utf8', cwd: sandbox }), /bbb-ui init/)
  assert.equal(execFileSync(process.execPath, [bin, '--version'], { encoding: 'utf8', cwd: sandbox }), `${CLI_VERSION}\n`)
  assert.throws(() => execFileSync(process.execPath, [bin, 'add', '--unknown'], { stdio: 'pipe', cwd: sandbox }), error => error.status === 1 && /Unknown option/.test(error.stderr.toString()))
})

test('default registry works outside an app, persists on init, and keeps additions pinned', async t => {
  const requests = []
  const fetchBefore = globalThis.fetch
  let discoveryUnavailable = false
  globalThis.fetch = async value => {
    const url = new URL(value)
    assert.ok(url.href.startsWith(DEFAULT_REGISTRY_URL))
    const path = url.href.slice(DEFAULT_REGISTRY_URL.length)
    requests.push(path)
    if (discoveryUnavailable && path === 'manifest.json') return new Response('', { status: 503 })
    return new Response(await readFile(resolve(registryPath, path)), { headers: { 'Content-Type': 'application/json' } })
  }
  t.after(() => { globalThis.fetch = fetchBefore })
  let listed
  await runCLI(['list', '--json'], { cwd: sandbox, env: {}, log: value => { listed = JSON.parse(value) } })
  assert.equal(listed.release, registry.release)
  const root = await app()
  await invoke(root, ['init', '--no-install'])
  assert.equal((await json(resolve(root, 'bbb.json'))).registry, DEFAULT_REGISTRY_URL)
  discoveryUnavailable = true
  requests.length = 0
  await invoke(root, ['add', 'button', '--no-install'])
  await invoke(root, ['list', '--json'])
  assert.ok(requests.includes(`${registry.release}/button.json`))
  assert.ok(!requests.includes('manifest.json'))
})

test('registry precedence is flag, environment, saved project, then public default', async t => {
  const root = await app()
  await init(root)
  const fetchBefore = globalThis.fetch
  const requests = []
  globalThis.fetch = async value => {
    const url = new URL(value)
    requests.push(url.href)
    assert.equal(url.origin, 'https://preview.example')
    return new Response(await readFile(resolve(registryPath, url.pathname.slice('/r/'.length))))
  }
  t.after(() => { globalThis.fetch = fetchBefore })
  await invoke(root, ['list'])
  assert.deepEqual(requests, [])
  await invoke(root, ['list'], { env: { BBB_UI_REGISTRY: 'https://preview.example/r/' } })
  assert.ok(requests.length > 0)
  requests.length = 0
  await invoke(root, ['list', '--registry', registryPath], { env: { BBB_UI_REGISTRY: 'https://preview.example/r/' } })
  assert.deepEqual(requests, [])
  await assert.rejects(invoke(root, ['list', '--registry', '']), /nonempty registry/)
})

test('an unavailable default endpoint gives an actionable error and leaves setup untouched', async t => {
  const root = await app()
  const before = await snapshot(root)
  const fetchBefore = globalThis.fetch
  globalThis.fetch = async () => new Response('', { status: 404 })
  t.after(() => { globalThis.fetch = fetchBefore })
  await assert.rejects(invoke(root, ['init', '--no-install']), error => error.message.includes(DEFAULT_REGISTRY_URL) && /HTTP 404.*--registry/.test(error.message))
  assert.deepEqual(await snapshot(root), before)
})
