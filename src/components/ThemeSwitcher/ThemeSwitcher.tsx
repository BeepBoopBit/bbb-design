import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Tooltip } from '../Tooltip/Tooltip'
import { useMessages } from '../LocaleProvider/locale'
import type { ThemeMode } from '../ThemeProvider/ThemeProvider'
import { useSystemMode } from '../ThemeProvider/useSystemMode'

export type ThemeSwitcherProps = {
  value: ThemeMode
  onChange: (mode: ThemeMode) => void
  disabled?: boolean
  label?: string
  className?: string
}
export function ThemeSwitcher({ value, onChange, disabled, label, className = '' }: ThemeSwitcherProps) {
  const { t } = useMessages()
  const systemMode = useSystemMode()
  const resolvedMode = value === 'system' ? systemMode : value
  const modeLabels = { light: t('lightMode'), dark: t('darkMode'), system: t('systemMode') }
  const name = `${label ?? t('colorMode')}: ${modeLabels[value]}`
  return <Tooltip content={name}><Button variant="ghost" iconOnly disabled={disabled} aria-label={name}
    className={className} onPress={() => onChange(resolvedMode === 'light' ? 'dark' : 'light')}>
    <Icon name={resolvedMode === 'light' ? 'sun' : 'moon'} />
  </Button></Tooltip>
}
