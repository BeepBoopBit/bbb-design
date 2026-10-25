import { useEffect, useId, useRef, useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { Icon } from '../Icon/Icon'
import './NavigationMenu.css'

export type NavigationLink = {
  id: string
  label: string
  href: string
  description?: string
  target?: ComponentPropsWithoutRef<'a'>['target']
  rel?: string
}
export type NavigationSection = {
  id: string
  label: string
  disabled?: boolean
  groups: { label: string; links: NavigationLink[] }[]
}
export type NavigationMenuProps = {
  label: string
  items: (NavigationLink | NavigationSection)[]
  currentId?: string
  openId?: string | null
  defaultOpenId?: string
  onOpenChange?: (id: string | null) => void
  className?: string
}

/** Website navigation uses native links and disclosures, preserving ordinary Tab order. */
export function NavigationMenu({ label, items, currentId, openId, defaultOpenId, onOpenChange, className = '' }: NavigationMenuProps) {
  const [localOpen, setLocalOpen] = useState<string | null>(defaultOpenId ?? null)
  const activeId = openId === undefined ? localOpen : openId
  const root = useRef<HTMLElement>(null)
  const focusFirst = useRef(false)
  const prefix = useId()
  const change = (id: string | null) => {
    if (openId === undefined) setLocalOpen(id)
    onOpenChange?.(id)
  }
  useEffect(() => {
    if (activeId && focusFirst.current) root.current?.querySelector<HTMLElement>('[data-open="true"] a')?.focus()
    focusFirst.current = false
  }, [activeId])
  useEffect(() => {
    if (!activeId) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        if (openId === undefined) setLocalOpen(null)
        onOpenChange?.(null)
      }
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [activeId, openId, onOpenChange])
  const link = (item: NavigationLink, nested = false) => <a className={nested ? 'bbb-navigation-menu__link' : 'bbb-navigation-menu__trigger'}
    href={item.href} target={item.target} rel={item.rel ?? (item.target === '_blank' ? 'noopener noreferrer' : undefined)}
    aria-current={currentId === item.id ? 'page' : undefined} onClick={() => change(null)}>
    <span>{item.label}</span>{nested && item.description && <span className="bbb-navigation-menu__description">{item.description}</span>}
  </a>
  return <nav ref={root} aria-label={label} className={`bbb-navigation-menu ${className}`}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null) && activeId) change(null) }}
    onKeyDown={event => {
      if (event.key === 'Escape' && activeId) {
        event.preventDefault()
        event.stopPropagation()
        root.current?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')?.focus()
        change(null)
      }
    }}>
    <ul className="bbb-navigation-menu__items">{items.map((item, index) => {
      if (!('groups' in item)) return <li key={item.id}>{link(item)}</li>
      const expanded = activeId === item.id && !item.disabled
      const panelId = `${prefix}-panel-${index}`
      const triggerId = `${prefix}-trigger-${index}`
      return <li key={item.id} data-open={expanded}>
        <button type="button" id={triggerId} className="bbb-navigation-menu__trigger" disabled={item.disabled}
          aria-expanded={expanded} aria-controls={panelId} onClick={() => change(expanded ? null : item.id)}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown') return
            event.preventDefault()
            if (expanded) document.getElementById(panelId)?.querySelector('a')?.focus()
            else { focusFirst.current = true; change(item.id) }
          }}>
          {item.label}<Icon name="chevron-down" />
        </button>
        <div id={panelId} className="bbb-navigation-menu__panel" hidden={!expanded} aria-labelledby={triggerId}>
          {item.groups.map((group, groupIndex) => <div key={group.label} className="bbb-navigation-menu__group">
            <span className="bbb-navigation-menu__heading" id={`${panelId}-${groupIndex}`}>{group.label}</span>
            <ul aria-labelledby={`${panelId}-${groupIndex}`}>{group.links.map(item => <li key={item.id}>{link(item, true)}</li>)}</ul>
          </div>)}
        </div>
      </li>
    })}</ul>
  </nav>
}
