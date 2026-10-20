import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { setTimeout } from 'node:timers/promises'
import { projectRoot } from './registry.mjs'
import { verifyReleaseFiles } from './prepare-release.mjs'
import { sha256 } from './source-releases.mjs'

export async function verifyHostedRelease(baseURL, directory = resolve(projectRoot, '.release')) {
  const manifest = await verifyReleaseFiles(directory)
  const files = Object.entries(manifest.files).filter(([path]) => path.startsWith('site/') && path !== 'site/_headers')
  for (let offset = 0; offset < files.length; offset += 8) {
    await Promise.all(files.slice(offset, offset + 8).map(async ([file, hash]) => {
      const path = file.slice('site'.length)
      // Cloudflare redirects .html URLs to their extensionless canonical paths.
      const url = new URL(path === '/index.html' ? '/' : path.replace(/\.html$/, ''), baseURL)
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
      assert.equal(response.status, 200, `HTTP ${response.status}: ${url.pathname}`)
      assert.equal(sha256(Buffer.from(await response.arrayBuffer())), hash, `Deployed bytes differ: ${url.pathname}`)
      const cache = response.headers.get('cache-control') ?? ''
      if (path.startsWith('/assets/') || /^\/r\/[^/]+\//.test(path)) assert.match(cache, /max-age=31536000.*immutable/, `Immutable cache missing: ${path}`)
      if (path === '/r/manifest.json' || path.endsWith('.html')) {
        assert.doesNotMatch(cache, /immutable/, `Mutable content cached forever: ${path}`)
        assert.match(cache, /no-cache|max-age=0/, `Revalidation missing: ${path}`)
      }
      if (path.startsWith('/r/')) assert.match(response.headers.get('content-type') ?? '', /application\/json/)
    }))
  }
  for (const path of ['/r/not-a-release/manifest.json', '/r/missing.json', '/assets/missing.js', '/missing-page', '/_headers']) {
    const response = await fetch(new URL(path, baseURL), { headers: { 'Sec-Fetch-Mode': 'navigate', Accept: 'text/html' }, signal: AbortSignal.timeout(15000) })
    assert.equal(response.status, 404, `Missing file must return HTTP 404: ${path}`)
    assert.doesNotMatch(await response.text(), /<html|id="root"/i, `Missing file returned the app shell: ${path}`)
  }
  return { files: files.length, source: manifest.source.version }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const { values } = parseArgs({ options: { url: { type: 'string' } } })
  const manifest = await verifyReleaseFiles(resolve(projectRoot, '.release'))
  const url = values.url ?? manifest.site
  for (let attempt = 1; ; attempt++) {
    try {
      const result = await verifyHostedRelease(url)
      console.log(`Verified ${result.files} hosted files, source ${result.source}, caching, and missing-file responses at ${new URL(url).origin}.`)
      break
    } catch (error) {
      if (attempt === 12) throw error
      console.log(`Hosting verification ${attempt}/12: ${error.message}. Retrying in 5 seconds.`)
      await setTimeout(5000)
    }
  }
}
