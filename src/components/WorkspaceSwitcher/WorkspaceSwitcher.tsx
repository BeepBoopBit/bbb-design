import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import type { ReactNode } from 'react'
import { Select } from '../Select/Select'
import type { SelectOption } from '../Select/Select'
import { useMessages } from '../LocaleProvider/locale'
import './WorkspaceSwitcher.css'
export type WorkspaceSwitcherProps = {
  workspaces: SelectOption[]
  value: string | null
  onChange: (id: string) => void
  label?: string
  variant?: 'field' | 'list'
  disabled?: boolean
  actions?: ReactNode
  className?: string
}
export function WorkspaceSwitcher({ workspaces, value, onChange, label, variant = 'field', disabled, actions, className = '' }: WorkspaceSwitcherProps) {
  const { t } = useMessages()
  return <div className={`bbb-workspace-switcher ${className}`}>
    {variant === 'list' ? <div className="bbb-workspace-switcher__list" role="group" aria-label={label ?? t('workspace')}>
      {workspaces.map(workspace => <Button key={workspace.id} variant="ghost" disabled={disabled || workspace.disabled}
        aria-pressed={workspace.id === value} onPress={() => onChange(workspace.id)}><Icon name={workspace.id === value ? 'check' : 'scan'} />{workspace.label}</Button>)}
    </div> : <Select label={label ?? t('workspace')} value={value} onChange={onChange} options={workspaces} disabled={disabled} />}
    {actions && <div className="bbb-workspace-switcher__actions">{actions}</div>}
  </div>
}
