import { useState } from 'react'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { Combobox } from '../../../components/Combobox/Combobox'
import { RadioGroup } from '../../../components/RadioGroup/RadioGroup'
import { Select } from '../../../components/Select/Select'
import { Textarea } from '../../../components/Textarea/Textarea'
import type { FieldVariant } from '../../../components/FormField/FieldSurface'
import { FieldStylePicker } from '../components/FieldStylePicker'
import './Previews.css'

export function SelectPreview() {
  const [variant, setVariant] = useState<FieldVariant>('filled')
  const [priority, setPriority] = useState('normal')
  return (
    <form
      className="field-preview"
      aria-label="Priority example"
      onSubmit={event => event.preventDefault()}
    >
      <FieldStylePicker value={variant} onChange={setVariant} />
      <Select
        variant={variant}
        label="Priority"
        name="priority"
        value={priority}
        onChange={setPriority}
        hint="Choose how soon this needs attention."
        options={[
          { id: 'low', label: 'Low' },
          { id: 'normal', label: 'Normal' },
          { id: 'high', label: 'High' },
          { id: 'urgent', label: 'Urgent · unavailable', disabled: true },
        ]}
      />
      <Select
        variant={variant}
        label="Access level"
        defaultValue="member"
        disabled
        options={[{ id: 'member', label: 'Member' }]}
      />
      <p className="preview-note" role="status">
        Priority set to {priority}.
      </p>
    </form>
  )
}

export function CheckboxPreview() {
  const [selected, setSelected] = useState(['email'])
  const all = selected.length === 2
  const toggle = (key: string, checked: boolean) =>
    setSelected(previous =>
      checked ? [...previous, key] : previous.filter(value => value !== key),
    )
  return (
    <div className="field-preview">
      <Checkbox
        label="All updates"
        description="Select both delivery methods."
        isSelected={all}
        isIndeterminate={selected.length > 0 && !all}
        onChange={checked => setSelected(checked ? ['email', 'weekly'] : [])}
      />
      <div className="preview-choice-children">
        <Checkbox
          label="Email updates"
          isSelected={selected.includes('email')}
          onChange={checked => toggle('email', checked)}
        />
        <Checkbox
          label="Weekly summary"
          isSelected={selected.includes('weekly')}
          onChange={checked => toggle('weekly', checked)}
        />
        <Checkbox label="Managed by your team" isSelected disabled />
      </div>
      <p className="preview-note" role="status">
        {selected.length} of 2 delivery methods selected.
      </p>
    </div>
  )
}

export function RadioGroupPreview() {
  const [delivery, setDelivery] = useState('daily')
  return (
    <div className="field-preview">
      <RadioGroup
        label="Delivery frequency"
        value={delivery}
        onChange={setDelivery}
        options={[
          { value: 'daily', label: 'Daily', description: 'A little at a time.' },
          { value: 'weekly', label: 'Weekly', description: 'Everything in one place.' },
          { value: 'instant', label: 'Instant · unavailable', disabled: true },
        ]}
      />
      <p className="preview-note" role="status">
        Updates arrive {delivery}.
      </p>
    </div>
  )
}

export function TextareaPreview() {
  const [variant, setVariant] = useState<FieldVariant>('filled')
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)
  const [disabled, setDisabled] = useState(false)
  return (
    <div className="field-preview">
      <FieldStylePicker value={variant} onChange={setVariant} />
      <Textarea
        variant={variant}
        label="A short note"
        placeholder="What’s on your mind?"
        value={note}
        onChange={event => setNote(event.target.value)}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        maxLength={160}
        hint={`${note.length}/160 characters`}
        error={!disabled && touched && !note.trim() ? 'Add a note before continuing.' : undefined}
        required
      />
      <Checkbox label="Disable editing" isSelected={disabled} onChange={setDisabled} />
    </div>
  )
}

const people = [
  { id: 'alex', label: 'Alex Morgan' },
  { id: 'jamie', label: 'Jamie Chen' },
  { id: 'robin', label: 'Robin Lee' },
  { id: 'sam', label: 'Sam Rivera', disabled: true },
]

export function ComboboxPreview() {
  const [variant, setVariant] = useState<FieldVariant>('filled')
  const [person, setPerson] = useState<string | null>(null)
  const [mode, setMode] = useState('default')
  return (
    <div className="field-preview">
      <FieldStylePicker value={variant} onChange={setVariant} />
      <Combobox
        variant={variant}
        key={mode}
        label="Assign to"
        options={mode === 'loading' ? [] : people}
        selectedKey={person}
        onSelectionChange={key => setPerson(key === null ? null : String(key))}
        disabled={mode === 'disabled'}
        loading={mode === 'loading'}
        error={mode === 'error' ? 'Choose a person before continuing.' : undefined}
        hint="Search by name. Sam is unavailable."
        placeholder="Find a person"
      />
      <Select
        label="Combobox example state"
        value={mode}
        onChange={value => {
          setMode(value)
          setPerson(null)
        }}
        options={[
          { id: 'default', label: 'Default' },
          { id: 'disabled', label: 'Disabled' },
          { id: 'error', label: 'Error' },
          { id: 'loading', label: 'Loading' },
        ]}
      />
      <p className="preview-note" role="status">
        {person
          ? `Assigned to ${people.find(item => item.id === person)?.label}.`
          : 'No person selected.'}
      </p>
    </div>
  )
}
