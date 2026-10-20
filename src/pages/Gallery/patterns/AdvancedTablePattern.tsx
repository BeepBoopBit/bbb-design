import { useState } from 'react'
import { Table } from '../../../components/Table/Table'
import { InlineEdit } from '../../../components/InlineEdit/InlineEdit'
import { DescriptionList } from '../../../components/DescriptionList/DescriptionList'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { Popover } from '../../../components/Popover/Popover'
import { Button } from '../../../components/Button/Button'
import { Toolbar } from '../../../components/Toolbar/Toolbar'
import { Badge } from '../../../components/Badge/Badge'
import './WorkflowPatterns.css'

const originalRows = [
  { id: 'brand', name: 'Brand refresh', owner: 'Alex Morgan', status: 'In progress', detail: 'Identity, guidelines, and a thoughtful rollout.' },
  { id: 'website', name: 'Website update', owner: 'Sam Rivera', status: 'Planning', detail: 'A clearer home for everything we make.' },
  { id: 'library', name: 'Component library', owner: 'Jordan Lee', status: 'In progress', detail: 'Shared foundations for a consistent product experience.' },
]

export function AdvancedTablePattern() {
  const [rows, setRows] = useState(originalRows)
  const [hidden, setHidden] = useState(new Set<string>())
  const [widths, setWidths] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState(new Set<string>())
  const [message, setMessage] = useState('Choose a project name to edit it. Expand a row for details.')
  return <div className="workflow-pattern workflow-pattern--wide">
    <header className="workflow-pattern__intro"><h4>Your view of the work</h4><p>Keep the details you need, with room to adjust.</p></header>
    <Toolbar label="Project table actions">
      <Popover title="Visible columns" trigger={<Button variant="secondary">Columns</Button>}>
        <div className="system-preview">
          <Checkbox label="Project" isSelected disabled />
          {['Owner', 'Status'].map(label => <Checkbox key={label} label={label} isSelected={!hidden.has(label.toLowerCase())} onChange={checked => {
            const next = new Set(hidden)
            if (checked) next.delete(label.toLowerCase()); else next.add(label.toLowerCase())
            setHidden(next)
          }} />)}
        </div>
      </Popover>
      <Button variant="ghost" onPress={() => { setWidths({}); setHidden(new Set()); setMessage('The default column layout is restored.') }}>Reset columns</Button>
    </Toolbar>
    <Table label="Editable projects" rows={rows} getRowId={row => row.id} getRowLabel={row => row.name}
      hiddenColumnIds={hidden} columnWidths={widths} onColumnResize={(id, width) => setWidths(current => ({ ...current, [id]: width }))}
      expandedRowIds={expanded} onExpandedRowsChange={setExpanded}
      renderExpandedRow={row => <DescriptionList items={[{ id: 'about', label: 'About this project', value: row.detail }, { id: 'owner', label: 'Owner', value: row.owner }]} />}
      columns={[
        { id: 'name', label: 'Project', rowHeader: true, renderCell: row => <InlineEdit label={`${row.name} project name`} value={row.name}
          validate={value => value.trim() ? undefined : 'Enter a project name.'}
          onSave={value => { setRows(current => current.map(item => item.id === row.id ? { ...item, name: value.trim() } : item)); setMessage('Project name saved.') }} /> },
        { id: 'owner', label: 'Owner', renderCell: row => row.owner },
        { id: 'status', label: 'Status', renderCell: row => <Badge tone={row.status === 'Planning' ? 'neutral' : 'accent'}>{row.status}</Badge> },
      ]} />
    <p className="preview-note">Drag a column boundary, or focus it and use arrow keys. Home and End reach the size limits.</p>
    <p role="status" className="preview-note">{message}</p>
  </div>
}
