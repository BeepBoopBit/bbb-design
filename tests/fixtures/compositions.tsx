import '../../src/index.css'
import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Key } from 'react-aria-components'
import { ThemeProvider } from '../../src/components/ThemeProvider/ThemeProvider'
import { Button } from '../../src/components/Button/Button'
import { Toggle } from '../../src/components/Toggle/Toggle'
import { ToggleGroup } from '../../src/components/ToggleGroup/ToggleGroup'
import { InputGroup } from '../../src/components/InputGroup/InputGroup'
import { Collapsible } from '../../src/components/Collapsible/Collapsible'
import { Drawer } from '../../src/components/Drawer/Drawer'
import { Dialog } from '../../src/components/Dialog/Dialog'
import { TextField } from '../../src/components/TextField/TextField'
import { ButtonGroupPreview } from '../../src/pages/Gallery/previews/CompositionPreviews'
import type { FieldVariant } from '../../src/components/FormField/FieldSurface'

export function Fixture() {
  const params = new URLSearchParams(location.search)
  const variant = (params.get('variant') ?? 'filled') as FieldVariant
  const [selected, setSelected] = useState(false)
  const [keys, setKeys] = useState(new Set<Key>(['one']))
  const [open, setOpen] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [result, setResult] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)
  return <ThemeProvider mode={params.get('mode') === 'dark' ? 'dark' : 'light'} brand={params.get('brand') === 'studio' ? 'studio' : 'bbb'} density={params.get('density') === 'compact' ? 'compact' : 'comfortable'} locale={params.get('locale') ?? 'en-US'}>
    <main style={{ display: 'grid', gap: 'var(--bbb-space-6)', padding: 'var(--bbb-space-4)', maxWidth: '42rem', margin: 'auto' }}>
      <h1>Composition controls</h1>
      <ButtonGroupPreview />
      <Toggle isSelected={selected} onChange={setSelected}>Controlled toggle</Toggle>
      <Toggle defaultSelected>Uncontrolled toggle</Toggle>
      <Toggle disabled defaultSelected>Disabled toggle</Toggle>
      <ToggleGroup label="Required selection" selectionMode="single" disallowEmptySelection selectedKeys={keys} onSelectionChange={setKeys}>
        <Toggle id="one">One</Toggle><Toggle id="two">Two</Toggle><Toggle id="three" disabled>Three</Toggle>
      </ToggleGroup>
      <ToggleGroup label="Vertical choices" orientation="vertical" defaultSelectedKeys={['top']}>
        <Toggle id="top">Top</Toggle><Toggle id="unavailable" disabled>Unavailable</Toggle><Toggle id="bottom">Bottom</Toggle>
      </ToggleGroup>
      <ToggleGroup label="Disabled choices" disabled><Toggle id="a">Disabled A</Toggle><Toggle id="b">Disabled B</Toggle></ToggleGroup>
      <Button onPress={() => { setSelected(false); setKeys(new Set(['one'])); setOpen(false) }}>Reset controlled state</Button>
      <Collapsible label="Controlled options" open={open} onOpenChange={setOpen} trigger={<Button variant="secondary">Custom options</Button>}>
        <TextField label="Remembered value" defaultValue="Draft" />
      </Collapsible>
      <Collapsible label="Disabled options" disabled><TextField label="Hidden value" /></Collapsible>
      <form aria-label="Grouped fields" style={{ display: 'grid', gap: 'var(--bbb-space-4)' }} onSubmit={event => { event.preventDefault(); setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))) }}>
        <InputGroup ref={input} variant={variant} label="Website" hint="Enter a subdomain." name="website" defaultValue="studio" required startAddon={<span>https://</span>} endAddon={<span>.bbb.app</span>} />
        <InputGroup variant={variant} label="Budget" name="budget" type="number" defaultValue="24" startAddon={<select aria-label="Currency" name="currency" defaultValue="USD"><option>USD</option><option>EUR</option></select>} endAddon={<span>per month</span>} />
        <InputGroup ref={textarea} variant={variant} multiline label="Notes" name="notes" defaultValue="Hello" footer={<Button size="sm" onPress={() => input.current?.focus()}>Focus website</Button>} />
        <InputGroup label="Read-only" value="Managed" readOnly />
        <InputGroup label="Disabled input" name="disabled" defaultValue="Excluded" disabled />
        <InputGroup label="Invalid input" error="Choose another value." defaultValue="Taken" />
        <Button type="submit">Submit fields</Button><Button type="reset">Reset fields</Button><Button onPress={() => textarea.current?.focus()}>Focus notes</Button>
        <output aria-label="Submitted fields">{result}</output>
      </form>
      <Drawer open={drawer} onOpenChange={setDrawer} title="Drawer settings" description="Settings with a scrolling body." trigger={<Button>Open controlled drawer</Button>}
        footer={close => <Button onPress={close}>Finish drawer</Button>}>
        <TextField label="Drawer name" defaultValue="A project" autoFocus />
        <Dialog title="Nested dialog" trigger={<Button>Open nested dialog</Button>}>Nested content</Dialog>
        {Array.from({ length: 15 }, (_, index) => <p key={index}>Section {index + 1}. A longer description that gives the drawer enough content to scroll on small screens.</p>)}
      </Drawer>
    </main>
  </ThemeProvider>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
