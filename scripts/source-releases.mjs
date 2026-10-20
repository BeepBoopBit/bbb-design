import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import { createRegistry, registryArtifacts, serializeRegistryArtifact } from './registry.mjs'
import { DEFAULT_REGISTRY_URL } from '../packages/cli/src/config.mjs'

export const releaseDirectory = fileURLToPath(new URL('../releases/source/', import.meta.url))
export const sha256 = data => createHash('sha256').update(data).digest('hex')
const versionPattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/
const artifactPattern = /^[a-z][a-z0-9-]*\.json$/

export function versionedArtifacts(registry) {
  if (!versionPattern.test(registry.release)) throw new Error(`Invalid source release version: ${registry.release}`)
  return new Map([...registryArtifacts(registry)].filter(([name]) => name.startsWith(`${registry.release}/`)))
}

export async function readSourceRelease(version, directory = releaseDirectory) {
  if (!versionPattern.test(version)) throw new Error(`Invalid source release version: ${version}`)
  const lock = JSON.parse(await readFile(resolve(directory, `${version}.json`), 'utf8'))
  const archive = await readFile(resolve(directory, `${version}.json.gz`))
  if (lock.schemaVersion !== 1 || lock.release !== version || lock.registry !== DEFAULT_REGISTRY_URL || lock.archiveSHA256 !== sha256(archive) ||
      !lock.artifacts || typeof lock.artifacts !== 'object' || Array.isArray(lock.artifacts)) throw new Error(`Invalid frozen source release: ${version}`)
  const stored = JSON.parse(gunzipSync(archive, { maxOutputLength: 100 * 1024 * 1024 }).toString('utf8'))
  if (stored.schemaVersion !== 1 || stored.release !== version || !stored.artifacts || typeof stored.artifacts !== 'object' || Array.isArray(stored.artifacts)) throw new Error(`Invalid source archive: ${version}`)
  const artifacts = new Map()
  if (JSON.stringify(Object.keys(stored.artifacts).sort()) !== JSON.stringify(Object.keys(lock.artifacts).sort())) throw new Error(`Frozen artifact list differs: ${version}`)
  for (const [name, data] of Object.entries(stored.artifacts)) {
    if (!name.startsWith(`${version}/`) || !artifactPattern.test(name.slice(version.length + 1)) || sha256(serializeRegistryArtifact(data)) !== lock.artifacts[name]) throw new Error(`Frozen source checksum differs: ${name}`)
    artifacts.set(name, data)
  }
  if (!artifacts.has(`${version}/manifest.json`) || !artifacts.has(`${version}/registry.json`)) throw new Error(`Incomplete source archive: ${version}`)
  return { lock, artifacts }
}

export function assertSourceMatches(registry, frozen) {
  const current = Object.fromEntries([...versionedArtifacts(registry)].map(([name, data]) => [name, sha256(serializeRegistryArtifact(data))]))
  const expected = frozen.lock.artifacts
  const changed = [...new Set([...Object.keys(current), ...Object.keys(expected)])].filter(name => current[name] !== expected[name])
  if (changed.length) throw new Error(`Source release ${registry.release} is frozen. Changed artifacts: ${changed.slice(0, 5).join(', ')}. Bump the root package version and freeze a new release; existing releases cannot be replaced.`)
}

export async function frozenVersions(directory = releaseDirectory) {
  const names = await readdir(directory).catch(error => { if (error.code === 'ENOENT') return []; throw error })
  return names.filter(name => name.endsWith('.json')).map(name => name.slice(0, -5)).sort()
}

export async function publishedArtifacts(registry, { directory = releaseDirectory, requireFrozen = false } = {}) {
  const artifacts = new Map()
  let frozenCurrent = false
  for (const version of await frozenVersions(directory)) {
    const frozen = await readSourceRelease(version, directory)
    if (version === registry.release) { assertSourceMatches(registry, frozen); frozenCurrent = true }
    for (const entry of frozen.artifacts) artifacts.set(...entry)
  }
  if (requireFrozen && !frozenCurrent) throw new Error(`Source release ${registry.release} is not frozen. Run npm run release:freeze after reviewing its contents.`)
  for (const entry of registryArtifacts(registry)) artifacts.set(...entry)
  return artifacts
}

export async function freezeSourceRelease(registry, directory = releaseDirectory) {
  if ((await frozenVersions(directory)).includes(registry.release)) {
    const frozen = await readSourceRelease(registry.release, directory)
    assertSourceMatches(registry, frozen)
    return frozen.lock
  }
  const artifacts = versionedArtifacts(registry)
  const archive = gzipSync(JSON.stringify({ schemaVersion: 1, release: registry.release, artifacts: Object.fromEntries(artifacts) }), { level: 9 })
  const lock = { schemaVersion: 1, release: registry.release, registry: DEFAULT_REGISTRY_URL, archiveSHA256: sha256(archive),
    artifacts: Object.fromEntries([...artifacts].map(([name, data]) => [name, sha256(serializeRegistryArtifact(data))])) }
  await mkdir(directory, { recursive: true })
  const archivePath = resolve(directory, `${registry.release}.json.gz`)
  await writeFile(archivePath, archive, { flag: 'wx' })
  try { await writeFile(resolve(directory, `${registry.release}.json`), `${JSON.stringify(lock, null, 2)}\n`, { flag: 'wx' }) }
  catch (error) { await unlink(archivePath); throw error }
  return lock
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const registry = await createRegistry({ checkTokens: true })
  const lock = await freezeSourceRelease(registry)
  console.log(`Frozen source ${lock.release}: ${Object.keys(lock.artifacts).length} versioned artifacts for ${lock.registry}`)
}
