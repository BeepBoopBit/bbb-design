import type { GalleryLocationState } from './useGalleryLocation'
import { useRef } from 'react'
import { Button } from '../../components/Button/Button'
import { FilterGroup } from '../../components/FilterGroup/FilterGroup'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { SearchField } from '../../components/SearchField/SearchField'
import { GallerySection } from './components/GallerySection'
import { galleryItems } from './galleryItems'
import type { GalleryCategory } from './galleryItems'
import './Gallery.css'

function GalleryEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <EmptyState
      className="gallery-empty"
      icon="search"
      headingLevel={2}
      title="No matches this time."
      description="Try another search or explore the full collection."
      action={
        <Button variant="secondary" onClick={onReset}>
          Reset filters
        </Button>
      }
    />
  )
}

export function Gallery({ location }: { location: GalleryLocationState }) {
  const { category, query, item: isolatedItem, navigate } = location
  function changeCategory(category: GalleryCategory) {
    navigate({ category, item: undefined })
  }
  function setQuery(query: string) {
    navigate({ query, item: undefined }, true)
  }
  const searchRef = useRef<HTMLInputElement>(null)
  const search = query.trim().toLowerCase()
  const matches = galleryItems.filter(
    item =>
      (!isolatedItem || item.id === isolatedItem) &&
      (category === 'all' || item.category === category) &&
      [item.name, item.category, item.description, item.detail, ...item.keywords]
        .join(' ')
        .toLowerCase()
        .includes(search),
  )
  const options: { value: GalleryCategory; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: galleryItems.length },
    {
      value: 'foundations',
      label: 'Foundations',
      count: galleryItems.filter(item => item.category === 'foundations').length,
    },
    {
      value: 'components',
      label: 'Components',
      count: galleryItems.filter(item => item.category === 'components').length,
    },
    {
      value: 'patterns',
      label: 'Patterns',
      count: galleryItems.filter(item => item.category === 'patterns').length,
    },
  ]
  const resetFilters = () => {
    navigate({ category: 'all', query: '', item: undefined })
    searchRef.current?.focus()
  }

  return (
    <>
      {isolatedItem && <Button variant="ghost" onPress={resetFilters}>Back to full Gallery</Button>}
      <header className="gallery-header">
        <div><h1>{isolatedItem ? galleryItems.find(item => item.id === isolatedItem)?.name : category === 'all' ? 'Gallery' : category[0].toUpperCase() + category.slice(1)}</h1>
          <p>{isolatedItem ? 'Try the example, explore its source, and make it your own.' : category === 'components' ? 'Thoughtful defaults. Real interactions. Source you can make your own.' : category === 'patterns' ? 'Shared components, composed into complete experiences.' : category === 'foundations' ? 'The choices behind the system: color, type, spacing, and interaction.' : `Explore ${galleryItems.length} foundations, components, and patterns.`}</p></div>
      </header>
      {!isolatedItem && <div className="gallery-toolbar">
        <FilterGroup
          label="Filter gallery"
          value={category}
          options={options}
          onChange={changeCategory}
        />
        <SearchField
          ref={searchRef}
          className="gallery-search"
          label="Search gallery"
          placeholder="Search the library"
          value={query}
          onChange={setQuery}
        />
      </div>}
      <p className="bbb-visually-hidden" role="status">
        {matches.length} {matches.length === 1 ? 'item' : 'items'} shown
        {search ? ` for “${query.trim()}”` : ''}.
      </p>
      {matches.length ? (
        <>
          <GallerySection
            id="foundations"
            title="Foundations"
            description="A quiet foundation for expressive work."
            icon="layers"
            items={matches.filter(item => item.category === 'foundations')}
          />
          <GallerySection
            id="components"
            title="Components"
            description="Familiar by design. Ready to interact with."
            icon="box"
            items={matches.filter(item => item.category === 'components')}
          />
          <GallerySection
            id="patterns"
            title="Patterns"
            description="Shared components, composed into complete experiences."
            icon="scan"
            items={matches.filter(item => item.category === 'patterns')}
          />
        </>
      ) : (
        <GalleryEmptyState onReset={resetFilters} />
      )}
      <footer className="gallery-footer">
        <span>BBB — care in every detail.</span>
        <span>Built with the same pieces you see here.</span>
      </footer>
    </>
  )
}
