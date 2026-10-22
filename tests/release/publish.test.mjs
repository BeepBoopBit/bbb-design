import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { CLI_NAME, CLI_VERSION, DEFAULT_REGISTRY_URL, SITE_URL } from '../../packages/cli/src/config.mjs'
import { fileHashes } from '../../scripts/prepare-release.mjs'
import { publishCLI } from '../../scripts/publish-cli.mjs'

async function candidate(t) {
  const directory = await mkdtemp(resolve(tmpdir(), 'bbb-publish-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const tarball = `beepboopbit-ui-${CLI_VERSION}.tgz`
  const bytes = Buffer.from('Checked tarball fixture')
  await writeFile(resolve(directory, tarball), bytes)
  const cli = { name: CLI_NAME, version: CLI_VERSION, tarball, integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}` }
  const manifest = { schemaVersion: 1, site: SITE_URL, registry: DEFAULT_REGISTRY_URL, cli, files: await fileHashes(directory) }
  await writeFile(resolve(directory, 'release.json'), JSON.stringify(manifest))
  const published = { name: cli.name, version: cli.version, dist: { integrity: cli.integrity } }
  return { directory, cli, published, manifest }
}

test('publishes the checked tarball only for a missing version, then verifies npm integrity', async t => {
  const { directory, cli, published } = await candidate(t)
  const commands = []
  const lookups = []
  const registryFetch = async url => {
    lookups.push(String(url))
    return commands.length ? Response.json(published) : new Response('', { status: 404 })
  }
  assert.deepEqual(await publishCLI({ directory, registryFetch, run: args => commands.push(args) }), { published: true })
  assert.deepEqual(commands, [['publish', resolve(directory, cli.tarball), '--access', 'public', '--registry', 'https://registry.npmjs.org/', '--tag', 'latest', '--ignore-scripts']])
  assert.deepEqual(lookups, Array(2).fill(`https://registry.npmjs.org/${encodeURIComponent(CLI_NAME)}/${CLI_VERSION}`))
})

test('reruns and source-only releases skip a CLI version with identical integrity', async t => {
  const { directory, published } = await candidate(t)
  assert.deepEqual(await publishCLI({ directory, registryFetch: async () => Response.json(published),
    run: () => assert.fail('An existing version must not be published again') }), { published: false })
})

test('an existing version with different contents requires a CLI version bump', async t => {
  const { directory, published } = await candidate(t)
  published.dist.integrity = 'sha512-different'
  await assert.rejects(publishCLI({ directory, registryFetch: async () => Response.json(published),
    run: () => assert.fail('Conflicting bytes must not be published') }), /already exists with different contents.*Bump the CLI/)
})

test('authentication, rate limit, and server errors cannot be mistaken for a missing version', async t => {
  const { directory } = await candidate(t)
  for (const status of [401, 403, 429, 500]) {
    await assert.rejects(publishCLI({ directory, registryFetch: async () => new Response('', { status }),
      run: () => assert.fail('Failed npm lookup must block publishing') }), /npm registry lookup failed/)
  }
  await assert.rejects(publishCLI({ directory, registryFetch: async () => { throw new Error('Network unavailable') },
    run: () => assert.fail('Network errors must block publishing') }), /Network unavailable/)
})

test('changed release files and altered integrity metadata block publication before a registry request', async t => {
  const { directory, cli, manifest } = await candidate(t)
  const path = resolve(directory, cli.tarball)
  const bytes = await readFile(path)
  const options = { directory, registryFetch: () => assert.fail('Invalid candidates must not reach npm'), run: () => assert.fail('Invalid candidates must not be published') }
  await writeFile(path, 'Changed after review')
  await assert.rejects(publishCLI(options), /Release files changed/)
  await writeFile(path, bytes)
  manifest.cli.integrity = 'sha512-altered'
  await writeFile(resolve(directory, 'release.json'), JSON.stringify(manifest))
  await assert.rejects(publishCLI(options), /tarball differs from its recorded npm integrity/)
})

test('dry run invokes npm without publishing and does not wait for a public version', async t => {
  const { directory } = await candidate(t)
  const commands = []
  assert.deepEqual(await publishCLI({ directory, dryRun: true, registryFetch: async () => new Response('', { status: 404 }),
    run: args => commands.push(args) }), { published: false, dryRun: true })
  assert.equal(commands.length, 1)
  assert.equal(commands[0].at(-1), '--dry-run')
})

test('npm publication failure propagates without being treated as a successful release', async t => {
  const { directory } = await candidate(t)
  await assert.rejects(publishCLI({ directory, registryFetch: async () => new Response('', { status: 404 }),
    run: () => { throw new Error('npm publish failed') } }), /npm publish failed/)
})

test('accepted publications can take several minutes to appear without being submitted again', async t => {
  const { directory, published } = await candidate(t)
  let commands = 0
  let elapsed = 0
  const result = await publishCLI({ directory,
    registryFetch: async () => elapsed >= 120000 ? Response.json(published) : new Response('', { status: 404 }),
    run: () => { commands++ }, wait: async delay => { elapsed += delay } })
  assert.deepEqual(result, { published: true })
  assert.equal(commands, 1)
  assert.equal(elapsed, 120000)
})

test('verify-only waits for a pending package and never runs npm publish', async t => {
  const { directory, published } = await candidate(t)
  let elapsed = 0
  assert.deepEqual(await publishCLI({ directory, verifyOnly: true,
    registryFetch: async () => elapsed >= 15000 ? Response.json(published) : new Response('', { status: 404 }),
    wait: async delay => { elapsed += delay }, run: () => assert.fail('Verification must not publish') }), { published: false, verified: true })
  assert.equal(elapsed, 15000)
})

test('processing timeout recommends verification without claiming that publication was rejected', async t => {
  const { directory } = await candidate(t)
  let commands = 0
  let elapsed = 0
  await assert.rejects(publishCLI({ directory, registryFetch: async () => new Response('', { status: 404 }),
    run: () => { commands++ }, wait: async delay => { elapsed += delay } }), /accepted publication may still be processing.*--verify-only/)
  assert.equal(commands, 1)
  assert.equal(elapsed, 300000)
})

test('verify-only checks integrity and rejects contradictory dry-run options', async t => {
  const { directory, published } = await candidate(t)
  const run = () => assert.fail('Verification must not publish')
  assert.deepEqual(await publishCLI({ directory, verifyOnly: true, registryFetch: async () => Response.json(published), run }), { published: false, verified: true })
  published.dist.integrity = 'sha512-different'
  await assert.rejects(publishCLI({ directory, verifyOnly: true, registryFetch: async () => Response.json(published), run }), /different contents/)
  await assert.rejects(publishCLI({ directory, verifyOnly: true, dryRun: true, run }), /Choose either/)
})
