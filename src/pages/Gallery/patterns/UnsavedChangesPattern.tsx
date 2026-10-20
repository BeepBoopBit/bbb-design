import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/Button/Button'
import { ConfirmationDialog } from '../../../components/Dialog/Dialog'
import { TextField } from '../../../components/TextField/TextField'
import { Textarea } from '../../../components/Textarea/Textarea'
import { Alert } from '../../../components/Alert/Alert'
import { useDemoRequest } from './useDemoRequest'
import './WorkflowPatterns.css'
const original = { title: 'Design review', note: 'Bring a few ideas and an open mind.' }
export function UnsavedChangesPattern() {
  const [saved, setSaved] = useState(original)
  const [draft, setDraft] = useState(original)
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const title = useRef<HTMLInputElement>(null)
  const edit = useRef<HTMLButtonElement>(null)
  const previous = useRef(false)
  const { pending, run } = useDemoRequest()
  const dirty = editing && (draft.title !== saved.title || draft.note !== saved.note)
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  useEffect(() => {
    if (previous.current !== editing) {
      if (editing) title.current?.focus()
      else edit.current?.focus()
      previous.current = editing
    }
  }, [editing])
  return (
    <div className="workflow-pattern">
      {message && <Alert title={message} tone="success" />}
      {editing ? (
        <form
          className="workflow-pattern__fields"
          aria-label="Edit meeting"
          onSubmit={(event) => {
            event.preventDefault()
            run(() => {
              const next = { ...draft, title: draft.title.trim() }
              setSaved(next)
              setDraft(next)
              setEditing(false)
              setMessage('Meeting saved in this preview.')
            })
          }}
        >
          <TextField
            ref={title}
            label="Meeting title"
            required
            pattern=".*\S.*"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            disabled={pending}
          />
          <Textarea
            label="Meeting notes"
            value={draft.note}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            disabled={pending}
          />
          <p className="workflow-pattern__note" role="status">
            {dirty ? 'You have unsaved changes.' : 'Your details are up to date.'}
          </p>
          <div className="workflow-pattern__actions">
            <ConfirmationDialog
              title="Discard your changes?"
              description="Your saved meeting will stay as it was."
              trigger={
                <Button variant="ghost" disabled={pending}>
                  Cancel editing
                </Button>
              }
              open={confirm}
              onOpenChange={(open) => {
                if (open && !dirty) {
                  setEditing(false)
                  return
                }
                setConfirm(open)
              }}
              confirmLabel="Discard changes"
              cancelLabel="Keep editing"
              danger
              onConfirm={() => {
                setDraft(saved)
                setEditing(false)
                setConfirm(false)
                setMessage('Changes discarded.')
              }}
            />
            <Button type="submit" disabled={!dirty} loading={pending}>
              {pending ? 'Saving…' : 'Save meeting'}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <header className="workflow-pattern__intro">
            <h4>{saved.title}</h4>
            <p>{saved.note}</p>
          </header>
          <Button
            ref={edit}
            variant="secondary"
            onPress={() => {
              setDraft(saved)
              setMessage('')
              setEditing(true)
            }}
          >
            Edit meeting
          </Button>
        </>
      )}
      <p className="workflow-pattern__note">
        Cancel asks before discarding edits. Reloading also uses the browser’s unsaved-changes
        prompt while this form is dirty. App navigation should use the same confirmation.
      </p>
    </div>
  )
}
