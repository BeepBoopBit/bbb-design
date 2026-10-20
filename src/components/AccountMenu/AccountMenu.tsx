import type { ReactElement, ReactNode } from 'react'
import { Popover } from '../Popover/Popover'
import { Avatar } from '../Avatar/Avatar'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'
import './AccountMenu.css'
export type AccountMenuAction = { id: string; label: string; disabled?: boolean; danger?: boolean }
export type AccountMenuProps = {
  name: string
  email?: string
  avatarSrc?: string
  trigger?: ReactElement
  actions?: AccountMenuAction[]
  onAction?: (id: string) => void
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}
/** A popover, rather than an ARIA menu, so settings and form controls can be composed inside. */
export function AccountMenu({ name, email, avatarSrc, trigger, actions = [], onAction, children, open, onOpenChange, className = '' }: AccountMenuProps) {
  const { t } = useMessages()
  return <Popover title={name} open={open} onOpenChange={onOpenChange} className={className}
    trigger={trigger ?? <Button variant="ghost" aria-label={t('accountFor', { name })}><Avatar name={name} src={avatarSrc} size="sm" decorative /><Icon name="chevron-down" /></Button>}>
    <div className="bbb-account-menu">
      {email && <p className="bbb-account-menu__email">{email}</p>}
      {children}
      {!!actions.length && <div className="bbb-account-menu__actions">{actions.map(action =>
        <Button key={action.id} variant={action.danger ? 'danger' : 'ghost'} disabled={action.disabled} onPress={() => onAction?.(action.id)}>{action.label}</Button>)}</div>}
    </div>
  </Popover>
}
