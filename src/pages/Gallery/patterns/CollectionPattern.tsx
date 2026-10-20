import { useEffect, useId, useRef, useState } from 'react'
import { Breadcrumbs } from '../../../components/Breadcrumbs/Breadcrumbs'
import { Button } from '../../../components/Button/Button'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Icon } from '../../../components/Icon/Icon'
import { Pagination } from '../../../components/Pagination/Pagination'
import { Table } from '../../../components/Table/Table'
import type { TableSort } from '../../../components/Table/Table'
import { CollectionToolbar } from './CollectionToolbar'
import {
  ProjectActions,
  ProjectNameCell,
  ProjectOwnerCell,
  ProjectStatusBadge,
} from './CollectionProjectCells'
import { emptyCollectionFilters, initialProjects, projectUpdatedLabel } from './collectionData'
import type { CollectionFilters, ProjectStatus } from './collectionData'
import './CollectionPattern.css'

const pageSize = 5

export function CollectionPattern() {
  const headingId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const restoreSearch = useRef(false)
  const [projects, setProjects] = useState(initialProjects)
  const [filters, setFilters] = useState(emptyCollectionFilters)
  const [sort, setSort] = useState<TableSort>({ column: 'updated', direction: 'descending' })
  const [selected, setSelected] = useState(new Set<string>())
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Sample projects. Changes stay in this preview.')
  useEffect(() => () => clearTimeout(refreshTimer.current), [])
  useEffect(() => {
    if (restoreSearch.current) {
      searchRef.current?.focus()
      restoreSearch.current = false
    }
  }, [projects])

  const matching = projects
    .filter(
      project =>
        (filters.status === 'all' || project.status === filters.status) &&
        (filters.owner === 'all' || project.owner === filters.owner) &&
        `${project.name} ${project.summary} ${project.owner}`
          .toLowerCase()
          .includes(filters.query.trim().toLowerCase()),
    )
    .sort(
      (a, b) =>
        (sort.column === 'name' ? a.name.localeCompare(b.name) : a.updated - b.updated) *
        (sort.direction === 'ascending' ? 1 : -1),
    )
  const currentPage = Math.min(page, Math.max(1, Math.ceil(matching.length / pageSize)))
  const visible = matching.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function changeFilters(next: CollectionFilters) {
    setFilters(next)
    setPage(1)
    setSelected(new Set())
    setMessage('Filters updated.')
  }
  function updateStatus(id: string, status: ProjectStatus) {
    restoreSearch.current = filters.status !== 'all' && filters.status !== status
    const project = projects.find(item => item.id === id)
    setProjects(current => current.map(item => (item.id === id ? { ...item, status } : item)))
    setSelected(current => new Set([...current].filter(value => value !== id)))
    setMessage(
      `${project?.name} ${status === 'archived' ? 'archived' : 'restored'} in this preview.`,
    )
  }
  function refresh() {
    if (loading) return
    setLoading(true)
    setMessage('Refreshing projects…')
    // Simulate a local data request; this is not an animation duration.
    refreshTimer.current = setTimeout(() => {
      setLoading(false)
      setMessage('Projects are up to date.')
    }, 800)
  }

  return (
    <div className="collection-pattern" role="group" aria-label="Project collection example">
      <Breadcrumbs
        label="Project location"
        items={[
          { id: 'workspace', label: 'Workspace', href: `#${headingId}` },
          { id: 'projects', label: 'Projects' },
        ]}
      />
      <header className="collection-pattern__header">
        <div>
          <h4 id={headingId} tabIndex={-1}>
            A little space for great work.
          </h4>
          <p>Your projects, with the important details close at hand.</p>
        </div>
        <Button
          variant="secondary"
          aria-disabled={loading || undefined}
          aria-busy={loading || undefined}
          onPress={refresh}
        >
          <Icon name="refresh-cw" />
          {loading ? 'Refreshing…' : 'Refresh projects'}
        </Button>
      </header>
      <CollectionToolbar
        filters={filters}
        onChange={changeFilters}
        searchRef={searchRef}
        disabled={loading}
      />
      <div className="collection-pattern__bulk">
        <p role="status">
          {selected.size
            ? `${selected.size} selected across pages`
            : `${matching.length} ${matching.length === 1 ? 'project' : 'projects'}`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading || !selected.size}
          onPress={() => {
            const count = selected.size
            setProjects(current =>
              current.map(project =>
                selected.has(project.id) ? { ...project, status: 'archived' } : project,
              ),
            )
            setSelected(new Set())
            setPage(1)
            setMessage(`${count} ${count === 1 ? 'project' : 'projects'} archived in this preview.`)
            searchRef.current?.focus()
          }}
        >
          Archive selected
        </Button>
      </div>
      <Table
        label="Projects"
        rows={visible}
        getRowId={row => row.id}
        getRowLabel={row => row.name}
        loading={loading}
        sort={sort}
        onSortChange={next => {
          setSort(next)
          setPage(1)
          setSelected(new Set())
        }}
        selection={{
          selectedIds: selected,
          onChange: setSelected,
          isDisabled: row => row.status === 'archived',
        }}
        emptyState={
          <EmptyState
            title="No projects found"
            description="Try another search or clear your filters to see all projects."
            icon="search"
            headingLevel={4}
            action={
              <Button
                variant="secondary"
                onPress={() => {
                  changeFilters(emptyCollectionFilters)
                  searchRef.current?.focus()
                }}
              >
                Clear project filters
              </Button>
            }
          />
        }
        columns={[
          {
            id: 'name',
            label: 'Project',
            rowHeader: true,
            sortable: true,
            renderCell: project => <ProjectNameCell project={project} />,
          },
          {
            id: 'owner',
            label: 'Owner',
            renderCell: project => <ProjectOwnerCell name={project.owner} />,
          },
          {
            id: 'status',
            label: 'Status',
            renderCell: project => <ProjectStatusBadge status={project.status} />,
          },
          {
            id: 'updated',
            label: 'Updated',
            sortable: true,
            renderCell: project => projectUpdatedLabel(project.updated),
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'end',
            renderCell: project => (
              <ProjectActions project={project} onStatusChange={updateStatus} />
            ),
          },
        ]}
      />
      <Pagination
        label="Project pages"
        page={currentPage}
        pageSize={pageSize}
        totalItems={matching.length}
        disabled={loading}
        onPageChange={setPage}
      />
      <p className="collection-pattern__status" role="status">
        {message}
      </p>
    </div>
  )
}
