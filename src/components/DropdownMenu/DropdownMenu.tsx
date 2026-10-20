import { Menu, MenuItem, MenuTrigger, Separator } from 'react-aria-components'
import type { ReactElement, ReactNode } from 'react'
import { DropdownSurface } from '../DropdownSurface/DropdownSurface'
import './DropdownMenu.css'

export type MenuAction = { id: string; label: string; disabled?: boolean; danger?: boolean; leading?: ReactNode }
export type DropdownMenuProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  renderItem?: (item: MenuAction) => ReactNode
  trigger: ReactElement
  label: string
  items: MenuAction[]
  onAction: (id: string) => void
}

export function DropdownMenu({ trigger, label, items, onAction, renderItem, open, onOpenChange, className = '' }: DropdownMenuProps) {
  return (
    <MenuTrigger isOpen={open} onOpenChange={onOpenChange}>
      {trigger}
      <DropdownSurface className={`bbb-dropdown-menu ${className}`}>
        <Menu
          aria-label={label}
          className="bbb-option-list"
          disabledKeys={items.filter(item => item.disabled).map(item => item.id)}
          onAction={key => onAction(String(key))}
        >
          {items.flatMap((item, index) => [
            ...(item.danger && index > 0 && !items[index - 1].danger
              ? [
                  <Separator
                    key={`${item.id}-separator`}
                    className="bbb-dropdown-menu__separator"
                  />,
                ]
              : []),
            <MenuItem
              key={item.id}
              id={item.id}
              textValue={item.label}
              className={`bbb-option ${item.danger ? 'bbb-option--danger' : ''}`}
            >
              {renderItem ? renderItem(item) : <span className="bbb-option__content">{item.leading}{item.label}</span>}
            </MenuItem>,
          ])}
        </Menu>
      </DropdownSurface>
    </MenuTrigger>
  )
}
