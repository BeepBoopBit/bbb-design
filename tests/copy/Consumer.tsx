import { useState } from 'react'
import { ThemeProvider } from './bbb/components/ThemeProvider/ThemeProvider'
import { Button } from './bbb/components/Button/Button'
import { TextField } from './bbb/components/TextField/TextField'
import { Select } from './bbb/components/Select/Select'
import { Dialog } from './bbb/components/Dialog/Dialog'
import { Sheet } from './bbb/components/Sheet/Sheet'
import { Tabs } from './bbb/components/Tabs/Tabs'
import { createBrand } from './bbb/foundations/brands'
import { copiedModuleCount } from './catalog'
import './bbb/foundations/styles.css'
import './consumer.css'

export function Consumer() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [arabic, setArabic] = useState(false)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const brand = new URLSearchParams(location.search).has('custom') ? createBrand({ id: 'consumer', name: 'Consumer' }) : 'bbb'
  return <>
    <p id="host-content">Existing app content</p>
    <ThemeProvider brand={brand} mode={mode} locale={arabic ? 'ar-EG' : 'en-US'}>
      <section className="consumer-check" aria-label="Copied components">
        <h1>Copied components</h1>
        <p>{copiedModuleCount} source modules loaded</p>
        <Button onPress={() => setMode(mode === 'light' ? 'dark' : 'light')}>Change appearance</Button>
        <Button onPress={() => setArabic(!arabic)}>Change language</Button>
        <form onSubmit={event => { event.preventDefault(); setSubmitted(true); setSaved(Boolean(name.trim())) }}>
          <TextField label="Project name with a longer label" value={name} onChange={event => setName(event.target.value)}
            error={submitted && !name.trim() ? 'Enter a project name.' : undefined} />
          <Select label="Priority" defaultValue="normal" options={[{ id: 'normal', label: 'Normal' }, { id: 'high', label: 'High' }]} />
          <Button type="submit">Save project</Button>
          {saved && <p role="status">Saved {name}.</p>}
        </form>
        <Dialog title="Copied dialog" trigger={<Button>Open copied dialog</Button>}>
          <TextField label="Dialog note" />
        </Dialog>
        <Sheet title="Copied sheet" trigger={<Button>Open copied sheet</Button>} footer={close => <Button onPress={close}>Done</Button>}>
          <TextField label="Sheet note with a longer label" />
        </Sheet>
        <Tabs label="Copied tabs" items={[{ id: 'overview', label: 'Overview', content: 'Overview content' }, { id: 'details', label: 'Details', content: 'Details content' }]} />
        <Button disabled>Unavailable action</Button>
        <Button loading>Saving project</Button>
      </section>
    </ThemeProvider>
  </>
}
