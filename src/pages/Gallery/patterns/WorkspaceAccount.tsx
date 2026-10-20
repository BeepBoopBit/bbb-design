import { WorkspaceSwitcher } from '../../../components/WorkspaceSwitcher/WorkspaceSwitcher'
import { useState } from 'react'
import './WorkspaceAccount.css'
import { Avatar } from '../../../components/Avatar/Avatar'
import { Button } from '../../../components/Button/Button'
import { Icon } from '../../../components/Icon/Icon'
import { AccountMenu } from '../../../components/AccountMenu/AccountMenu'
import { TextField } from '../../../components/TextField/TextField'
import { WorkspaceDetails } from './WorkspaceDetails'
import type { WorkspaceDetailsValue } from './WorkspaceDetails'

export function WorkspaceAccount({ workspaces, active, onSwitch, onSave, signedOut, onSessionChange }: {
  workspaces: WorkspaceDetailsValue[]
  active: number
  onSwitch: (index: number) => void
  onSave: (value: WorkspaceDetailsValue) => void
  signedOut: boolean
  onSessionChange: (signedOut: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Alex Morgan')
  const [editing, setEditing] = useState(false)
  return (
    <AccountMenu className="workspace-account-popover" name={signedOut ? 'Signed out' : name.trim() || 'Your account'} open={open} onOpenChange={setOpen} trigger={
      <Button variant="ghost" className="workspace-account-trigger" aria-label={signedOut ? 'Account, signed out' : `${workspaces[active].name}, account and workspaces`}>
        <span>{signedOut ? 'Account' : workspaces[active].name}</span>
        <Avatar name={name} size="sm" decorative />
        <Icon name="chevron-down" />
      </Button>
    }>
      <div className="workspace-account-menu">
        {signedOut ? <>
          <p className="preview-note">You’re signed out of this preview.</p>
          <Button onPress={() => { onSessionChange(false); setOpen(false) }}>Sign in to preview</Button>
        </> : <>
          <p className="preview-note">alex@example.com</p>
          <WorkspaceSwitcher variant="list" label="Workspaces" className="workspace-account-menu__group"
            workspaces={workspaces.map((workspace, index) => ({ id: String(index), label: workspace.name }))}
            value={String(active)} onChange={id => { onSwitch(Number(id)); setOpen(false) }}
            actions={<WorkspaceDetails value={workspaces[active]} onSave={onSave} />} />
          <div className="workspace-account-menu__group">
            <Button variant="ghost" aria-expanded={editing} onPress={() => setEditing(!editing)}>Account settings</Button>
            {editing && <TextField label="Display name" value={name} onChange={event => setName(event.target.value)} hint="Changes stay in this preview." />}
          </div>
          <div className="workspace-account-menu__group">
            <Button variant="ghost" onPress={() => { onSessionChange(true); setOpen(false) }}>Log out</Button>
          </div>
        </>}
      </div>
    </AccountMenu>
  )
}
