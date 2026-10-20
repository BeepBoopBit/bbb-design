import { bbbBrand, brandTokens, foundationTokens } from './brands'
import type { BrandPreset, ThemeTokens } from './brands'

export type BrandIssue = { path: string; message: string }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const requiredColors = Object.keys(bbbBrand.modes.light)
const knownTokens = new Set(Object.keys(foundationTokens))

/** Resolves aliases for validation only. Exported presets keep their references. */
export function resolveBrandValue(value: string, tokens: ThemeTokens, visited = new Set<string>()): string {
  return value.replace(/var\(\s*(--bbb-[\w-]+)(?:\s*,\s*([^()]*))?\s*\)/g, (_, key: keyof ThemeTokens, fallback?: string) => {
    if (visited.has(key)) throw new Error(`Circular token reference: ${key}`)
    const next = tokens[key] ?? fallback
    if (next === undefined) throw new Error(`Unknown token reference: ${key}`)
    return resolveBrandValue(next, tokens, new Set([...visited, key]))
  })
}

function cssProperty(key: string) {
  if (key.startsWith('--bbb-color-') || /^--bbb-brand-(ink|ember|teal|sand|pearl)$/.test(key)) return 'color'
  if (key.includes('shadow')) return 'box-shadow'
  if (key.includes('duration')) return 'transition-duration'
  if (key.includes('easing')) return 'transition-timing-function'
  if (/--bbb-font-(sans|mono|serif|heading|wordmark)$/.test(key)) return 'font-family'
  if (key.includes('font-weight')) return 'font-weight'
  if (key.includes('line-height')) return 'line-height'
  if (key.includes('letter-spacing')) return 'letter-spacing'
  if (key.includes('opacity')) return 'opacity'
  if (key.includes('layer-')) return 'z-index'
  if (key.includes('turn')) return 'rotate'
  if (key.includes('scale') || key.includes('icon-stroke') || key.startsWith('--bbb-split-')) return undefined
  return 'width'
}

/** Shape/reference checks work on the server; CSS value checks also run in a browser. */
export function validateBrand(input: unknown): BrandIssue[] {
  const issues: BrandIssue[] = []
  const add = (path: string, message: string) => issues.push({ path, message })
  if (!record(input)) return [{ path: 'brand', message: 'Use a brand configuration object.' }]
  if (input.schemaVersion !== 1) add('schemaVersion', 'Only brand schema version 1 is supported.')
  if (typeof input.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(input.id)) add('id', 'Use a lowercase ID beginning with a letter, with letters, numbers, or hyphens.')
  if (typeof input.name !== 'string' || !input.name.trim()) add('name', 'Enter a brand name.')
  const logo = input.logo
  if (!record(logo) || typeof logo.label !== 'string' || !logo.label.trim()) add('logo', 'Provide a logo with an accessible label.')
  else if (logo.type === 'wordmark') {
    if (typeof logo.text !== 'string' || !logo.text.trim()) add('logo.text', 'Enter the wordmark text.')
    if (logo.suffix !== undefined && typeof logo.suffix !== 'string') add('logo.suffix', 'The wordmark suffix must be text.')
  } else if (logo.type === 'image') {
    for (const key of ['light', 'dark']) {
      if (key === 'dark' && logo.dark === undefined) continue
      const src = logo[key]
      if (typeof src !== 'string' || !/^(https?:\/\/|\/(?!\/)|\.\.?\/)/.test(src) || /[\s<>"']/.test(src)) add(`logo.${key}`, 'Use an HTTP(S) URL or a local asset path beginning with /, ./, or ../.')
    }
  } else add('logo.type', 'Choose a wordmark or image logo.')
  const maps: Array<[string, unknown]> = [['tokens', input.tokens]]
  if (!record(input.modes)) add('modes', 'Provide both light and dark modes.')
  else for (const mode of ['light', 'dark']) maps.push([`modes.${mode}`, input.modes[mode]])
  for (const [path, values] of maps) {
    if (!record(values)) { add(path, 'Provide a token map.'); continue }
    for (const [key, value] of Object.entries(values)) {
      if (!knownTokens.has(key)) add(`${path}.${key}`, 'Unknown design token. Check its spelling.')
      if (typeof value !== 'string' || !value.trim() || /[;{}<>]|\/\*|url\s*\(/i.test(value)) add(`${path}.${key}`, 'Use a single CSS value or a token reference; load font and image assets separately.')
    }
  }
  if (issues.length) return issues
  const brand = input as unknown as BrandPreset
  for (const mode of ['light', 'dark'] as const) {
    const configured = brandTokens(brand, mode)
    for (const key of requiredColors) if (!(key in configured)) add(`modes.${mode}.${key}`, 'This color role is missing. Start from a complete preset.')
    const tokens = { ...foundationTokens, ...configured }
    for (const [key, value] of Object.entries(configured)) {
      if (value === undefined) continue
      try {
        for (const [, reference] of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
          if (!knownTokens.has(reference)) throw new Error(`Unknown token reference: ${reference}`)
        }
        const resolved = resolveBrandValue(value, tokens, new Set([key]))
        const property = cssProperty(key)
        if (property === 'color' && /currentcolor/i.test(resolved)) throw new Error('Use an explicit color or color token; currentColor depends on the component.')
        if (/^(inherit|initial|unset|revert|revert-layer)$/i.test(resolved)) throw new Error('Use an explicit value or token reference.')
        if (typeof CSS !== 'undefined' && property && !CSS.supports(property, resolved)) throw new Error(`Invalid ${property} value.`)
        if (!property && (!Number.isFinite(Number(resolved)) || Number(resolved) < 0)) throw new Error('Use a nonnegative number.')
        if (key.startsWith('--bbb-split-') && (Number(resolved) > 100 || (key === '--bbb-split-step' && Number(resolved) === 0))) throw new Error('Use a percentage from 0 to 100 and a positive resize step.')
        if (key.includes('opacity') && (Number(resolved) < 0 || Number(resolved) > 1)) throw new Error('Opacity must be between 0 and 1.')
      } catch (error) {
        add(`modes.${mode}.${key}`, error instanceof Error ? error.message : 'Invalid token value.')
      }
    }
  }
  return issues
}

export function parseBrand(json: string): BrandPreset {
  const value: unknown = JSON.parse(json)
  const issues = validateBrand(value)
  if (issues.length) throw new Error(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'))
  return value as BrandPreset
}

export function serializeBrand(brand: BrandPreset): string {
  const issues = validateBrand(brand)
  if (issues.length) throw new Error(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'))
  return `${JSON.stringify(brand, null, 2)}\n`
}

/** Mode-specific, scoped CSS. Import after BBB styles; aliases stay intact. */
export function brandToCSS(brand: BrandPreset): string {
  serializeBrand(brand)
  return `/* ${brand.id} · brand schema 1. Import after BBB styles. */\n` + (['light', 'dark'] as const).map(mode =>
    `[data-bbb-theme][data-bbb-brand="${brand.id}"][data-bbb-mode="${mode}"] {\n` +
    Object.entries(brandTokens(brand, mode)).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `  ${key}: ${value};`).join('\n') + '\n}',
  ).join('\n\n') + '\n'
}
