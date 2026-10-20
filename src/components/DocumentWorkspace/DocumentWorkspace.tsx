import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Sheet } from '../Sheet/Sheet'
import { SidebarToggle } from '../SidebarNavigation/SidebarToggle'
import { useSidebarToggle } from '../SidebarNavigation/useSidebarToggle'
import './DocumentWorkspace.css'

export type DocumentWorkspaceNavigationProps = {
  compact: boolean
  /** Call after selecting a document to dismiss mobile navigation and focus the content. */
  onNavigate: () => void
  /** Reveal the desktop library after choosing an icon-rail destination. */
  expandNavigation: () => void
}
export type DocumentWorkspaceProps = {
  label: string
  contentLabel: string
  navigationLabel: string
  openNavigationLabel: string
  navigation: (props: DocumentWorkspaceNavigationProps) => ReactNode
  account: ReactNode
  tools?: ReactNode
  children: ReactNode
  footer?: ReactNode
  navigationDisabled?: boolean
  contentRef?: RefObject<HTMLDivElement | null>
  className?: string
}

/** A library and document surface, with account access in the document toolbar. */
export function DocumentWorkspace({ label, contentLabel, navigationLabel, openNavigationLabel, navigation, account,
  tools, children, footer, navigationDisabled = false, contentRef, className = '' }: DocumentWorkspaceProps) {
  const sidebarId = useId()
  const { collapsed, buttonRef, toggle } = useSidebarToggle()
  const [open, setOpen] = useState(false)
  const internalContentRef = useRef<HTMLDivElement>(null)
  const readingRef = contentRef ?? internalContentRef
  const triggerRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [focusTarget, setFocusTarget] = useState<'content' | 'menu' | null>(null)

  useEffect(() => {
    if (open || !focusTarget) return
    let frame: number
    function restoreFocus() {
      if (sheetRef.current) { frame = requestAnimationFrame(restoreFocus); return }
      frame = requestAnimationFrame(() => {
        const target = focusTarget === 'content' || !triggerRef.current?.getClientRects().length
          ? readingRef.current : triggerRef.current
        target?.focus()
        setFocusTarget(null)
      })
    }
    frame = requestAnimationFrame(restoreFocus)
    return () => cancelAnimationFrame(frame)
  }, [open, readingRef, focusTarget])

  const onNavigate = useCallback(() => {
    setFocusTarget('content')
    setOpen(false)
  }, [])
  const library = navigation({
    compact: !open && collapsed,
    onNavigate,
    expandNavigation: () => { if (collapsed && !open) toggle() },
  })

  return (
    <div className={`bbb-document-workspace-frame ${className}`} role="group" aria-label={label}>
    <div className="bbb-document-workspace" data-collapsed={collapsed || undefined}>
      <aside id={sidebarId} className="bbb-document-workspace__sidebar" inert={navigationDisabled} aria-hidden={navigationDisabled || undefined}>
        {!open && library}
      </aside>
      <div ref={readingRef} className="bbb-document-workspace__content" role="region" aria-label={contentLabel} tabIndex={-1}>
        <div className="bbb-document-workspace__tools">
          <div className="bbb-document-workspace__document-tools">
            <span className="bbb-document-workspace__desktop-toggle">
              <SidebarToggle collapsed={collapsed} controls={sidebarId} buttonRef={buttonRef} onToggle={toggle} />
            </span>
            <span className="bbb-document-workspace__mobile-toggle">
              <Sheet title={navigationLabel} side="start" open={open} onOpenChange={value => {
                if (!value) setFocusTarget(current => current ?? 'menu')
                setOpen(value)
              }} trigger={<Button ref={triggerRef} variant="ghost" iconOnly aria-label={openNavigationLabel} disabled={navigationDisabled}><Icon name="panel-left" /></Button>}>
                <div ref={sheetRef} className="bbb-document-workspace__drawer">{library}</div>
              </Sheet>
            </span>
            {tools}
          </div>
          <div className="bbb-document-workspace__account">{account}</div>
        </div>
        {children}
        {footer && <div className="bbb-document-workspace__footer">{footer}</div>}
      </div>
    </div>
    </div>
  )
}
