import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, posix, resolve } from 'node:path'
import test from 'node:test'
import { createRegistry, moduleReferences, registryArtifacts } from '../../scripts/registry.mjs'
import { copySource } from '../../scripts/copy-source.mjs'
import { tokenModule } from '../../src/foundations/sync-tokens.mjs'

const registry = await createRegistry({ checkTokens: true })
const item = name => registry.items.find(item => item.name === name)

test('every bundle resolves its own imports and declares its runtime packages', () => {
  for (const bundle of registry.items) {
    for (const dependency of bundle.dependencies) assert.match(dependency, /@\d+\.\d+\.\d+$/, `Unpinned runtime dependency: ${dependency}`)
    const paths = new Set(bundle.files.map(file => file.target.slice(2)))
    const targets = new Set()
    assert.equal(bundle.files.length, Object.keys(bundle.meta.bbb.hashes).length, bundle.name)
    for (const file of bundle.files) {
      assert.ok(!targets.has(file.target), `Duplicate target in ${bundle.name}: ${file.target}`)
      targets.add(file.target)
      assert.equal(createHash('sha256').update(file.content).digest('hex'), bundle.meta.bbb.hashes[file.target])
      for (const ref of moduleReferences(file.target, file.content)) {
        assert.ok(!ref.specifier.includes('?'), `Bundler loader in ${bundle.name}: ${ref.specifier}`)
        if (ref.specifier.startsWith('.')) {
          const path = posix.normalize(posix.join(dirname(file.target.slice(2)), ref.specifier))
          assert.ok([path, `${path}.ts`, `${path}.tsx`].some(path => paths.has(path)), `${bundle.name}: missing ${ref.specifier} from ${file.target}`)
        } else {
          assert.notEqual(ref.specifier, 'bbb-design')
          const name = ref.specifier.startsWith('@') ? ref.specifier.split('/').slice(0, 2).join('/') : ref.specifier.split('/')[0]
          assert.ok(['react', 'react-dom'].includes(name) || bundle.dependencies.some(dependency => dependency.startsWith(`${name}@`)), `${bundle.name}: undeclared ${name}`)
        }
      }
    }
    assert.ok(paths.has('src/bbb/LICENSE'))
    assert.ok(paths.has('src/bbb/LICENSE-LUCIDE'))
    assert.ok(paths.has('src/bbb/foundations/styles.css'))
    for (const path of bundle.meta.bbb.entrypoints) assert.ok(paths.has(`src/bbb/${path}`), `${bundle.name}: missing entrypoint ${path}`)
  }
})

test('simple components omit the app baseline and demo source; overlays include their theme and locale dependencies', () => {
  assert.ok(!item('button').files.some(file => /baseline.css|pages\/Gallery/.test(file.path)))
  assert.ok(item('baseline').files.some(file => file.path.endsWith('baseline.css')))
  for (const name of ['select', 'dialog', 'sheet']) {
    const files = item(name).files.map(file => file.path)
    assert.ok(files.includes('src/components/ThemeProvider/theme.ts'), name)
    assert.ok(files.includes('src/components/LocaleProvider/locale.ts'), name)
    assert.ok(files.includes('src/foundations/sync-tokens.mjs'), name)
  }
})

test('catalog artifacts use the same release and complete bundle hashes as Gallery', () => {
  const artifacts = registryArtifacts(registry)
  const manifest = artifacts.get('manifest.json')
  assert.deepEqual(manifest.gallery, registry.gallery)
  for (const name of Object.values(manifest.gallery)) {
    const bundle = artifacts.get(`${manifest.release}/${name}.json`)
    assert.ok(bundle, name)
    assert.equal(bundle.meta.bbb.release, manifest.release)
    assert.deepEqual(manifest.items.find(item => item.name === name).hashes, bundle.meta.bbb.hashes)
  }
})

test('preset data tracks CSS edits and retains mode aliases without requiring a raw loader', async () => {
  const css = await readFile(new URL('../../src/foundations/tokens.css', import.meta.url), 'utf8')
  const before = tokenModule(css)
  const edited = tokenModule(css.replace('--bbb-brand-ember: #bd542f;', '--bbb-brand-ember: #123456;'))
  assert.notEqual(before, edited)
  assert.ok(edited.includes('"--bbb-brand-ember": "#123456"'))
  assert.ok(edited.includes('"--bbb-color-accent": "var(--bbb-brand-ember)"'))
  assert.ok(!item('brand-tools').files.some(file => file.content.includes('tokens.css?raw')))
})

test('copy planning is repeatable, creates nothing on dry run, and preserves locally edited files', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'bbb-registry-'))
  const target = resolve(temporary, 'app')
  try {
    const dry = await copySource(item('button'), target, { dryRun: true })
    assert.ok(dry.added > 0)
    await assert.rejects(stat(target), { code: 'ENOENT' })
    const first = await copySource(item('button'), target)
    assert.equal(first.added, dry.added)
    const second = await copySource(item('button'), target)
    assert.equal(second.added, 0)
    assert.equal(second.reused, first.added)
    const file = resolve(target, 'components/Button/Button.tsx')
    await writeFile(file, 'my edited button')
    await assert.rejects(copySource(item('dialog'), target), /Preserved existing file/)
    assert.equal(await readFile(file, 'utf8'), 'my edited button')
    await assert.rejects(stat(resolve(target, 'components/Dialog/Dialog.tsx')), { code: 'ENOENT' })
  } finally { await rm(temporary, { recursive: true, force: true }) }
})

test('copy rejects mixed releases, invalid checksums, escaping paths, and symbolic links', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'bbb-registry-'))
  const target = resolve(temporary, 'app')
  try {
    await copySource(item('button'), target)
    const changed = structuredClone(item('button'))
    changed.meta.bbb.release = 'another-release'
    await assert.rejects(copySource(changed, target), /another BBB release/)
    const tampered = structuredClone(item('button'))
    tampered.files[0].content += '\nchanged'
    await assert.rejects(copySource(tampered, target), /checksum/)
    const escaping = structuredClone(item('button'))
    escaping.files[0].target = '~/src/bbb/../../outside.ts'
    await assert.rejects(copySource(escaping, target), /Invalid file path/)
    const file = resolve(target, 'components/Button/Button.tsx')
    await rm(file)
    await symlink(resolve(temporary, 'elsewhere.ts'), file)
    await assert.rejects(copySource(item('button'), target), /symbolic link/)
  } finally { await rm(temporary, { recursive: true, force: true }) }
})
