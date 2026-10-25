import { useEffect, useState } from 'react'
import { galleryItems } from './galleryItems'
import type { GalleryCategory } from './galleryItems'

export type SitePage = 'home' | 'gallery' | 'getting-started' | 'button'
export const sitePath = (page: SitePage) => `${import.meta.env.BASE_URL}${page === 'home' ? '' : page === 'button' ? 'components/button' : page}`
export const examplePath = (id: string) => id === 'button' ? sitePath('button') : `${sitePath('gallery')}?item=${encodeURIComponent(id)}`
type GalleryLocation = { page: SitePage; category: GalleryCategory; query: string; item?: string }
function readLocation(): GalleryLocation {
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category')
  const item = params.get('item') ?? undefined
  const pathname = window.location.pathname.replace(/\/$/, '')
  const page: SitePage = pathname === sitePath('getting-started') ? 'getting-started'
    : pathname === sitePath('button') ? 'button'
    : pathname === sitePath('home').replace(/\/$/, '') && !params.has('item') && !params.has('category') && !params.has('q') ? 'home' : 'gallery'
  return {
    page,
    category: category === 'foundations' || category === 'components' || category === 'patterns' ? category : 'all',
    query: params.get('q') ?? '',
    item: galleryItems.some(entry => entry.id === item) ? item : undefined,
  }
}
export function useGalleryLocation() {
  const [location, setLocation] = useState(readLocation)
  useEffect(() => {
    const restore = () => setLocation(readLocation())
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])
  function navigate(patch: Partial<GalleryLocation>, replace = false) {
    const next = { ...location, ...patch }
    const url = new URL(window.location.href)
    url.pathname = sitePath(next.page)
    for (const key of ['category', 'q', 'product', 'item']) url.searchParams.delete(key)
    if (next.page === 'gallery') {
      if (next.category !== 'all') url.searchParams.set('category', next.category)
      if (next.query) url.searchParams.set('q', next.query)
      if (next.item) url.searchParams.set('item', next.item)
    }
    url.hash = ''
    if (url.href !== window.location.href) window.history[replace ? 'replaceState' : 'pushState'](null, '', url)
    setLocation(next)
    if (next.page !== location.page) window.scrollTo(0, 0)
  }
  return { ...location, navigate }
}

export type GalleryLocationState = ReturnType<typeof useGalleryLocation>
