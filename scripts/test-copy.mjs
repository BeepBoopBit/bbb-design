import { spawn, execFileSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { basename, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { setTimeout } from 'node:timers/promises'
import { chromium, firefox, webkit, expect } from '@playwright/test'
import { buildRegistry } from './build-registry.mjs'
import { copySource } from './copy-source.mjs'
import { projectRoot } from './registry.mjs'
import { sha256 } from './source-releases.mjs'

const registry = await buildRegistry()
const { values } = parseArgs({ options: { 'packed-cli': { type: 'boolean' }, 'release-candidate': { type: 'boolean' } } })
const candidate = values['release-candidate'] ? JSON.parse(await readFile(resolve(projectRoot, '.release/release.json'), 'utf8')) : undefined
const packedCLI = values['packed-cli'] || Boolean(candidate)
if (candidate) expect(candidate.source.version).toBe(registry.release)
const directory = await mkdtemp(resolve(tmpdir(), 'bbb-copy-consumer-'))
const src = resolve(directory, 'src')
await mkdir(src, { recursive: true })
console.log(`Independent consumer: ${directory}`)
let passed = false
let server
try {
  const lock = JSON.parse(await readFile(resolve(projectRoot, 'package-lock.json'), 'utf8'))
  const pkg = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'))
  const versions = names => Object.fromEntries(names.map(name => [name, lock.packages[`node_modules/${name}`].version]))
  await writeFile(resolve(directory, 'package.json'), JSON.stringify({ name: 'bbb-source-consumer-check', private: true, type: 'module',
    dependencies: versions(['react', 'react-dom', ...(packedCLI ? [] : Object.keys(pkg.dependencies))]),
    devDependencies: versions(['@types/react', '@types/react-dom', 'typescript', 'vite', '@vitejs/plugin-react']) }, null, 2))
  const run = (command, args) => execFileSync(command, args, { cwd: directory, stdio: 'inherit', env: { ...process.env, CI: '1' } })
  // Give init a real Vite entrypoint and imported app stylesheet to discover.
  await writeFile(resolve(src, 'main.tsx'), "import './index.css'\n")
  await writeFile(resolve(src, 'index.css'), '/* Consumer-owned global styles. */\n')
  await writeFile(resolve(directory, 'tsconfig.json'), '{}')
  if (packedCLI) {
    const tools = resolve(directory, 'installer')
    await mkdir(tools)
    let filename
    if (candidate) {
      filename = candidate.cli.tarball
      expect(basename(filename)).toBe(filename)
      expect(filename).toMatch(/\.tgz$/)
      const path = resolve(projectRoot, '.release', filename)
      expect(sha256(await readFile(path))).toBe(candidate.files[filename])
      await cp(path, resolve(tools, filename))
    } else {
      const [tarball] = JSON.parse(execFileSync('npm', ['pack', '--workspace', '@beepboopbit/ui', '--ignore-scripts', '--json', '--pack-destination', tools], { cwd: projectRoot, encoding: 'utf8' }))
      expect(tarball.files.every(file => /^(bin\/|src\/|LICENSE$|README.md$|package.json$)/.test(file.path))).toBe(true)
      expect(tarball.files.some(file => file.path === 'bin/bbb-ui.mjs')).toBe(true)
      filename = tarball.filename
    }
    await writeFile(resolve(tools, 'package.json'), '{"private":true}')
    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', resolve(tools, filename)], { cwd: tools, stdio: 'inherit' })
    const executable = resolve(tools, 'node_modules/@beepboopbit/ui/bin/bbb-ui.mjs')
    const cli = args => run(process.execPath, [executable, ...args, '--cwd', directory])
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'])
    cli(['init', '--registry', resolve(projectRoot, 'registry-dist'), '--dry-run'])
    expect(await readdir(directory)).not.toContain('bbb.json')
    cli(['init', '--registry', resolve(projectRoot, 'registry-dist')])
    cli(['add', ...registry.items.map(item => item.name)])
    const consumerPackage = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'))
    expect(consumerPackage.dependencies['@beepboopbit/ui']).toBeUndefined()
    for (const name of Object.keys(pkg.dependencies)) expect(consumerPackage.dependencies[name]).toBe(lock.packages[`node_modules/${name}`].version)
    expect(await readFile(resolve(src, 'index.css'), 'utf8')).toContain('@import "./bbb/foundations/styles.css";')
    console.log(`Packed CLI ${filename}: init, dry run, dependency installation, and ${registry.items.length} bundles passed${candidate ? ' using the staged release tarball' : ''}.`)
  }
  const entrypoints = new Set()
  for (const { name } of registry.items) {
    const bundle = JSON.parse(await readFile(resolve(projectRoot, 'registry-dist', registry.release, `${name}.json`), 'utf8'))
    if (!packedCLI) await copySource(bundle, resolve(src, 'bbb'))
    for (const entry of bundle.meta.bbb.entrypoints) if (/\.tsx?$/.test(entry)) entrypoints.add(entry)
  }
  // Baseline is copied for verification, but intentionally not imported.
  await cp(resolve(projectRoot, 'tests/copy/Consumer.tsx'), resolve(src, 'Consumer.tsx'))
  await cp(resolve(projectRoot, 'tests/copy/consumer.css'), resolve(src, 'consumer.css'))
  const entries = [...entrypoints]
  await writeFile(resolve(src, 'catalog.ts'), entries.map((entry, index) => `import * as Source${index} from './bbb/${entry.replace(/\.tsx?$/, '')}'`).join('\n') +
    `\nexport const copiedModuleCount = [${entries.map((_, index) => `Object.keys(Source${index})`).join(', ')}].length\n`)
  await writeFile(resolve(src, 'main.tsx'), "import './index.css'\nimport { createRoot } from 'react-dom/client'\nimport { Consumer } from './Consumer'\ncreateRoot(document.getElementById('root')!).render(<Consumer />)\n")
  await writeFile(resolve(directory, 'index.html'), '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>BBB source consumer</title></head><body><main id="root"></main><script type="module" src="/src/main.tsx"></script></body></html>')
  await writeFile(resolve(directory, 'vite.config.ts'), "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nexport default defineConfig({plugins:[react()]})\n")
  await writeFile(resolve(src, 'env.d.ts'), "declare module '*.css' {}\n")
  await writeFile(resolve(directory, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2023', lib: ['ES2023', 'DOM', 'DOM.Iterable'],
    module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, skipLibCheck: true, noEmit: true, verbatimModuleSyntax: true }, include: ['src'] }, null, 2))
  if (!packedCLI) run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'])
  run(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit'])
  run(process.execPath, ['node_modules/vite/bin/vite.js', 'build'])
  const port = await new Promise((resolvePort, reject) => {
    const socket = createServer()
    socket.on('error', reject)
    socket.listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(() => resolvePort(port)) })
  })
  const url = `http://127.0.0.1:${port}`
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: directory, stdio: 'pipe' })
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await fetch(url).then(response => response.ok).catch(() => false)) { ready = true; break }
    await setTimeout(100)
  }
  if (!ready) throw new Error('Independent consumer preview did not start.')
  const artifacts = resolve(projectRoot, '.copy-consumer/review')
  await mkdir(artifacts, { recursive: true })
  for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await browserType.launch()
    try {
      const page = await browser.newPage({ reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(url)
      await expect(page.getByText(`${entries.length} source modules loaded`)).toBeVisible()
      const host = await page.locator('#host-content').evaluate(element => ({ font: getComputedStyle(element).fontFamily, margin: getComputedStyle(document.body).margin,
        background: getComputedStyle(document.body).backgroundColor, box: getComputedStyle(element).boxSizing }))
      expect(host.margin).toBe('8px')
      expect(host.background).toBe('rgba(0, 0, 0, 0)')
      expect(host.box).toBe('content-box')
      await page.getByRole('button', { name: 'Save project', exact: true }).click()
      await expect(page.getByText('Enter a project name.')).toBeVisible()
      await page.getByRole('textbox', { name: 'Project name with a longer label' }).fill('Owned source')
      await page.getByRole('button', { name: 'Save project', exact: true }).click()
      await expect(page.getByRole('status')).toHaveText('Saved Owned source.')
      await page.getByRole('button', { name: /Priority/ }).focus()
      await page.keyboard.press('ArrowDown')
      await expect(page.getByRole('listbox')).toBeVisible()
      await page.keyboard.press('End')
      await page.keyboard.press('Enter')
      await expect(page.getByRole('button', { name: /Priority/ })).toContainText('High')
      await page.getByRole('tab', { name: 'Overview', exact: true }).focus()
      await page.keyboard.press('ArrowRight')
      await expect(page.getByRole('tabpanel')).toContainText('Details content')
      await page.getByRole('button', { name: 'Change appearance' }).click()
      await page.getByRole('button', { name: 'Change language' }).click()
      await page.getByRole('button', { name: 'Open copied dialog' }).click()
      const overlay = page.locator('.bbb-modal-overlay')
      await expect(overlay).toHaveAttribute('data-bbb-mode', 'dark')
      await expect(overlay).toHaveAttribute('dir', 'rtl')
      await expect(overlay).toHaveAttribute('lang', 'ar-EG')
      await page.keyboard.press('Escape')
      await expect(page.getByRole('button', { name: 'Open copied dialog' })).toBeFocused()
      for (const mode of ['dark', 'light']) {
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 })
          await page.evaluate(width => { document.documentElement.style.fontSize = width === 1440 ? '' : '200%' }, width)
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
          if (engine === 'chromium') await page.screenshot({ path: resolve(artifacts, `${mode}-${width}.png`), fullPage: true })
          await page.getByRole('button', { name: 'Open copied sheet' }).click()
          await page.setViewportSize({ width: width === 320 ? 390 : 320, height: 800 })
          await page.getByRole('button', { name: 'Done', exact: true }).focus()
          await page.keyboard.press('Enter')
          await expect(page.getByRole('button', { name: 'Open copied sheet' })).toBeFocused()
        }
        await page.getByRole('button', { name: 'Change appearance' }).click()
      }
      expect(errors).toEqual([])
      console.log(`Copied source: ${engine} keyboard, theme/RTL portals, and enlarged narrow layouts passed.`)
    } finally { await browser.close() }
  }
  // Editing the copied CSS and regenerating preset data must affect the consuming
  // app's custom brand as well as ordinary built-in CSS, without touching BBB.
  const tokensPath = resolve(src, 'bbb/foundations/tokens.css')
  const original = await readFile(tokensPath, 'utf8')
  await writeFile(tokensPath, original.replace('--bbb-brand-ember: #bd542f;', '--bbb-brand-ember: #123456;'))
  run(process.execPath, ['src/bbb/foundations/sync-tokens.mjs'])
  const originalButton = await readFile(resolve(src, 'bbb/components/Button/Button.tsx'), 'utf8')
  await writeFile(resolve(src, 'bbb/components/Button/Button.tsx'), originalButton.replace('      {...props}\n', '      {...props}\n      data-source-owned="true"\n'))
  run(process.execPath, ['node_modules/vite/bin/vite.js', 'build'])
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.goto(`${url}/?custom`)
    await expect(page.getByRole('button', { name: 'Save project', exact: true })).toHaveAttribute('data-source-owned', 'true')
    await expect(page.getByRole('button', { name: 'Save project', exact: true })).toHaveCSS('background-color', 'rgb(18, 52, 86)')
  } finally { await browser.close() }
  passed = true
  console.log('All bundles typechecked and built independently. Copied component and token edits verified.')
} finally {
  server?.kill()
  if (passed) await rm(directory, { recursive: true, force: true })
  else console.error(`Consumer files retained for diagnosis: ${directory}`)
}
