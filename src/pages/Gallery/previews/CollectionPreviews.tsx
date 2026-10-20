import { useId, useRef, useState } from 'react'
import { Badge } from '../../../components/Badge/Badge'
import { Breadcrumbs } from '../../../components/Breadcrumbs/Breadcrumbs'
import { Button } from '../../../components/Button/Button'
import { FilterChips } from '../../../components/FilterChips/FilterChips'
import { Link } from '../../../components/Link/Link'
import { Pagination } from '../../../components/Pagination/Pagination'
import { Select } from '../../../components/Select/Select'
import { Table } from '../../../components/Table/Table'
import type { TableSort } from '../../../components/Table/Table'
import './CollectionPreviews.css'

export function LinkPreview() {
  const detailId = useId()
  return (
    <div className="preview-stack">
      <Link href={`#${detailId}`}>Read the details</Link>
      <Link href="https://example.com" external>
        Visit example.com
      </Link>
      <p id={detailId} tabIndex={-1} className="preview-note">
        A link takes you somewhere. A button performs an action.
      </p>
    </div>
  )
}

export function BreadcrumbsPreview() {
  const overviewId = useId()
  return (
    <div className="content-preview">
      <Breadcrumbs
        label="Example location"
        items={[
          { id: 'workspace', label: 'Workspace', href: `#${overviewId}` },
          { id: 'projects', label: 'Projects' },
        ]}
      />
      <p id={overviewId} tabIndex={-1} className="preview-note">
        Workspace overview. Your current location stays clear.
      </p>
    </div>
  )
}

const exampleFilters = [
  { id: 'owner', label: 'Owner: Alex' },
  { id: 'status', label: 'Status: Active' },
]
export function FilterChipsPreview() {
  const [filters, setFilters] = useState(exampleFilters)
  const restoreRef = useRef<HTMLButtonElement>(null)
  return (
    <div className="content-preview">
      <FilterChips
        label="Example filters"
        items={filters}
        onRemove={id => setFilters(current => current.filter(item => item.id !== id))}
        onClear={() => setFilters([])}
        emptyFocusRef={restoreRef}
      />
      <FilterChips
        label="Fixed filters"
        items={[{ id: 'workspace', label: 'Workspace: Design', disabled: true }]}
        onRemove={() => {}}
        emptyFocusRef={restoreRef}
      />
      <Button ref={restoreRef} variant="ghost" size="sm" onPress={() => setFilters(exampleFilters)}>
        Restore filters
      </Button>
      <p role="status" className="preview-note">
        {filters.length
          ? `${filters.length} removable filters. Workspace is fixed.`
          : 'Filters cleared. Workspace stays fixed.'}
      </p>
    </div>
  )
}

export function PaginationPreview() {
  const [page, setPage] = useState(1)
  const [empty, setEmpty] = useState(false)
  return (
    <div className="content-preview">
      <Pagination
        label="Example pages"
        page={page}
        pageSize={10}
        totalItems={empty ? 0 : 128}
        onPageChange={setPage}
      />
      <Button
        variant="ghost"
        size="sm"
        onPress={() => {
          setEmpty(!empty)
          setPage(1)
        }}
      >
        {empty ? 'Restore results' : 'Clear results'}
      </Button>
    </div>
  )
}

const tablePeople = [
  { id: 'alex', name: 'Alex Morgan', role: 'Owner', joined: 1, available: true },
  { id: 'jamie', name: 'Jamie Chen', role: 'Member', joined: 3, available: true },
  { id: 'robin', name: 'Robin Lee', role: 'Managed', joined: 2, available: false },
]
export function TablePreview() {
  const [sort, setSort] = useState<TableSort>({ column: 'name', direction: 'ascending' })
  const [selected, setSelected] = useState(new Set<string>())
  const [mode, setMode] = useState('ready')
  const [message, setMessage] = useState(
    'Choose rows or sort a column. Managed members cannot be selected.',
  )
  const people = [...tablePeople].sort(
    (a, b) =>
      (sort.column === 'joined' ? a.joined - b.joined : a.name.localeCompare(b.name)) *
      (sort.direction === 'ascending' ? 1 : -1),
  )
  return (
    <div className="content-preview">
      <Select
        label="Table example state"
        value={mode}
        onChange={value => {
          setMode(value)
          setSelected(new Set())
        }}
        options={[
          { id: 'ready', label: 'Ready' },
          { id: 'loading', label: 'Loading' },
          { id: 'empty', label: 'Empty' },
        ]}
      />
      <Table
        label="Example members"
        rows={mode === 'empty' ? [] : people}
        getRowId={row => row.id}
        getRowLabel={row => row.name}
        loading={mode === 'loading'}
        sort={sort}
        onSortChange={setSort}
        selection={{
          selectedIds: selected,
          onChange: setSelected,
          isDisabled: row => !row.available,
        }}
        columns={[
          {
            id: 'name',
            label: 'Name',
            rowHeader: true,
            sortable: true,
            renderCell: row => row.name,
          },
          {
            id: 'role',
            label: 'Role',
            renderCell: row => (
              <Badge tone={row.role === 'Owner' ? 'accent' : 'neutral'}>{row.role}</Badge>
            ),
          },
          { id: 'joined', label: 'Joined', sortable: true, renderCell: row => `Sep ${row.joined}` },
          {
            id: 'actions',
            label: 'Actions',
            align: 'end',
            renderCell: row => (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`View ${row.name}`}
                onPress={() =>
                  setMessage(`${row.name} has the ${row.role.toLowerCase()} role in this preview.`)
                }
              >
                View
              </Button>
            ),
          },
        ]}
      />
      <p className="preview-note" role="status">
        {selected.size > 0 &&
          `${selected.size} ${selected.size === 1 ? 'member' : 'members'} selected. `}
        {message}
      </p>
    </div>
  )
}
