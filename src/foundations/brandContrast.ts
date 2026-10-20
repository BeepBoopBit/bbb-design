import { brandTokens, foundationTokens } from './brands'
import type { BrandPreset, BrandMode, ThemeTokens } from './brands'
import { resolveBrandValue, validateBrand } from './brandValidation'

type Pair = { label: string; foreground: keyof ThemeTokens; background: keyof ThemeTokens; minimum: number }
const textPair = (label: string, foreground: keyof ThemeTokens, background: keyof ThemeTokens): Pair => ({ label, foreground, background, minimum: 4.5 })
const pairs: Pair[] = [
  textPair('Body on canvas', '--bbb-color-text', '--bbb-color-canvas'),
  textPair('Body on surface', '--bbb-color-text', '--bbb-color-surface'),
  textPair('Secondary text', '--bbb-color-text-secondary', '--bbb-color-surface'),
  textPair('Field placeholder', '--bbb-color-text-muted', '--bbb-color-field-surface'),
  ...(['accent', 'danger'] as const).flatMap(family => ['', '-hover', '-pressed'].map(state =>
    textPair(`${family} action${state.replace('-', ' ')}`, `--bbb-color-on-${family}`, `--bbb-color-${family}${state}`),
  )),
  textPair('Selected accent', '--bbb-color-accent-text', '--bbb-color-accent-subtle'),
  textPair('Selected navigation', '--bbb-color-supporting-hover', '--bbb-color-supporting-subtle'),
  textPair('Selected navigation hover', '--bbb-color-supporting-hover', '--bbb-color-supporting-subtle-hover'),
  ...(['success', 'warning', 'danger'] as const).map(role => textPair(`${role} feedback`, `--bbb-color-${role}`, `--bbb-color-${role}-subtle`)),
  ...(['surface', 'field-surface'] as const).map(surface => ({ label: `Focus on ${surface}`, foreground: '--bbb-color-focus' as const, background: `--bbb-color-${surface}` as const, minimum: 3 })),
  { label: 'Invalid field edge', foreground: '--bbb-color-danger', background: '--bbb-color-field-surface', minimum: 3 },
]
export type BrandContrastCheck = { mode: BrandMode; label: string; ratio: number | null; minimum: number; pass: boolean }

/** Browser-only color evaluation supports CSS colors and aliases, including alpha. */
export function checkBrandContrast(brand: BrandPreset): BrandContrastCheck[] {
  if (typeof document === 'undefined') throw new Error('Contrast checks require a browser.')
  if (validateBrand(brand).length) return []
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  const probe = document.createElement('span')
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  document.body.append(probe)
  function rgba(value: string) {
    probe.style.color = value
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = getComputedStyle(probe).color
    context.fillRect(0, 0, 1, 1)
    return Array.from(context.getImageData(0, 0, 1, 1).data).map((value, index) => index === 3 ? value / 255 : value)
  }
  function over(front: number[], back: number[]) { return [0, 1, 2].map(index => front[index] * front[3] + back[index] * (1 - front[3])).concat(1) }
  function luminance(color: number[]) {
    return color.slice(0, 3).reduce((sum, channel, index) => {
      const value = channel / 255
      return sum + (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][index]
    }, 0)
  }
  try {
    return (['light', 'dark'] as const).flatMap(mode => {
      probe.style.colorScheme = mode
      const tokens = { ...foundationTokens, ...brandTokens(brand, mode) }
      const color = (token: keyof ThemeTokens) => rgba(resolveBrandValue(tokens[token]!, tokens))
      const canvasColor = color('--bbb-color-canvas')
      return pairs.map(pair => {
        // A translucent canvas needs a known product background; do not invent one.
        const back = over(color(pair.background), canvasColor)
        const front = over(color(pair.foreground), back)
        const a = luminance(front), b = luminance(back)
        const ratio = canvasColor[3] < 1 ? null : (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
        return { mode, label: pair.label, ratio, minimum: pair.minimum, pass: ratio !== null && ratio >= pair.minimum }
      })
    })
  } finally { probe.remove() }
}
