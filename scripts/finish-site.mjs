import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { projectRoot } from './registry.mjs'

// Explicit HTML entrypoints let Cloudflare serve
// deep links while keeping missing registry files and assets as real HTTP 404s.
const html = await readFile(resolve(projectRoot, 'dist/index.html'), 'utf8')
for (const [page, title, description] of [
  ['gallery', 'Gallery', 'Explore BBB design foundations, editable React components, and complete interface patterns.'],
  ['getting-started', 'Get started', 'Set up BBB in your React app, add components, and make the source your own.'],
  ['components/button', 'Button', 'Use the BBB Button component: examples, installation, variants, accessibility, and API reference.'],
]) {
  const target = resolve(projectRoot, `dist/${page}.html`)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, html.replace(/<title>.*?<\/title>/, `<title>${title} · BBB design system</title>`)
    .replace(/(name="description"\s+content=")[^"]*(")/, `$1${description}$2`))
}
