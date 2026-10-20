import { SidebarNavigation } from '../../../components/SidebarNavigation/SidebarNavigation'
import type { SidebarNavigationGroup } from '../../../components/SidebarNavigation/SidebarNavigation'
import type { IconName } from '../../../components/Icon/Icon'
import { galleryItems } from '../galleryItems'
import type { GalleryCategory } from '../galleryItems'
import { sitePath } from '../useGalleryLocation'
import type { SitePage } from '../useGalleryLocation'

const categories: { id: Exclude<GalleryCategory, 'all'>; label: string; icon: IconName }[] = [
  { id: 'foundations', label: 'Foundations', icon: 'layers' },
  { id: 'components', label: 'Components', icon: 'box' },
  { id: 'patterns', label: 'Patterns', icon: 'scan' },
]
const groups: SidebarNavigationGroup[] = [
  {
    id: 'workspace',
    items: [
      { id: 'getting-started', label: 'Get started', icon: 'file-text', href: sitePath('getting-started') },
      { id: 'all', label: 'Gallery', icon: 'layout-grid', href: `${sitePath('gallery')}#main-content` },
    ],
  },
  {
    id: 'library',
    label: 'Library',
    items: categories.map(category => ({
      ...category,
      href: `${sitePath('gallery')}?category=${category.id}#${category.id}-title`,
      badge: String(galleryItems.filter(item => item.category === category.id).length),
    })),
  },
]

export function GalleryNavigation({
  category,
  onNavigate,
  label,
  compact,
  page,
  onPageNavigate,
}: {
  category: GalleryCategory
  onNavigate: (category: GalleryCategory) => void
  label: string
  compact?: boolean
  page: SitePage
  onPageNavigate: (page: SitePage) => void
}) {
  return (
    <SidebarNavigation
      label={label}
      groups={groups}
      currentId={page === 'getting-started' ? page : category}
      compact={compact}
      onNavigate={id => {
        if (id === 'getting-started' || id === 'all') {
          onPageNavigate(id === 'getting-started' ? 'getting-started' : 'gallery')
          return
        }
        if (categories.some(category => category.id === id)) {
          onNavigate(id as GalleryCategory)
        }
      }}
    />
  )
}
