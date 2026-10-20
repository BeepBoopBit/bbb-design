import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { gzipSync } from 'node:zlib'
import { DEFAULT_REGISTRY_URL } from '../../packages/cli/src/config.mjs'
import { serializeRegistryArtifact } from '../../scripts/registry.mjs'
import { freezeSourceRelease, publishedArtifacts, readSourceRelease, sha256 } from '../../scripts/source-releases.mjs'
import { fileHashes, verifyRegistryDirectory, verifyReleaseFiles } from '../../scripts/prepare-release.mjs'

// Small registries isolate the release contract from component implementation.
const registry = (release = '1.0.0') => ({ release, gallery: [], items: [{ name: 'button', title: 'Button', files: [], meta: { bbb: { release, hashes: {} } } }] })
async function sandbox(t) {
  const path = await mkdtemp(resolve(tmpdir(), 'bbb-release-'))
  t.after(() => rm(path, { recursive: true, force: true }))
  return path
}

test('freezing is repeatable and prevents modified, added, or removed artifacts under the same version', async t => {
  const directory = await sandbox(t)
  const original = registry()
  const lock = await freezeSourceRelease(original, directory)
  assert.equal(lock.registry, DEFAULT_REGISTRY_URL)
  const bytes = await readFile(resolve(directory, '1.0.0.json.gz'))
  assert.deepEqual(await freezeSourceRelease(original, directory), lock)
  for (const changed of [
    { ...original, items: [{ ...original.items[0], title: 'Edited button' }] },
    { ...original, items: [...original.items, { ...original.items[0], name: 'link' }] },
    { ...original, items: [] },
  ]) {
    await assert.rejects(freezeSourceRelease(changed, directory), /is frozen.*Bump the root package version/)
    await assert.rejects(publishedArtifacts(changed, { directory }), /is frozen/)
  }
  assert.deepEqual(await readFile(resolve(directory, '1.0.0.json.gz')), bytes)
})

test('a new release retains older versioned files and only advances discovery', async t => {
  const directory = await sandbox(t)
  await assert.rejects(publishedArtifacts(registry(), { directory, requireFrozen: true }), /not frozen/)
  await freezeSourceRelease(registry(), directory)
  await freezeSourceRelease(registry('1.1.0'), directory)
  const artifacts = await publishedArtifacts(registry('1.1.0'), { directory, requireFrozen: true })
  assert.equal(artifacts.get('manifest.json').release, '1.1.0')
  assert.equal(artifacts.get('1.0.0/button.json').meta.bbb.release, '1.0.0')
  assert.equal(artifacts.get('1.1.0/button.json').meta.bbb.release, '1.1.0')
  assert.equal(artifacts.has('1.0.0/manifest.json'), true)
})

test('corrupted archives and checksums are rejected before publication', async t => {
  const directory = await sandbox(t)
  await freezeSourceRelease(registry(), directory)
  const path = resolve(directory, '1.0.0.json.gz')
  const bytes = await readFile(path)
  await writeFile(path, Buffer.concat([bytes, Buffer.from('corrupt')]))
  await assert.rejects(readSourceRelease('1.0.0', directory), /Invalid frozen source release/)
  await writeFile(path, bytes)
  const lockPath = resolve(directory, '1.0.0.json')
  const lock = JSON.parse(await readFile(lockPath, 'utf8'))
  lock.artifacts['1.0.0/button.json'] = 'incorrect checksum'
  await writeFile(lockPath, JSON.stringify(lock))
  await assert.rejects(publishedArtifacts(registry('1.1.0'), { directory }), /checksum differs/)
})

test('even a checksummed archive cannot supply paths outside its version directory', async t => {
  const directory = await sandbox(t)
  const lock = await freezeSourceRelease(registry(), directory)
  const frozen = await readSourceRelease('1.0.0', directory)
  const artifacts = Object.fromEntries(frozen.artifacts)
  artifacts['1.0.0/../../escape.json'] = { content: 'bad' }
  lock.artifacts['1.0.0/../../escape.json'] = sha256(serializeRegistryArtifact(artifacts['1.0.0/../../escape.json']))
  const archive = gzipSync(JSON.stringify({ schemaVersion: 1, release: '1.0.0', artifacts }))
  lock.archiveSHA256 = sha256(archive)
  await writeFile(resolve(directory, '1.0.0.json'), JSON.stringify(lock))
  await writeFile(resolve(directory, '1.0.0.json.gz'), archive)
  await assert.rejects(readSourceRelease('1.0.0', directory), /checksum differs/)
})

test('staged registry verification catches stale or altered generated files', async t => {
  const directory = await sandbox(t)
  const artifacts = new Map([['manifest.json', { release: '1.0.0' }]])
  await writeFile(resolve(directory, 'manifest.json'), serializeRegistryArtifact(artifacts.get('manifest.json')))
  await verifyRegistryDirectory(artifacts, directory)
  await writeFile(resolve(directory, 'removed-item.json'), '{}')
  await assert.rejects(verifyRegistryDirectory(artifacts, directory), /Registry files differ/)
  await rm(resolve(directory, 'removed-item.json'))
  await writeFile(resolve(directory, 'manifest.json'), '{}')
  await assert.rejects(verifyRegistryDirectory(artifacts, directory), /Registry files differ/)
})

test('deployment verification rejects changed candidate files and unexpected additions', async t => {
  const directory = await sandbox(t)
  await writeFile(resolve(directory, 'index.html'), '<html>Checked candidate</html>')
  const manifest = { schemaVersion: 1, site: 'https://ui.beepboopbit.com', registry: DEFAULT_REGISTRY_URL, files: await fileHashes(directory) }
  await writeFile(resolve(directory, 'release.json'), JSON.stringify(manifest))
  await verifyReleaseFiles(directory)
  await writeFile(resolve(directory, 'index.html'), '<html>Changed after review</html>')
  await assert.rejects(verifyReleaseFiles(directory), /Release files changed after preparation/)
  await writeFile(resolve(directory, 'index.html'), '<html>Checked candidate</html>')
  await writeFile(resolve(directory, 'unexpected.txt'), 'Unexpected file')
  await assert.rejects(verifyReleaseFiles(directory), /Release files changed after preparation/)
})
