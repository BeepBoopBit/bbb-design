import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const stylesheet = new URL('./tokens.css', import.meta.url)
const output = new URL('./tokenDeclarations.ts', import.meta.url)

// CSS remains the only authored source of preset values. This script also travels
// with copied foundations so consumers can regenerate data without a Vite loader.
export function tokenModule(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const selectors = {
    foundation: ':root, [data-bbb-theme]',
    studio: "[data-bbb-brand='studio']",
    dark: "[data-bbb-mode='dark']",
    studioDark: "[data-bbb-brand='studio'][data-bbb-mode='dark']",
  }
  const blocks = [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  const declarations = Object.fromEntries(Object.entries(selectors).map(([name, selector]) => {
    const block = blocks.find(([, rule]) => rule.trim().replace(/\s+/g, ' ') === selector)
    if (!block) throw new Error(`Missing foundation selector: ${selector}`)
    const values = Object.fromEntries([...block[2].matchAll(/(--bbb-[\w-]+)\s*:\s*([^;]+);/g)]
      .map(([, key, value]) => [key, value.trim()]))
    if (!Object.keys(values).length) throw new Error(`Empty foundation selector: ${selector}`)
    return [name, values]
  }))
  return '// Generated from tokens.css. Edit CSS, then run node foundations/sync-tokens.mjs.\n' +
    `export const tokenDeclarations = ${JSON.stringify(declarations, null, 2)} as const\n`
}

export async function syncTokens({ check = false } = {}) {
  const expected = tokenModule(await readFile(stylesheet, 'utf8'))
  const current = await readFile(output, 'utf8').catch(error => {
    if (error.code !== 'ENOENT') throw error
    return ''
  })
  if (current === expected) return
  if (check) throw new Error('Preset data is stale. Run npm run tokens:sync (or node foundations/sync-tokens.mjs in a copied bundle).')
  await writeFile(output, expected)
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await syncTokens({ check: process.argv.includes('--check') })
}
