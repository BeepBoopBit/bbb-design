import type { RefObject } from 'react'
import { FilterChips } from '../../../components/FilterChips/FilterChips'
import { Select } from '../../../components/Select/Select'
import { SearchField } from '../../../components/SearchField/SearchField'
import { emptyCollectionFilters, projectOwners, projectStatusLabels } from './collectionData'
import type { CollectionFilters, ProjectStatus } from './collectionData'

export function CollectionToolbar({
  filters,
  onChange,
  searchRef,
  disabled,
}: {
  filters: CollectionFilters
  onChange: (filters: CollectionFilters) => void
  searchRef: RefObject<HTMLInputElement | null>
  disabled: boolean
}) {
  const chips = [
    ...(filters.query.trim() ? [{ id: 'query', label: `Search: ${filters.query.trim()}` }] : []),
    ...(filters.status !== 'all'
      ? [{ id: 'status', label: `Status: ${projectStatusLabels[filters.status as ProjectStatus]}` }]
      : []),
    ...(filters.owner !== 'all' ? [{ id: 'owner', label: `Owner: ${filters.owner}` }] : []),
  ]
  return (
    <div className="collection-toolbar">
      <div className="collection-toolbar__fields">
        <SearchField
          ref={searchRef}
          label="Search projects"
          placeholder="Find a project"
          value={filters.query}
          onChange={query => onChange({ ...filters, query })}
          clearLabel="Clear project search"
          disabled={disabled}
        />
        <Select
          label="Project status"
          variant="subtle"
          hideLabel
          value={filters.status}
          disabled={disabled}
          onChange={status => onChange({ ...filters, status })}
          options={[
            { id: 'all', label: 'All statuses' },
            ...Object.entries(projectStatusLabels).map(([id, label]) => ({ id, label })),
          ]}
        />
        <Select
          label="Project owner"
          variant="subtle"
          hideLabel
          value={filters.owner}
          disabled={disabled}
          onChange={owner => onChange({ ...filters, owner })}
          options={[
            { id: 'all', label: 'Everyone' },
            ...projectOwners.map(name => ({ id: name, label: name })),
          ]}
        />
      </div>
      <FilterChips
        label="Project filters"
        items={chips}
        disabled={disabled}
        emptyFocusRef={searchRef}
        onRemove={id =>
          onChange({ ...filters, [id]: emptyCollectionFilters[id as keyof CollectionFilters] })
        }
        onClear={() => onChange(emptyCollectionFilters)}
      />
    </div>
  )
}
