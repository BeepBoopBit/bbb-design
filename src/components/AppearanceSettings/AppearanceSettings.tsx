import type { ReactNode } from 'react'
import { Select } from '../Select/Select'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'
import type { ThemeMode, Density } from '../ThemeProvider/ThemeProvider'
import './AppearanceSettings.css'
export type AppearanceSettingsProps = {
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  density?: Density
  onDensityChange?: (density: Density) => void
  disabled?: boolean
  children?: ReactNode
  className?: string
}
export function AppearanceSettings({ mode, onModeChange, density, onDensityChange, disabled, children, className = '' }: AppearanceSettingsProps) {
  const { t } = useMessages()
  return <div className={`bbb-appearance-settings ${className}`}>
    <Select label={t('colorMode')} value={mode} disabled={disabled} onChange={value => onModeChange(value as ThemeMode)} options={[
      { id: 'light', label: t('lightMode'), leading: <Icon name="sun" /> },
      { id: 'dark', label: t('darkMode'), leading: <Icon name="moon" /> },
      { id: 'system', label: t('systemMode'), leading: <Icon name="monitor" /> },
    ]} />
    {density !== undefined && onDensityChange && <Select label={t('interfaceDensity')} value={density} disabled={disabled}
      onChange={value => onDensityChange(value as Density)} options={[
        { id: 'comfortable', label: t('comfortableDensity') }, { id: 'compact', label: t('compactDensity') },
      ]} />}
    {children}
  </div>
}
