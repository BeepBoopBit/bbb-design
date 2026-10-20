import type { ReactNode } from 'react'
import { Fragment, useId } from 'react'
import { useMessages } from '../LocaleProvider/locale'
import { ColumnResizer } from './ColumnResizer'
import { Button } from '../Button/Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { EmptyState } from '../EmptyState/EmptyState'
import { Icon } from '../Icon/Icon'
import { Skeleton } from '../Skeleton/Skeleton'
import './Table.css'

export type TableSort = { column: string; direction: 'ascending' | 'descending' }
export type TableColumn<Row> = {
  id: string
  label: string
  renderCell: (row: Row) => ReactNode
  rowHeader?: boolean
  sortable?: boolean
  align?: 'start' | 'end'
}
export type TableProps<Row> = {
  label: string
  rows: Row[]
  columns: TableColumn<Row>[]
  getRowId: (row: Row) => string
  getRowLabel: (row: Row) => string
  sort?: TableSort
  onSortChange?: (sort: TableSort) => void
  selection?: {
    selectedIds: ReadonlySet<string>
    onChange: (ids: Set<string>) => void
    isDisabled?: (row: Row) => boolean
  }
  loading?: boolean
  emptyState?: ReactNode
  hiddenColumnIds?: ReadonlySet<string>
  columnWidths?: Readonly<Record<string, number>>
  onColumnResize?: (id: string, width: number) => void
  expandedRowIds?: ReadonlySet<string>
  onExpandedRowsChange?: (ids: Set<string>) => void
  renderExpandedRow?: (row: Row) => ReactNode
}

export function Table<Row>({
  label,
  rows,
  columns,
  getRowId,
  getRowLabel,
  sort,
  onSortChange,
  selection,
  loading = false,
  emptyState,
  hiddenColumnIds,
  columnWidths = {},
  onColumnResize,
  expandedRowIds = new Set(),
  onExpandedRowsChange,
  renderExpandedRow,
}: TableProps<Row>) {
  const { t } = useMessages()
  const id = useId()
  const visible = columns.filter(column => column.rowHeader || !hiddenColumnIds?.has(column.id))
  const displayed = visible.length ? visible : columns.slice(0, 1)
  const expandable = Boolean(renderExpandedRow && onExpandedRowsChange)
  const selectableRows = rows.filter(row => !selection?.isDisabled?.(row))
  const selectedCount = selectableRows.filter(row =>
    selection?.selectedIds.has(getRowId(row)),
  ).length
  const allSelected = selectableRows.length > 0 && selectedCount === selectableRows.length
  const columnCount = displayed.length + (selection ? 1 : 0) + (expandable ? 1 : 0)
  if (!loading && !rows.length)
    return (
      <div className="bbb-table-container">
        {emptyState ?? (
          <EmptyState title={t('noRows')} description={t('noRowsHint')} />
        )}
      </div>
    )
  return (
    <div className="bbb-table-container">
      <div
        className="bbb-table-scroll"
        role="region"
        aria-label={t('tableArea', { name: label })}
        tabIndex={0}
      >
        <table className={`bbb-table ${onColumnResize ? 'bbb-table--resizable' : ''}`} aria-label={label} aria-busy={loading || undefined}
          style={onColumnResize ? { width: `calc(${displayed.map(column => columnWidths[column.id] === undefined ? 'var(--bbb-column-default-width)' : `${columnWidths[column.id]}px`).concat(Array.from({ length: (selection ? 1 : 0) + (expandable ? 1 : 0) }, () => 'var(--bbb-control-height)')).join(' + ')})` } : undefined}
        >
          {onColumnResize && <colgroup>
            {expandable && <col className="bbb-table__utility-column" />}
            {selection && <col className="bbb-table__utility-column" />}
            {displayed.map(column => <col key={column.id} style={{ width: columnWidths[column.id] === undefined ? 'var(--bbb-column-default-width)' : `${columnWidths[column.id]}px` }} />)}
          </colgroup>}
          <thead>
            <tr>
              {expandable && <th scope="col" className="bbb-table__selection"><span className="bbb-visually-hidden">{t('rowDetails')}</span></th>}
              {selection && (
                <th scope="col" className="bbb-table__selection">
                  <Checkbox
                    label={t('selectAllRows')}
                    hideLabel
                    isSelected={allSelected}
                    isIndeterminate={selectedCount > 0 && !allSelected}
                    disabled={loading || !selectableRows.length}
                    onChange={checked => {
                      const next = new Set(selection.selectedIds)
                      selectableRows.forEach(row => {
                        if (checked) next.add(getRowId(row))
                        else next.delete(getRowId(row))
                      })
                      selection.onChange(next)
                    }}
                  />
                </th>
              )}
              {displayed.map(column => (
                <th
                  key={column.id}
                  scope="col"
                  className={column.align === 'end' ? 'bbb-table__end' : undefined}
                  aria-sort={
                    column.sortable && onSortChange
                      ? sort?.column === column.id
                        ? sort.direction
                        : 'none'
                      : undefined
                  }
                >
                  {column.sortable && onSortChange ? (
                    <Button
                      variant="ghost"
                      className="bbb-table__sort"
                      disabled={loading}
                      aria-label={t(sort?.column === column.id && sort.direction === 'ascending' ? 'sortDescending' : 'sortAscending', { name: column.label })}
                      onPress={() =>
                        onSortChange({
                          column: column.id,
                          direction:
                            sort?.column === column.id && sort.direction === 'ascending'
                              ? 'descending'
                              : 'ascending',
                        })
                      }
                    >
                      {column.label}
                      <Icon
                        name={
                          sort?.column === column.id
                            ? sort.direction === 'ascending'
                              ? 'arrow-up'
                              : 'arrow-down'
                            : 'chevrons-up-down'
                        }
                      />
                    </Button>
                  ) : (
                    column.label
                  )}
                  {onColumnResize && <ColumnResizer label={column.label} width={columnWidths[column.id]} onResize={width => onColumnResize(column.id, width)} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 3 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {Array.from({ length: columnCount }, (_, cell) => (
                      <td key={cell}>
                        <Skeleton />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map(row => (
                <Fragment key={getRowId(row)}>
                  <tr
                    key={getRowId(row)}
                    data-selected={selection?.selectedIds.has(getRowId(row)) || undefined}
                  >
                    {expandable && <td className="bbb-table__selection">
                      <Button variant="ghost" size="sm" iconOnly
                        aria-label={t(expandedRowIds.has(getRowId(row)) ? 'collapseRow' : 'expandRow', { name: getRowLabel(row) })}
                        aria-expanded={expandedRowIds.has(getRowId(row))}
                        aria-controls={`${id}-${encodeURIComponent(getRowId(row))}`}
                        onPress={() => {
                          const next = new Set(expandedRowIds)
                          if (next.has(getRowId(row))) next.delete(getRowId(row)); else next.add(getRowId(row))
                          onExpandedRowsChange?.(next)
                        }}
                      ><Icon name={expandedRowIds.has(getRowId(row)) ? 'chevron-down' : 'chevron-right'} /></Button>
                    </td>}
                    {selection && (
                      <td className="bbb-table__selection">
                        <Checkbox
                          label={t('selectRow', { name: getRowLabel(row) })}
                          hideLabel
                          isSelected={selection.selectedIds.has(getRowId(row))}
                          disabled={selection.isDisabled?.(row)}
                          onChange={checked => {
                            const next = new Set(selection.selectedIds)
                            if (checked) next.add(getRowId(row))
                            else next.delete(getRowId(row))
                            selection.onChange(next)
                          }}
                        />
                      </td>
                    )}
                    {displayed.map(column => {
                      const Cell = column.rowHeader ? 'th' : 'td'
                      return (
                        <Cell
                          key={column.id}
                          scope={column.rowHeader ? 'row' : undefined}
                          className={`${column.rowHeader ? 'bbb-table__primary' : ''} ${column.align === 'end' ? 'bbb-table__end' : ''}`}
                        >
                          {column.renderCell(row)}
                        </Cell>
                      )
                    })}
                  </tr>
                  {expandable && <tr hidden={!expandedRowIds.has(getRowId(row))} className="bbb-table__details">
                    <td colSpan={columnCount}><div id={`${id}-${encodeURIComponent(getRowId(row))}`}>{expandedRowIds.has(getRowId(row)) && renderExpandedRow?.(row)}</div></td>
                  </tr>}
                </Fragment>
                ))}
          </tbody>
        </table>
      </div>
      <p className="bbb-table__hint">{t('scrollColumns')}</p>
      <span className="bbb-visually-hidden" role="status">
        {loading ? t('loading', { name: label }) : ''}
      </span>
    </div>
  )
}
