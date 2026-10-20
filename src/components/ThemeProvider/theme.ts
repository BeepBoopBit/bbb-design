import { createContext, useContext } from 'react'
import type { CSSProperties } from 'react'
import { bbbBrand } from '../../foundations/brands'
import type { BrandPreset, ThemeTokens } from '../../foundations/brands'
export type { Brand, ThemeTokens } from '../../foundations/brands'
export type ThemeMode = 'light' | 'dark' | 'system'
export type Density = 'comfortable' | 'compact'
export type Theme = {
  brand: string
  preset: BrandPreset
  mode: 'light' | 'dark'
  density: Density
  tokens: ThemeTokens
  overrides: ThemeTokens
  dir?: 'ltr' | 'rtl'
  locale?: string
}
export const ThemeContext = createContext<Theme>({
  brand: 'bbb',
  preset: bbbBrand,
  mode: 'light',
  density: 'comfortable',
  tokens: {},
  overrides: {},
})

export function themeAttributes(theme: Theme) {
  return {
    'data-bbb-theme': '',
    'data-bbb-brand': theme.brand,
    'data-bbb-mode': theme.mode,
    'data-bbb-density': theme.density,
    dir: theme.dir,
    lang: theme.locale,
    style: theme.tokens as CSSProperties,
  }
}
/** For BBB portals; attach attributes and the bbb-theme class to the portaled root. */
export function useThemeAttributes() {
  return themeAttributes(useContext(ThemeContext))
}
