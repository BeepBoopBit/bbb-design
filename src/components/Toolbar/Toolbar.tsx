import { Toolbar as AriaToolbar } from 'react-aria-components'
import type { ToolbarProps as AriaToolbarProps } from 'react-aria-components'
import { Button } from '../Button/Button'
import { DropdownMenu } from '../DropdownMenu/DropdownMenu'
import type { MenuAction } from '../DropdownMenu/DropdownMenu'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'
import './Toolbar.css'

export type ToolbarProps = Omit<AriaToolbarProps, 'className'> & {
  label: string
  className?: string
  overflowActions?: MenuAction[]
  onOverflowAction?: (id: string) => void
}

export function Toolbar({ label, className = '', children, overflowActions = [], onOverflowAction, ...props }: ToolbarProps) {
  const { t } = useMessages()
  return (
    <AriaToolbar {...props} aria-label={label} className={`bbb-toolbar ${className}`}>
      {state => <>
        {typeof children === 'function' ? children(state) : children}
        {!!overflowActions.length && <DropdownMenu
          label={t('moreActions')} items={overflowActions} onAction={id => onOverflowAction?.(id)}
          trigger={<Button variant="ghost" iconOnly aria-label={t('moreActions')}><Icon name="ellipsis" /></Button>}
        />}
      </>}
    </AriaToolbar>
  )
}
