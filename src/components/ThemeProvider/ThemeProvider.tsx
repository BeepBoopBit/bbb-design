import { ThemeContext, themeAttributes } from './theme'
import type { Brand, ThemeMode, Density, ThemeTokens, Theme } from './theme'
export type { Brand, ThemeMode, Density, ThemeTokens } from './theme'
import { useContext } from 'react'
import { useSystemMode } from './useSystemMode'
import type { CSSProperties, HTMLAttributes } from 'react'
import { I18nProvider, isRTL, useLocale } from 'react-aria-components'
import { LocaleMessages } from '../LocaleProvider/LocaleProvider'
import type { Messages } from '../LocaleProvider/messages'
import './ThemeProvider.css'
import { brandPresets, brandTokens } from '../../foundations/brands'
import type { BrandPreset } from '../../foundations/brands'

export type ThemeProviderProps = Omit<HTMLAttributes<HTMLDivElement>, 'dir'> & {
  brand?: Brand | BrandPreset
  mode?: ThemeMode
  density?: Density
  tokens?: ThemeTokens
  dir?: 'ltr' | 'rtl'
  locale?: string
  messages?: Messages
}

/** A theme boundary. Overlays copy the same boundary through React context. */
export function ThemeProvider({
  brand,
  mode,
  density,
  tokens,
  dir,
  locale,
  messages,
  className = '',
  style,
  children,
  ...props
}: ThemeProviderProps) {
  const parent = useContext(ThemeContext)
  const inheritedLocale = useLocale()
  const systemMode = useSystemMode()
  const preset = typeof brand === 'string' ? brandPresets[brand] : brand ?? parent.preset
  const resolvedMode = mode === 'system' ? systemMode : (mode ?? parent.mode)
  const overrides = { ...(brand === undefined ? parent.overrides : {}), ...tokens }
  // Built-in CSS selectors remain usable by existing stylesheet consumers.
  // Consumer-created presets carry their complete mode maps through portals.
  const builtIn = Object.values(brandPresets).includes(preset)
  const theme: Theme = {
    brand: preset.id,
    preset,
    mode: resolvedMode,
    density: density ?? parent.density,
    tokens: { ...(builtIn ? {} : brandTokens(preset, resolvedMode)), ...overrides },
    overrides,
    locale: locale ?? parent.locale ?? inheritedLocale.locale,
    dir: dir ?? (locale ? (isRTL(locale) ? 'rtl' : 'ltr') : parent.dir ?? inheritedLocale.direction),
  }
  const content = (
    <div
      {...props}
      {...themeAttributes(theme)}
      style={{ ...theme.tokens, ...style } as CSSProperties}
      className={`bbb-theme bbb-theme-scope ${className}`}
    >
      {children}
    </div>
  )
  return (
    <ThemeContext.Provider value={theme}>
      <I18nProvider locale={theme.locale}>
        <LocaleMessages messages={messages}>{content}</LocaleMessages>
      </I18nProvider>
    </ThemeContext.Provider>
  )
}
