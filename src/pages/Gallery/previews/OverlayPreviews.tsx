import { useState } from 'react'
import { Button } from '../../../components/Button/Button'
import { Dialog, ConfirmationDialog } from '../../../components/Dialog/Dialog'
import { DropdownMenu } from '../../../components/DropdownMenu/DropdownMenu'
import { Icon } from '../../../components/Icon/Icon'
import { Popover } from '../../../components/Popover/Popover'
import { Switch } from '../../../components/Switch/Switch'
import { TextField } from '../../../components/TextField/TextField'
import { Tooltip } from '../../../components/Tooltip/Tooltip'
import './Previews.css'

export function DropdownMenuPreview() {
  const [message, setMessage] = useState('A few useful actions, right where you need them.')
  return (
    <div className="preview-stack">
      <DropdownMenu
        label="Document actions"
        trigger={
          <Button variant="secondary">
            Document actions <Icon name="chevron-down" />
          </Button>
        }
        items={[
          { id: 'rename', label: 'Rename' },
          { id: 'duplicate', label: 'Duplicate' },
          { id: 'share', label: 'Share · unavailable', disabled: true },
          { id: 'delete', label: 'Delete', danger: true },
        ]}
        onAction={id => setMessage(`${id.charAt(0).toUpperCase() + id.slice(1)} selected.`)}
      />
      <p className="preview-note" role="status">
        {message}
      </p>
    </div>
  )
}

function DetailsForm({
  name,
  onSave,
  close,
}: {
  name: string
  onSave: (name: string) => void
  close: () => void
}) {
  const [draft, setDraft] = useState(name)
  return (
    <form
      onSubmit={event => {
        event.preventDefault()
        if (draft.trim()) {
          onSave(draft.trim())
          close()
        }
      }}
    >
      <TextField
        label="Display name"
        value={draft}
        onChange={event => setDraft(event.target.value)}
        required
        autoFocus
      />
      <div className="bbb-dialog__actions">
        <Button variant="secondary" onPress={close}>
          Cancel
        </Button>
        <Button type="submit" disabled={!draft.trim()}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

export function DialogPreview() {
  const [name, setName] = useState('Alex Morgan')
  return (
    <div className="preview-stack">
      <Dialog
        title="Your details"
        description="A familiar name makes everything feel a little more personal."
        trigger={<Button variant="secondary">Edit details</Button>}
      >
        {close => <DetailsForm name={name} onSave={setName} close={close} />}
      </Dialog>
      <p className="preview-note" role="status">
        Display name: {name}
      </p>
    </div>
  )
}

export function ConfirmationDialogPreview() {
  const [removed, setRemoved] = useState(false)
  return (
    <div className="preview-stack">
      <ConfirmationDialog
        title="Remove this draft?"
        description="This removes the draft from this example. You can restore it afterward."
        confirmLabel="Remove draft"
        danger
        trigger={
          <Button variant="danger" disabled={removed}>
            <Icon name="trash-2" />
            Remove draft
          </Button>
        }
        onConfirm={() => setRemoved(true)}
      />
      <Button variant="ghost" size="sm" disabled={!removed} onPress={() => setRemoved(false)}>
        Restore draft
      </Button>
      <p className="preview-note" role="status">
        {removed ? 'Draft removed.' : 'Your draft is ready.'}
      </p>
    </div>
  )
}

export function PopoverPreview() {
  const [enabled, setEnabled] = useState(true)
  return (
    <div className="preview-stack">
      <Popover
        title="Quick preferences"
        trigger={
          <Button variant="secondary">
            Preferences <Icon name="chevron-down" />
          </Button>
        }
      >
        <Switch
          label="Keep me updated"
          description="News about things that matter."
          checked={enabled}
          onChange={event => setEnabled(event.target.checked)}
        />
      </Popover>
      <p className="preview-note" role="status">
        Updates are {enabled ? 'on' : 'off'}.
      </p>
    </div>
  )
}

export function TooltipPreview() {
  const [count, setCount] = useState(0)
  return (
    <div className="preview-stack">
      <Tooltip content="Add another item">
        <Button
          variant="secondary"
          iconOnly
          aria-label="Add another item"
          onPress={() => setCount(previous => previous + 1)}
        >
          <Icon name="plus" />
        </Button>
      </Tooltip>
      <p className="preview-note" role="status">
        {count
          ? `${count} ${count === 1 ? 'item' : 'items'} added.`
          : 'Hover or focus for a little context.'}
      </p>
    </div>
  )
}
