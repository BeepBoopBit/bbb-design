import { useState } from 'react'
import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl'
import { WorkspaceShellPattern } from './WorkspaceShellPattern'

export function SidebarDropdownsPattern() {
  const [style, setStyle] = useState<'pages' | 'sections'>('pages')
  return (
    <div className="sidebar-dropdowns-pattern">
      <div className="sidebar-dropdowns-pattern__controls">
        <SegmentedControl label="Dropdown placement" value={style}
          onChange={value => setStyle(value as 'pages' | 'sections')}
          options={[{ value: 'pages', label: 'Pages' }, { value: 'sections', label: 'Sections' }]} />
      </div>
      <WorkspaceShellPattern key={style} navigationDropdowns={style} />
    </div>
  )
}
