import type { MouseEvent } from 'react'
import type { SitePage } from '../Gallery/useGalleryLocation'
import { sitePath } from '../Gallery/useGalleryLocation'
import type { GalleryCategory } from '../Gallery/galleryItems'
import { isComponentPage } from '../ComponentDocs/componentRoutes'

export type SiteNavigationProps = {
  page: SitePage
  category: GalleryCategory
  onPageNavigate: (page: SitePage) => void
  onCategoryChange: (category: GalleryCategory) => void
}

export function followSiteLink(event: MouseEvent<HTMLAnchorElement>, navigate: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate()
}

export function SiteNavigation({ page, category, onPageNavigate, onCategoryChange }: SiteNavigationProps) {
  return <nav className="site-navigation" aria-label="Site navigation">
    <a href={sitePath('getting-started')} aria-current={page === 'getting-started' ? 'page' : undefined}
      onClick={event => followSiteLink(event, () => onPageNavigate('getting-started'))}>Docs</a>
    {(['components', 'patterns', 'foundations'] as const).map(id => <a key={id}
      href={`${sitePath('gallery')}?category=${id}`}
      aria-current={(page === 'gallery' && category === id) || (isComponentPage(page) && id === 'components') ? 'page' : undefined}
      onClick={event => followSiteLink(event, () => onCategoryChange(id))}>
      {id[0].toUpperCase() + id.slice(1)}
    </a>)}
  </nav>
}
