import { useState } from 'react'
import { TextField } from '../../../components/TextField/TextField'
import { Textarea } from '../../../components/Textarea/Textarea'
import { Select } from '../../../components/Select/Select'
import { Combobox } from '../../../components/Combobox/Combobox'
import { SearchField } from '../../../components/SearchField/SearchField'
import { PasswordField } from '../../../components/PasswordField/PasswordField'
import { VerificationCode } from '../../../components/VerificationCode/VerificationCode'
import { NumberField } from '../../../components/NumberField/NumberField'
import { MultiSelect } from '../../../components/MultiSelect/MultiSelect'
import { DatePicker, DateRangePicker, TimePicker } from '../../../components/DatePicker/DatePicker'
import { TagField } from '../../../components/TagField/TagField'
import type { FieldVariant } from '../../../components/FormField/FieldSurface'
import { FieldStylePicker } from '../components/FieldStylePicker'
import { fieldStyles } from '../components/fieldStyles'
import './Previews.css'
import './FieldPreviews.css'

const priorityOptions = [
  { id: 'low', label: 'Low' }, { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High' }, { id: 'unavailable', label: 'Unavailable', disabled: true },
]

export function FieldVariantsPreview() {
  const [variant, setVariant] = useState<FieldVariant>('outlined')
  return <div className="field-variants-preview">
    <FieldStylePicker value={variant} onChange={setVariant} />
    <p className="field-variants-preview__description">{fieldStyles.find(style => style.value === variant)?.description}</p>
    <div className="field-variants-preview__grid">
      <TextField variant={variant} label="Title" placeholder="A new idea" hint="A short, memorable name." />
      <Select variant={variant} label="Importance preview" defaultValue="normal" options={priorityOptions} />
      <Combobox variant={variant} label="Assignee preview" placeholder="Find a teammate" options={[
        { id: 'alex', label: 'Alex Morgan' }, { id: 'jamie', label: 'Jamie Chen' },
      ]} />
      <MultiSelect variant={variant} label="Channels preview" defaultValue={['email']} options={[
        { id: 'email', label: 'Email' }, { id: 'weekly', label: 'Weekly summary' },
      ]} />
      <NumberField variant={variant} label="Estimate preview" defaultValue={2} minValue={0} />
      <DatePicker variant={variant} label="Start date preview" />
      <DateRangePicker variant={variant} label="Date range preview" />
      <TimePicker variant={variant} label="Time preview" />
      <PasswordField variant={variant} label="Password preview" defaultValue="thoughtful-details" />
      <VerificationCode variant={variant} label="Reference code preview" defaultValue="001234" />
      <TagField variant={variant} label="Keywords preview" defaultValue={['Design']} />
      <Textarea variant={variant} label="Notes preview" placeholder="A little more context" />
      <TextField variant={variant} label="Unavailable field" value="Managed by your team" disabled />
      <Select variant={variant} label="Required choice preview" options={priorityOptions} error="Choose a priority to continue." />
      <TextField variant={variant} label="Read-only field" value="BBB workspace" readOnly />
      <TextField variant={variant} label="Validation preview" error="Enter a title to continue." />
    </div>
  </div>
}

export function SearchFieldPreview() {
  const [query, setQuery] = useState('')
  const examples = ['Project notes', 'Design review', 'Weekly planning']
  const matches = examples.filter(item => item.toLowerCase().includes(query.trim().toLowerCase()))
  return <div className="search-field-preview">
    <section className="search-field-preview__example" aria-label="Library search example">
      <h4>Library search</h4>
      <p>Compact and rounded, with room for results.</p>
      <SearchField label="Find a document" placeholder="Search documents" value={query} onChange={setQuery} />
      <ul>{matches.map(item => <li key={item}>{item}</li>)}</ul>
      <p role="status">{matches.length ? `${matches.length} ${matches.length === 1 ? 'document' : 'documents'} found.` : 'No documents found. Try another search.'}</p>
    </section>
    <section className="search-field-preview__example" aria-label="Outlined search example">
      <h4>On a busy surface</h4>
      <SearchField variant="outlined" label="Search the workspace" placeholder="Search the workspace" />
    </section>
    <section className="search-field-preview__example search-field-preview__example--inset" aria-label="Toolbar search example">
      <h4>Inside a toolbar</h4>
      <SearchField variant="plain" label="Filter this collection" placeholder="Filter this collection" />
    </section>
    <SearchField label="Unavailable search" placeholder="Search unavailable" disabled />
  </div>
}
