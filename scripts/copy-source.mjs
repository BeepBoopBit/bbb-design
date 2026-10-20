import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { copySource } from '../packages/cli/src/source.mjs'
export { copySource } from '../packages/cli/src/source.mjs'

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2)
  const paths = args.filter(arg => arg !== '--dry-run')
  if (paths.length !== 2 || args.some(arg => arg.startsWith('--') && arg !== '--dry-run')) throw new Error('Usage: node scripts/copy-source.mjs <bundle.json> <destination> [--dry-run]')
  const result = await copySource(JSON.parse(await readFile(resolve(paths[0]), 'utf8')), paths[1], { dryRun: args.includes('--dry-run') })
  console.log(`${args.includes('--dry-run') ? 'Would add' : 'Added'} ${result.added} files; reused ${result.reused}. BBB ${result.release}.`)
  if (result.dependencies.length) console.log(`In your app, install: npm install ${result.dependencies.join(' ')}`)
  console.log("Import the copied foundations/styles.css once. See docs/ADOPTION.md for setup and customization.")
}
