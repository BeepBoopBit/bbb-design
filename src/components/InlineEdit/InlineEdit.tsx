import { useRef, useState } from 'react'
import { Button } from '../Button/Button'
import { TextField } from '../TextField/TextField'
import { useMessages } from '../LocaleProvider/locale'
import './InlineEdit.css'

export type InlineEditProps = {
  label: string
  value: string
  onSave: (value: string) => void
  validate?: (value: string) => string | undefined
  disabled?: boolean
  className?: string
}

export function InlineEdit({ label, value, onSave, validate, disabled, className = '' }: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string>()
  const trigger = useRef<HTMLButtonElement>(null)
  const { t } = useMessages()
  function close() {
    setEditing(false)
    setError(undefined)
    requestAnimationFrame(() => trigger.current?.focus())
  }
  if (!editing) return <Button ref={trigger} variant="ghost" disabled={disabled} className={`bbb-inline-edit__trigger ${className}`}
    aria-label={t('edit', { name: label })} onPress={() => { setDraft(value); setEditing(true) }}
  >{value || label}</Button>
  return <form className={`bbb-inline-edit ${className}`} aria-label={label} onSubmit={event => {
    event.preventDefault()
    if (disabled) return
    const message = validate?.(draft)
    if (message) { setError(message); return }
    onSave(draft)
    close()
  }}>
    <TextField label={label} variant="plain" hideLabel value={draft} onChange={event => { setDraft(event.target.value); setError(undefined) }}
      error={error} autoFocus disabled={disabled} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() } }} />
    <div className="bbb-inline-edit__actions"><Button type="submit" size="sm" disabled={disabled}>{t('save')}</Button><Button variant="ghost" size="sm" onPress={close}>{t('cancel')}</Button></div>
  </form>
}
