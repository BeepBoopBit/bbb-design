import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { projectRoot } from './registry.mjs'

// These are the app's two routes. Explicit HTML entrypoints let Cloudflare serve
// deep links while keeping missing registry files and assets as real HTTP 404s.
for (const page of ['gallery', 'getting-started']) {
  await copyFile(resolve(projectRoot, 'dist/index.html'), resolve(projectRoot, `dist/${page}.html`))
}
