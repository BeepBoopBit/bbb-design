import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { projectRoot } from './registry.mjs'
import { verifyReleaseFiles } from './prepare-release.mjs'

const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean' } } })
await verifyReleaseFiles(resolve(projectRoot, '.release'))
if (!values['dry-run']) {
  for (const name of ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN']) {
    if (!process.env[name]?.trim()) throw new Error(`Set ${name} for deployment. GitHub Actions reads it from repository secrets.`)
  }
}
// Wrangler writes its own state beside its config. Keep that outside the
// checked candidate so a preview, dry run, or upload cannot change its files.
const temporary = await mkdtemp(resolve(tmpdir(), 'bbb-cloudflare-'))
try {
  const configuration = JSON.parse(await readFile(resolve(projectRoot, '.release/wrangler.jsonc'), 'utf8'))
  configuration.assets.directory = resolve(projectRoot, '.release/site')
  const path = resolve(temporary, 'wrangler.jsonc')
  await writeFile(path, JSON.stringify(configuration))
  execFileSync(process.execPath, [resolve(projectRoot, 'node_modules/wrangler/bin/wrangler.js'), 'deploy',
    '--config', path, ...(values['dry-run'] ? ['--dry-run'] : [])], {
    cwd: projectRoot, stdio: 'inherit', env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  })
} finally { await rm(temporary, { recursive: true, force: true }) }
