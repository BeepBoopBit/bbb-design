import { tokenDeclarations } from './tokenDeclarations'

export type ThemeTokens = Partial<Record<`--bbb-${string}`, string>>
export type BrandMode = 'light' | 'dark'
export type BrandLogoDefinition =
  | { type: 'wordmark'; text: string; suffix?: string; label: string }
  | { type: 'image'; light: string; dark?: string; label: string }
export type BrandPreset = {
  schemaVersion: 1
  id: string
  name: string
  logo: BrandLogoDefinition
  tokens: ThemeTokens
  modes: Record<BrandMode, ThemeTokens>
}

// Generated declaration data keeps these presets usable in ordinary TypeScript,
// including server rendering, without raw CSS imports or a runtime network fetch.
export const foundationTokens: Readonly<ThemeTokens> = Object.freeze(tokenDeclarations.foundation)
export const brandTokenNames = Object.freeze(Object.keys(foundationTokens).sort() as Array<keyof ThemeTokens>)
const studio: ThemeTokens = tokenDeclarations.studio
const dark: ThemeTokens = tokenDeclarations.dark
const studioDark: ThemeTokens = tokenDeclarations.studioDark
const palette = (tokens: ThemeTokens): ThemeTokens => Object.fromEntries(Object.entries(tokens).filter(([key]) =>
  key.startsWith('--bbb-color-') || ['ink', 'ember', 'teal', 'sand', 'pearl'].some(name => key === `--bbb-brand-${name}`),
))
const common = Object.fromEntries(Object.entries(foundationTokens).filter(([key]) =>
  /^--bbb-(font-|line-height-|letter-spacing-|radius-|shadow-|duration-|easing-)/.test(key) ||
  ['--bbb-brand-size', '--bbb-brand-dot-size', '--bbb-button-radius', '--bbb-field-radius', '--bbb-search-radius', '--bbb-icon-stroke'].includes(key),
))

export const bbbBrand: BrandPreset = {
  schemaVersion: 1, id: 'bbb', name: 'BBB',
  logo: { type: 'wordmark', text: 'bbb', suffix: '.', label: 'BBB' },
  tokens: common,
  modes: { light: palette(foundationTokens), dark: { ...palette(foundationTokens), ...dark } },
}
export const studioBrand: BrandPreset = {
  schemaVersion: 1, id: 'studio', name: 'Studio',
  logo: { type: 'wordmark', text: 'studio', suffix: '.', label: 'Studio' },
  tokens: { ...common, ...Object.fromEntries(Object.entries(studio).filter(([key]) => !(key in palette(studio)))) },
  modes: { light: { ...palette(foundationTokens), ...palette(studio) }, dark: { ...palette(foundationTokens), ...dark, ...studioDark } },
}
export const brandPresets = { bbb: bbbBrand, studio: studioBrand } as const
export type Brand = keyof typeof brandPresets

/** Inheritance is flattened, so a saved preset has no dependency on a registry. */
export function createBrand(input: {
  id: string
  name: string
  extends?: BrandPreset
  logo?: BrandLogoDefinition
  tokens?: ThemeTokens
  modes?: Partial<Record<BrandMode, ThemeTokens>>
}): BrandPreset {
  const base = input.extends ?? bbbBrand
  return {
    schemaVersion: 1, id: input.id, name: input.name,
    logo: input.logo ?? { type: 'wordmark', text: input.name, label: input.name },
    tokens: { ...base.tokens, ...input.tokens },
    modes: { light: { ...base.modes.light, ...input.modes?.light }, dark: { ...base.modes.dark, ...input.modes?.dark } },
  }
}

export function brandTokens(brand: BrandPreset, mode: BrandMode): ThemeTokens {
  return { ...brand.tokens, ...brand.modes[mode] }
}
