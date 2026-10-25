import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { verifyHostedRelease } from '../../scripts/check-hosting.mjs'

test('the staged deployment uses the same configuration as the tested local runtime', async () => {
  const local = JSON.parse(await readFile('wrangler.jsonc', 'utf8'))
  const staged = JSON.parse(await readFile('.release/wrangler.jsonc', 'utf8'))
  local.assets.directory = resolve(local.assets.directory)
  staged.assets.directory = resolve('.release', staged.assets.directory)
  expect(staged).toEqual(local)
})

test('Cloudflare serves the exact candidate, all registry versions, cache headers, and real missing-file responses', async ({ baseURL }) => {
  const result = await verifyHostedRelease(baseURL!)
  expect(result.files).toBeGreaterThan(0)
})

test('HTML aliases preserve deep links and normalize trailing slashes without redirecting registry JSON', async ({ request }) => {
  for (const path of ['/gallery', '/getting-started', '/components/button']) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/html')
    const alias = await request.get(`${path}/?q=button`, { maxRedirects: 0 })
    expect(alias.status()).toBe(307)
    expect(new URL(alias.headers().location, response.url()).pathname).toBe(path)
    expect(new URL(alias.headers().location, response.url()).searchParams.get('q')).toBe('button')
  }
  const registry = await request.get('/r/manifest.json', { maxRedirects: 0 })
  expect(registry.status()).toBe(200)
})
