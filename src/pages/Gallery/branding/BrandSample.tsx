import { useState } from 'react'
import type { BrandMode, BrandPreset } from '../../../foundations/brands'
import { ThemeProvider } from '../../../components/ThemeProvider/ThemeProvider'
import { BrandLogo } from '../../../components/BrandLogo/BrandLogo'
import { SidebarNavigation } from '../../../components/SidebarNavigation/SidebarNavigation'
import { TextField } from '../../../components/TextField/TextField'
import { Select } from '../../../components/Select/Select'
import { Button } from '../../../components/Button/Button'
import { Dialog } from '../../../components/Dialog/Dialog'
import { Table } from '../../../components/Table/Table'
import { Badge } from '../../../components/Badge/Badge'
import { Switch } from '../../../components/Switch/Switch'
import type { Density } from '../../../components/ThemeProvider/theme'

const rows = [{ id: 'identity', name: 'Brand identity', status: 'In progress' }, { id: 'launch', name: 'Launch checklist', status: 'Ready' }]
export function BrandSample({ brand, mode, density }: { brand: BrandPreset; mode: BrandMode; density: Density }) {
  const [current, setCurrent] = useState('overview')
  const [saved, setSaved] = useState(false)
  return <ThemeProvider brand={brand} mode={mode} density={density} className="brand-sample">
    <section aria-label="Brand application preview" className="brand-sample__content">
      <header><BrandLogo /><h4>A little room for your next idea.</h4><p>Plan your work, share a direction, and keep the details together.</p></header>
      <SidebarNavigation label="Brand preview navigation" currentId={current} onNavigate={setCurrent} groups={[{ id: 'workspace', items: [
        { id: 'overview', label: 'Overview', icon: 'layout-grid', href: '#brand-overview' },
        { id: 'projects', label: 'Projects', icon: 'layers', href: '#brand-projects' },
      ] }]} />
      {current === 'overview' ? <form className="brand-sample__form" onSubmit={event => { event.preventDefault(); setSaved(true) }}>
        <TextField label="Preview project name" defaultValue="A thoughtful beginning" required />
        <Select label="Preview project access" defaultValue="team" options={[{ id: 'team', label: 'Team members' }, { id: 'private', label: 'Only me' }]} />
        <Switch label="Send project updates" defaultChecked />
        <div className="preview-row"><Button type="submit">Save project</Button><Button variant="secondary" disabled>Invite later</Button></div>
        {saved && <p role="status">Your preview project is saved.</p>}
      </form> : <Table label="Brand preview projects" rows={rows} getRowId={row => row.id} getRowLabel={row => row.name} columns={[
        { id: 'name', label: 'Project', rowHeader: true, renderCell: row => row.name },
        { id: 'status', label: 'Status', renderCell: row => <Badge tone={row.status === 'Ready' ? 'success' : 'accent'}>{row.status}</Badge> },
      ]} />}
      <Dialog title="Share your direction" trigger={<Button variant="secondary">Preview dialog</Button>}>
        <div className="system-preview"><BrandLogo /><p>This space keeps the same identity as the project behind it.</p><TextField label="Preview invitation email" type="email" placeholder="alex@example.com" /></div>
      </Dialog>
    </section>
  </ThemeProvider>
}
