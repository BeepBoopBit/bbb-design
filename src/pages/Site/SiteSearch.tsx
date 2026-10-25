import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { CommandPalette } from '../../components/CommandPalette/CommandPalette'
import { galleryItems } from '../Gallery/galleryItems'
import { examplePath, sitePath } from '../Gallery/useGalleryLocation'

const items = [
  { id: 'home', label: 'Home', group: 'Start here', href: sitePath('home'), keywords: ['overview', 'design system'] },
  { id: 'getting-started', label: 'Get started', group: 'Start here', href: sitePath('getting-started'), keywords: ['install', 'setup', 'docs', 'CLI'] },
  ...galleryItems.map(item => ({ id: item.id, label: item.name,
    group: item.category[0].toUpperCase() + item.category.slice(1), description: item.description,
    keywords: item.keywords, href: examplePath(item.id) })),
]

export function SiteSearch() {
  return <CommandPalette title="Search BBB" searchLabel="Search documentation and examples"
    placeholder="Find a component, pattern, or guide…" items={items} onAction={() => {}}
    trigger={<Button variant="secondary" className="site-search" aria-label="Search documentation">
      <Icon name="search" /><span>Search documentation…</span>
    </Button>} />
}
