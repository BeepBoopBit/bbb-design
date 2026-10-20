import { useId, useState } from 'react'
import { Button } from '../../../components/Button/Button'
import { Sheet } from '../../../components/Sheet/Sheet'
import { Switch } from '../../../components/Switch/Switch'
import { TextField } from '../../../components/TextField/TextField'
import { Textarea } from '../../../components/Textarea/Textarea'

export type WorkspaceDetailsValue = { name: string; description: string; digest: boolean }

function WorkspaceDetailsForm({
  value,
  formId,
  onSave,
}: {
  value: WorkspaceDetailsValue
  formId: string
  onSave: (value: WorkspaceDetailsValue) => void
}) {
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState('')
  return (
    <form
      id={formId}
      className="workspace-details-form"
      noValidate
      onSubmit={event => {
        event.preventDefault()
        if (!draft.name.trim()) {
          setError('Give your workspace a name.')
          event.currentTarget.querySelector<HTMLInputElement>('input')?.focus()
          return
        }
        onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim() })
      }}
    >
      <TextField
        label="Workspace display name"
        autoFocus
        required
        value={draft.name}
        error={error}
        onChange={event => {
          setDraft({ ...draft, name: event.target.value })
          setError('')
        }}
      />
      <Textarea
        label="Workspace description"
        value={draft.description}
        onChange={event => setDraft({ ...draft, description: event.target.value })}
      />
      <Switch
        label="Send a weekly workspace summary"
        checked={draft.digest}
        onChange={event => setDraft({ ...draft, digest: event.target.checked })}
        description="A quiet recap of your team's progress."
      />
    </form>
  )
}

export function WorkspaceDetails({
  value,
  onSave,
}: {
  value: WorkspaceDetailsValue
  onSave: (value: WorkspaceDetailsValue) => void
}) {
  const formId = useId()
  return (
    <Sheet
      trigger={<Button variant="secondary">Workspace details</Button>}
      title="Workspace details"
      description="Make this space feel like your team."
      footer={close => (
        <>
          <Button variant="secondary" onPress={close}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            Save workspace
          </Button>
        </>
      )}
    >
      {close => (
        <WorkspaceDetailsForm
          formId={formId}
          value={value}
          onSave={next => {
            onSave(next)
            close()
          }}
        />
      )}
    </Sheet>
  )
}
