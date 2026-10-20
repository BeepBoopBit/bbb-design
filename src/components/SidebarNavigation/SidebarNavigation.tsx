import { useMessages } from '../LocaleProvider/locale'
import type { HTMLAttributes, ReactNode } from 'react'
import { useId, useState } from 'react'
import { Button } from '../Button/Button'
import { Focusable } from 'react-aria-components'
import { Icon } from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import { Link } from '../Link/Link'
import { Tooltip } from '../Tooltip/Tooltip'
import './SidebarNavigation.css'

export type SidebarNavigationItem = {
  id: string
  label: string
  leading?: ReactNode
  icon?: IconName
  badge?: string
  disabled?: boolean
} & (
  | { href: string; children?: never; defaultExpanded?: never }
  | { href?: never; children: SidebarNavigationItem[]; defaultExpanded?: boolean }
)
export type SidebarNavigationGroup = {
  id: string
  label?: string
  items: SidebarNavigationItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
  icon?: IconName
}
export type SidebarNavigationProps = Omit<HTMLAttributes<HTMLElement>, 'onSelect'> & {
  label: string
  groups: SidebarNavigationGroup[]
  currentId?: string
  compact?: boolean
  onNavigate?: (id: string) => void
}

function NavigationItem({
  item,
  currentId,
  compact,
  collapsible,
  onNavigate,
}: {
  item: SidebarNavigationItem
  currentId?: string
  compact: boolean
  collapsible: boolean
  onNavigate?: (id: string) => void
}) {
  const { t } = useMessages()
  if (item.children) {
    return (
      <div className="bbb-sidebar-navigation__branch" data-dropdown>
        <NavigationDisclosure
          label={item.label}
          leading={item.leading ?? <Icon name={item.icon ?? 'layers'} />}
          badge={item.badge}
          disabled={item.disabled}
          defaultExpanded={item.defaultExpanded}
          items={item.children}
          currentId={currentId}
          compact={collapsible ? compact : undefined}
          onNavigate={onNavigate}
        />
      </div>
    )
  }
  const current = item.id === currentId
  const content = (
    <>
      {item.leading ?? ((item.icon || collapsible) && <Icon name={item.icon ?? 'box'} />)}
      <span className="bbb-sidebar-navigation__copy bbb-sidebar-reveal" data-hidden={compact || undefined}>
        <span className="bbb-sidebar-navigation__label">{item.label}</span>
        {item.badge && <span className="bbb-sidebar-navigation__badge">{item.badge}</span>}
      </span>
    </>
  )
  const link = item.disabled ? (
    <span className="bbb-sidebar-navigation__item" role="link" aria-disabled="true">
      {content}
    </span>
  ) : (
    <Link
      href={item.href}
      variant="quiet"
      className="bbb-sidebar-navigation__item"
      aria-current={current ? 'page' : undefined}
      onClick={event => {
        if (
          !onNavigate ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        event.preventDefault()
        onNavigate(item.id)
      }}
    >
      {content}
    </Link>
  )
  return (
    <Tooltip
      disabled={!compact}
      placement="right"
      content={[item.label, item.badge, item.disabled ? t('unavailable') : undefined].filter(Boolean).join(' · ')}
    >
      <Focusable isDisabled={!compact} excludeFromTabOrder={item.disabled}>{link}</Focusable>
    </Tooltip>
  )
}

export function SidebarNavigation({
  label,
  groups,
  currentId,
  compact,
  onNavigate,
  className = '',
  ...props
}: SidebarNavigationProps) {
  return (
    <nav
      {...props}
      className={`bbb-sidebar-navigation ${className}`}
      aria-label={label}
      data-compact={compact || undefined}
      data-collapsible={compact !== undefined || undefined}
    >
      {groups.filter(group => group.items.length).map(group => (
        <NavigationGroup
          key={group.id}
          group={group}
          currentId={currentId}
          compact={compact}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}

function NavigationGroup({ group, currentId, compact, onNavigate }: {
  group: SidebarNavigationGroup
  currentId?: string
  compact?: boolean
  onNavigate?: (id: string) => void
}) {
  const prefix = useId()
  const dropdown = Boolean(group.collapsible && group.label)
  return (
    <div className="bbb-sidebar-navigation__group" data-dropdown={dropdown || undefined}>
      {dropdown ? (
        <NavigationDisclosure
          label={group.label!}
          leading={<Icon name={group.icon ?? 'layers'} />}
          defaultExpanded={group.defaultExpanded}
          items={group.items}
          currentId={currentId}
          compact={compact}
          onNavigate={onNavigate}
        />
      ) : (
        <>
          {group.label && (
            <p id={`${prefix}-label`} className="bbb-sidebar-reveal" data-hidden={compact || undefined}>
              {group.label}
            </p>
          )}
          <NavigationList items={group.items} currentId={currentId} compact={compact}
            onNavigate={onNavigate} labelledBy={group.label ? `${prefix}-label` : undefined} />
        </>
      )}
    </div>
  )
}

function containsCurrent(items: SidebarNavigationItem[], currentId?: string): boolean {
  return items.some(item => item.children ? containsCurrent(item.children, currentId) : item.id === currentId)
}

function NavigationDisclosure({ label, leading, badge, disabled, defaultExpanded, items, currentId, compact, onNavigate }: {
  label: string
  leading: ReactNode
  badge?: string
  disabled?: boolean
  defaultExpanded?: boolean
  items: SidebarNavigationItem[]
  currentId?: string
  compact?: boolean
  onNavigate?: (id: string) => void
}) {
  const prefix = useId()
  const [expanded, setExpanded] = useState(defaultExpanded ?? true)
  const open = expanded && !disabled
  return (
    <>
      <Tooltip disabled={!compact || disabled} placement="right" content={label}>
        <Button
          id={`${prefix}-label`}
          variant="ghost"
          className="bbb-sidebar-navigation__item bbb-sidebar-navigation__disclosure"
          disabled={disabled}
          aria-expanded={open}
          aria-controls={`${prefix}-items`}
          data-current={containsCurrent(items, currentId) || undefined}
          onPress={() => setExpanded(value => !value)}
        >
          {leading}
          <span className="bbb-sidebar-navigation__copy bbb-sidebar-reveal" data-hidden={compact || undefined}>
            <span className="bbb-sidebar-navigation__label">{label}</span>
            {badge && <span className="bbb-sidebar-navigation__badge">{badge}</span>}
            <Icon name={open ? 'chevron-down' : 'chevron-right'} />
          </span>
        </Button>
      </Tooltip>
      <NavigationList id={`${prefix}-items`} labelledBy={`${prefix}-label`} hidden={!open}
        items={items} currentId={currentId} compact={compact} onNavigate={onNavigate} />
    </>
  )
}

function NavigationList({ items, currentId, compact, onNavigate, id, labelledBy, hidden }: {
  items: SidebarNavigationItem[]
  currentId?: string
  compact?: boolean
  onNavigate?: (id: string) => void
  id?: string
  labelledBy?: string
  hidden?: boolean
}) {
  return (
    <ul id={id} aria-labelledby={labelledBy} hidden={hidden}>
      {items.map(item => (
        <li key={item.id}>
          <NavigationItem item={item} currentId={currentId} compact={compact ?? false}
            collapsible={compact !== undefined} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  )
}
