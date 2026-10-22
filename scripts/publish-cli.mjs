import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { CLI_NAME, CLI_VERSION } from '../packages/cli/src/config.mjs'
import { verifyReleaseFiles } from './prepare-release.mjs'
import { projectRoot } from './registry.mjs'

const npmRegistry = 'https://registry.npmjs.org/'

async function publishedPackage(cli, registryFetch) {
  const url = new URL(`${encodeURIComponent(cli.name)}/${encodeURIComponent(cli.version)}`, npmRegistry)
  const response = await registryFetch(url, { headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15000) })
  if (response.status === 404) return undefined
  assert.equal(response.status, 200, `npm registry lookup failed: HTTP ${response.status}. Publication was not assumed safe.`)
  const metadata = await response.json()
  assert.equal(metadata.name, cli.name)
  assert.equal(metadata.version, cli.version)
  assert.equal(metadata.dist?.integrity, cli.integrity, `${cli.name}@${cli.version} already exists with different contents. Bump the CLI package version and prepare a new release.`)
  return metadata
}

export async function publishCLI({ directory = resolve(projectRoot, '.release'), dryRun = false, verifyOnly = false, registryFetch = fetch,
  wait = setTimeout, verificationAttempts = 61,
  run = args => execFileSync('npm', args, { cwd: projectRoot, stdio: 'inherit' }) } = {}) {
  assert.ok(!(dryRun && verifyOnly), 'Choose either --dry-run or --verify-only.')
  const { cli } = await verifyReleaseFiles(directory)
  assert.equal(cli.name, CLI_NAME)
  assert.equal(cli.version, CLI_VERSION)
  assert.equal(cli.tarball, `beepboopbit-ui-${CLI_VERSION}.tgz`)
  const tarball = resolve(directory, cli.tarball)
  assert.equal(`sha512-${createHash('sha512').update(await readFile(tarball)).digest('base64')}`, cli.integrity, 'CLI tarball differs from its recorded npm integrity.')

  if (await publishedPackage(cli, registryFetch)) {
    console.log(`${cli.name}@${cli.version} is already published with the checked integrity; skipping publication.`)
    return verifyOnly ? { published: false, verified: true } : { published: false }
  }

  const tag = cli.version.includes('-') ? 'next' : 'latest'
  if (!verifyOnly) {
    run(['publish', tarball, '--access', 'public', '--registry', npmRegistry, '--tag', tag, '--ignore-scripts', ...(dryRun ? ['--dry-run'] : [])])
    if (dryRun) return { published: false, dryRun: true }
    console.log('npm accepted publication. Waiting for the package to become publicly available before verifying integrity.')
  }

  for (let attempt = 1; ; attempt++) {
    if (await publishedPackage(cli, registryFetch)) break
    if (attempt >= verificationAttempts) throw new Error(`${cli.name}@${cli.version} is still not publicly available for integrity verification. An accepted publication may still be processing. Check its status on npm, then run node scripts/publish-cli.mjs --verify-only to continue checking without publishing again.`)
    if (attempt === 1 || attempt % 6 === 0) console.log(`${cli.name}@${cli.version} is not publicly available yet; checking again in 5 seconds (${attempt}/${verificationAttempts}).`)
    await wait(5000)
  }
  console.log(`${verifyOnly ? 'Verified' : 'Published and verified'} ${cli.name}@${cli.version} (${tag}) against the checked tarball.`)
  return verifyOnly ? { published: false, verified: true } : { published: true }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean' }, 'verify-only': { type: 'boolean' } } })
  await publishCLI({ dryRun: values['dry-run'], verifyOnly: values['verify-only'] })
}
