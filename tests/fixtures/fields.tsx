import '../../src/index.css'
import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from '../../src/components/Button/Button'
import { Dialog } from '../../src/components/Dialog/Dialog'
import { SearchField } from '../../src/components/SearchField/SearchField'
import { Select } from '../../src/components/Select/Select'
import { TextField } from '../../src/components/TextField/TextField'
import { ThemeProvider } from '../../src/components/ThemeProvider/ThemeProvider'
import type { FieldVariant } from '../../src/components/FormField/FieldSurface'
import '../../src/pages/Gallery/previews/Previews.css'

export function Fixture() {
  const params = new URLSearchParams(location.search)
  const variant = (['outlined', 'subtle', 'plain'].find(value => value === params.get('variant')) ?? 'outlined') as FieldVariant
  const [query, setQuery] = useState('Draft')
  const [submitted, setSubmitted] = useState('')
  const input = useRef<HTMLInputElement>(null)
  return <ThemeProvider mode={params.get('mode') === 'dark' ? 'dark' : 'light'} locale={params.get('locale') ?? 'en-US'}
    tokens={{ '--bbb-control-height': 'var(--bbb-space-12)', '--bbb-search-radius': 'var(--bbb-radius-md)' }}>
    <main className="field-preview">
      <h1>Field examples</h1>
      <form className="field-preview" aria-label="Search form" onSubmit={event => {
        event.preventDefault()
        setSubmitted(String(new FormData(event.currentTarget).get('query')))
      }}>
        <SearchField ref={input} label="Uncontrolled search" name="query" defaultValue="Design" variant={variant === 'filled' ? 'subtle' : variant} />
        <Button type="submit">Submit search</Button>
        <Button type="reset">Reset search</Button>
        <Button onPress={() => input.current?.focus()}>Focus search</Button>
        <p role="status">{submitted}</p>
      </form>
      <SearchField label="Read-only search" value="Managed search" readOnly />
      <TextField variant={variant} label="A longer field label that stays readable when text grows" placeholder="Your idea" />
      <Select variant={variant} label="A longer selection label that stays readable when text grows" defaultValue="all"
        options={[{ id: 'all', label: 'All documents' }, { id: 'recent', label: 'Recently updated documents' }]} />
      <Dialog title="Search dialog" trigger={<Button>Open search dialog</Button>}>
        <SearchField label="Dialog search" value={query} onChange={setQuery} autoFocus />
      </Dialog>
    </main>
  </ThemeProvider>
}

createRoot(document.getElementById('root')!).render(<Fixture />)
