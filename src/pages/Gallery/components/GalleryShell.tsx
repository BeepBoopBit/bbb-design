import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { HelpResources } from './HelpResources'
import { Button } from '../../../components/Button/Button'
import { Icon } from '../../../components/Icon/Icon'
import { Sheet } from '../../../components/Sheet/Sheet'
import { SidebarToggle } from '../../../components/SidebarNavigation/SidebarToggle'
import { useSidebarToggle } from '../../../components/SidebarNavigation/useSidebarToggle'
import type { GalleryCategory } from '../galleryItems'
import { GalleryNavigation } from './GalleryNavigation'
import { ShellIdentity } from './ShellIdentity'
import { BrandLogo } from '../../../components/BrandLogo/BrandLogo'
import { bbbBrand } from '../../../foundations/brands'
import type { SitePage } from '../useGalleryLocation'
import { sitePath } from '../useGalleryLocation'

type GalleryShellProps = {
  page: SitePage
  onPageNavigate: (page: SitePage) => void
  isolated?: boolean
  appearance?: ReactNode
  children: ReactNode
  category: GalleryCategory
  onCategoryChange: (category: GalleryCategory) => void
}

export function GalleryShell({ isolated, children, appearance, category, onCategoryChange, page, onPageNavigate }: GalleryShellProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const sidebarId = useId()
  const { collapsed, buttonRef, toggle } = useSidebarToggle()
  const [menuOpen, setMenuOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const menuContentRef = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<'content' | 'menu' | null>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const observer = new ResizeObserver(() => {
      shellRef.current?.style.setProperty('--bbb-site-header-height', `${header.getBoundingClientRect().height}px`)
    })
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  // Let the sheet finish restoring its focus scope before moving to the content.
  // If resizing hides the menu trigger, dismissal also returns to the content.
  useEffect(() => {
    if (menuOpen || !pendingFocus.current) return
    let frame: number
    function restoreFocus() {
      if (menuContentRef.current) {
        frame = requestAnimationFrame(restoreFocus)
        return
      }
      frame = requestAnimationFrame(() => {
        const target =
          pendingFocus.current === 'menu' && menuRef.current?.getClientRects().length
            ? menuRef.current
            : mainRef.current
        target?.focus()
        pendingFocus.current = null
      })
    }
    frame = requestAnimationFrame(restoreFocus)
    return () => cancelAnimationFrame(frame)
  }, [menuOpen, category, page])

  function navigatePage(next: SitePage) {
    pendingFocus.current = 'content'
    if (next === 'gallery') onCategoryChange('all')
    else onPageNavigate(next)
    setMenuOpen(false)
    if (next === page && !menuOpen) {
      mainRef.current?.focus()
      pendingFocus.current = null
    }
  }

  function navigate(next: GalleryCategory) {
    pendingFocus.current = 'content'
    onCategoryChange(next)
    setMenuOpen(false)
    if (next === category && !menuOpen) {
      mainRef.current?.focus()
      pendingFocus.current = null
    }
  }

  return (
    <div ref={shellRef} className="gallery-shell" data-sidebar-collapsed={collapsed || undefined}>
      <a className="gallery-skip-link" href="#main-content">
        Skip to content
      </a>
      <header ref={headerRef} className="gallery-topbar">
        <div className="gallery-desktop-toggle">
          <ShellIdentity collapsed={collapsed} brand={bbbBrand}>
            <SidebarToggle collapsed={collapsed} controls={sidebarId} onToggle={toggle} buttonRef={buttonRef} />
          </ShellIdentity>
        </div>
        <div className="gallery-mobile-menu">
          <Sheet
            side="start"
            title="Gallery navigation"
            open={menuOpen}
            onOpenChange={open => {
              if (!open && !pendingFocus.current) pendingFocus.current = 'menu'
              setMenuOpen(open)
            }}
            trigger={
              <Button ref={menuRef} variant="ghost" iconOnly aria-label="Open gallery navigation">
                <Icon name="menu" />
              </Button>
            }
          >
            <div ref={menuContentRef} className="gallery-navigation-sheet">
              <GalleryNavigation
                page={page} onPageNavigate={navigatePage}
                label="Gallery mobile navigation"
                category={category}
                onNavigate={navigate}
              />
              <HelpResources getStartedHref={sitePath('getting-started')} />
            </div>
          </Sheet>
        </div>
        <span className="gallery-topbar__location"><span className="gallery-topbar__app-name">{page === 'getting-started' ? 'Get started' : 'Gallery'}</span><span className="gallery-topbar__mobile-brand"><BrandLogo brand={bbbBrand} /></span></span>
        {appearance}
      </header>
      <aside
        id={sidebarId}
        className="gallery-sidebar"
      >
        <GalleryNavigation page={page} onPageNavigate={navigatePage} label="Main navigation" category={category} onNavigate={navigate} compact={collapsed} />
        <div className="gallery-sidebar__help"><HelpResources compact={collapsed} getStartedHref={sitePath('getting-started')} /></div>
      </aside>
      <div className="gallery-workspace">
        <main ref={mainRef} id="main-content" className="gallery-main" data-isolated={isolated || undefined} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
