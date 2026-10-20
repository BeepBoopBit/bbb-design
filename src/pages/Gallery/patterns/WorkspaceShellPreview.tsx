import { useState } from 'react'
import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl'
import { WorkspaceShellPattern } from './WorkspaceShellPattern'
import { DocumentWorkspacePattern } from './DocumentWorkspacePattern'

export function WorkspaceShellPreview() {
  const [variant, setVariant] = useState('branded')
  return (
    <div className="sidebar-dropdowns-pattern">
      <div className="sidebar-dropdowns-pattern__controls">
        <SegmentedControl className="workspace-shell-preview__variants" label="Workspace layout" value={variant} onChange={setVariant}
          options={[
            { value: 'branded', label: 'Branded' },
            { value: 'document', label: 'Document' },
          ]} />
      </div>
      <div hidden={variant !== 'branded'}><WorkspaceShellPattern /></div>
      <div hidden={variant !== 'document'}><DocumentWorkspacePattern /></div>
    </div>
  )
}
