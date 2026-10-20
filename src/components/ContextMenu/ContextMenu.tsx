import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DropdownMenu } from '../DropdownMenu/DropdownMenu'
import type { MenuAction } from '../DropdownMenu/DropdownMenu'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './ContextMenu.css'
export type ContextMenuProps = { label: string; items: MenuAction[]; onAction: (id: string) => void; children: ReactNode; className?: string }
/** Right-click and Shift+F10 open the same menu as the visible action button. */
export function ContextMenu({ label, items, onAction, children, className = '' }: ContextMenuProps) {
  const [open, setOpen] = useState(false)
  const restore = useRef<HTMLElement | null>(null)
  function show() { restore.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setOpen(true) }
  return <div className={`bbb-context-menu ${className}`} onContextMenu={event => {
    if ((event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) return
    event.preventDefault(); show()
  }} onKeyDown={event => {
    if ((event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) return
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) { event.preventDefault(); show() }
  }}>
    {children}
    <DropdownMenu label={label} items={items} onAction={onAction} open={open} onOpenChange={next => {
      setOpen(next)
      if (!next && restore.current) { const target = restore.current; restore.current = null; requestAnimationFrame(() => { if (target.isConnected) target.focus() }) }
    }} trigger={<Button variant="ghost" size="sm" aria-label={label}><Icon name="ellipsis" />{label}</Button>} />
  </div>
}
