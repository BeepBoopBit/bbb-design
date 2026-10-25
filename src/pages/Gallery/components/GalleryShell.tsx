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
import { BrandLogo } from '../../../components/BrandLogo/BrandLogo'
import { bbbBrand } from '../../../foundations/brands'
import type { SitePage } from '../useGalleryLocation'
import { sitePath } from '../useGalleryLocation'
import { SiteNavigation, followSiteLink } from '../../Site/SiteNavigation'
import { SiteSearch } from '../../Site/SiteSearch'
import { ComponentNavigation } from '../../Site/ComponentNavigation'
import { repositoryUrl } from '../../Site/SiteFooter'
import { isComponentPage } from '../../ComponentDocs/componentRoutes'

type GalleryShellProps = {
  page: SitePage
  onPageNavigate: (page: SitePage) => void
  isolated?: boolean
  appearance?: ReactNode
  children: ReactNode
  category: GalleryCategory
  onCategoryChange: (category: GalleryCategory, clearSearch?: boolean) => void
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

  function navigate(next: GalleryCategory, clearSearch = false) {
    pendingFocus.current = 'content'
    onCategoryChange(next, clearSearch)
    setMenuOpen(false)
    if (next === category && !menuOpen) {
      mainRef.current?.focus()
      pendingFocus.current = null
    }
  }

  return (
    <div ref={shellRef} className="gallery-shell site-shell" data-page={page} data-sidebar-collapsed={collapsed || undefined}>
      <a className="gallery-skip-link" href="#main-content">
        Skip to content
      </a>
      <header ref={headerRef} className="gallery-topbar site-header">
        <div className="gallery-desktop-toggle">
          <a className="site-logo" href={sitePath('home')} aria-label="BBB home"
            onClick={event => followSiteLink(event, () => navigatePage('home'))}><BrandLogo brand={bbbBrand} decorative /></a>
        </div>
        <div className="gallery-mobile-menu">
          <Sheet
            side="start"
            title="Browse BBB"
            open={menuOpen}
            onOpenChange={open => {
              if (!open && !pendingFocus.current) pendingFocus.current = 'menu'
              setMenuOpen(open)
            }}
            trigger={
              <Button ref={menuRef} variant="ghost" iconOnly aria-label="Open navigation">
                <Icon name="menu" />
              </Button>
            }
          >
            <div ref={menuContentRef} className="gallery-navigation-sheet">
              <a className="site-mobile-home" href={sitePath('home')} onClick={event => followSiteLink(event, () => navigatePage('home'))}>Home</a>
              <SiteNavigation page={page} category={category} onPageNavigate={navigatePage} onCategoryChange={category => navigate(category, true)} />
              {isComponentPage(page) ? <ComponentNavigation currentId={page} /> : <GalleryNavigation
                page={page} onPageNavigate={navigatePage}
                label="Gallery mobile navigation"
                category={category}
                onNavigate={navigate}
              />}
              <HelpResources getStartedHref={sitePath('getting-started')} />
            </div>
          </Sheet>
        </div>
        <a className="site-logo site-logo--mobile" href={sitePath('home')} aria-label="BBB home"
          onClick={event => followSiteLink(event, () => navigatePage('home'))}><BrandLogo brand={bbbBrand} decorative /></a>
        <div className="site-header__navigation"><SiteNavigation page={page} category={category} onPageNavigate={navigatePage} onCategoryChange={category => navigate(category, true)} /></div>
        <div className="site-header__tools">
          <SiteSearch />
          <a href={repositoryUrl} className="site-github" aria-label="BBB on GitHub">GitHub</a>
          {appearance}
        </div>
      </header>
      <aside
        id={sidebarId}
        className="gallery-sidebar site-sidebar"
        hidden={page === 'home'}
      >
        <div className="site-sidebar__heading"><span className="bbb-sidebar-reveal" data-hidden={collapsed || undefined}>Explore BBB</span>
          <SidebarToggle collapsed={collapsed} controls={sidebarId} onToggle={toggle} buttonRef={buttonRef} /></div>
        {isComponentPage(page) && !collapsed ? <ComponentNavigation currentId={page} /> : <GalleryNavigation page={page} onPageNavigate={navigatePage} label="Main navigation" category={category} onNavigate={navigate} compact={collapsed} />}
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
