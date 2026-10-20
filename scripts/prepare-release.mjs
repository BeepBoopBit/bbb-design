import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { CLI_NAME, CLI_VERSION, DEFAULT_REGISTRY_URL, SITE_URL } from '../packages/cli/src/config.mjs'
import { createRegistry, projectRoot, serializeRegistryArtifact } from './registry.mjs'
import { publishedArtifacts, releaseDirectory, sha256 } from './source-releases.mjs'

export async function fileHashes(directory) {
  const hashes = {}
  for (const entry of (await readdir(directory, { recursive: true, withFileTypes: true })).sort((a, b) => resolve(a.parentPath, a.name).localeCompare(resolve(b.parentPath, b.name)))) {
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink in release: ${entry.name}`)
    if (!entry.isFile()) continue
    const path = resolve(entry.parentPath, entry.name)
    hashes[relative(directory, path).replaceAll('\\', '/')] = sha256(await readFile(path))
  }
  return hashes
}

export async function verifyRegistryDirectory(artifacts, directory) {
  const expected = Object.fromEntries([...artifacts].map(([path, data]) => [path, sha256(serializeRegistryArtifact(data))]))
  assert.deepEqual(await fileHashes(directory), expected, `Registry files differ from the frozen source: ${directory}`)
}

export async function verifyReleaseFiles(directory) {
  const manifest = JSON.parse(await readFile(resolve(directory, 'release.json'), 'utf8'))
  assert.equal(manifest.schemaVersion, 1)
  assert.equal(manifest.site, SITE_URL)
  assert.equal(manifest.registry, DEFAULT_REGISTRY_URL)
  const actual = await fileHashes(directory)
  delete actual['release.json']
  assert.deepEqual(actual, manifest.files, 'Release files changed after preparation. Run npm run release:prepare and repeat its checks.')
  return manifest
}

export function verifyPackage(metadata, packed) {
  assert.equal(metadata.name, '@beepboopbit/ui')
  assert.equal(metadata.private, undefined)
  assert.equal(metadata.homepage, 'https://ui.beepboopbit.com')
  assert.equal(metadata.publishConfig?.access, 'public')
  assert.equal(metadata.publishConfig?.registry, 'https://registry.npmjs.org/')
  assert.equal(metadata.engines?.node, '>=24')
  assert.equal(metadata.bin?.['bbb-ui'], 'bin/bbb-ui.mjs')
  assert.equal(metadata.exports, undefined, 'The CLI must not become a component library.')
  assert.equal(metadata.main, undefined)
  assert.equal(metadata.license, 'MIT')
  assert.equal(packed.name, metadata.name)
  assert.equal(packed.version, metadata.version)
  assert.ok(packed.integrity?.startsWith('sha512-'))
  for (const file of packed.files) assert.match(file.path, /^(?:package\.json|LICENSE|README\.md|(?:bin|src)\/[\w/-]+\.mjs)$/, `Unexpected packed file: ${file.path}`)
  for (const path of ['package.json', 'LICENSE', 'README.md', 'bin/bbb-ui.mjs', 'src/config.mjs', 'src/cli.mjs', 'src/source.mjs']) assert.ok(packed.files.some(file => file.path === path), `Missing packed file: ${path}`)
  assert.ok(packed.files.find(file => file.path === 'bin/bbb-ui.mjs').mode & 0o111, 'The CLI bin must be executable.')
}

export async function stageRelease() {
  const registry = await createRegistry({ checkTokens: true })
  const artifacts = await publishedArtifacts(registry, { requireFrozen: true })
  await verifyRegistryDirectory(artifacts, resolve(projectRoot, 'dist/r'))
  await verifyRegistryDirectory(artifacts, resolve(projectRoot, 'registry-dist'))
  const rootPackage = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'))
  assert.equal(rootPackage.private, true)
  assert.equal(rootPackage.exports, undefined)
  const metadata = JSON.parse(await readFile(resolve(projectRoot, 'packages/cli/package.json'), 'utf8'))
  assert.equal(await readFile(resolve(projectRoot, 'packages/cli/LICENSE'), 'utf8'), await readFile(resolve(projectRoot, 'LICENSE'), 'utf8'))
  const output = resolve(projectRoot, '.release')
  await rm(output, { recursive: true, force: true })
  await mkdir(output, { recursive: true })
  const [packed] = JSON.parse(execFileSync('npm', ['pack', '--workspace', CLI_NAME, '--ignore-scripts', '--json', '--pack-destination', output], { cwd: projectRoot, encoding: 'utf8' }))
  verifyPackage(metadata, packed)
  await cp(resolve(projectRoot, 'dist'), resolve(output, 'site'), { recursive: true })
  await cp(releaseDirectory, resolve(output, 'source'), { recursive: true })
  const hosting = JSON.parse(await readFile(resolve(projectRoot, 'wrangler.jsonc'), 'utf8'))
  hosting.assets.directory = './site'
  // Keep the deployment configuration inside the candidate and its hash list.
  await writeFile(resolve(output, 'wrangler.jsonc'), `${JSON.stringify(hosting, null, 2)}\n`)
  const manifest = {
    schemaVersion: 1,
    site: SITE_URL,
    registry: DEFAULT_REGISTRY_URL,
    source: { version: registry.release, bundles: registry.items.length, artifacts: artifacts.size },
    cli: { name: CLI_NAME, version: CLI_VERSION, tarball: packed.filename, integrity: packed.integrity },
    files: await fileHashes(output),
  }
  await writeFile(resolve(output, 'release.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Prepared source ${registry.release} and ${CLI_NAME}@${CLI_VERSION} in .release/ (not published).`)
  return manifest
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  for (const task of ['lint', 'test:registry', 'test:cli', 'test:release', 'build', 'build:registry']) {
    execFileSync('npm', ['run', task], { cwd: projectRoot, stdio: 'inherit' })
  }
  await stageRelease()
}
