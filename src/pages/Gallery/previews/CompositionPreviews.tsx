import { useId, useState } from 'react'
import type { Key } from 'react-aria-components'
import { Button } from '../../../components/Button/Button'
import { ButtonGroup } from '../../../components/ButtonGroup/ButtonGroup'
import { Toggle } from '../../../components/Toggle/Toggle'
import { ToggleGroup } from '../../../components/ToggleGroup/ToggleGroup'
import { InputGroup } from '../../../components/InputGroup/InputGroup'
import { Collapsible } from '../../../components/Collapsible/Collapsible'
import { Drawer } from '../../../components/Drawer/Drawer'
import { DropdownMenu } from '../../../components/DropdownMenu/DropdownMenu'
import { TextField } from '../../../components/TextField/TextField'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { Icon } from '../../../components/Icon/Icon'
import './Previews.css'
import './CompositionPreviews.css'

export function ButtonGroupPreview() {
  const [message, setMessage] = useState('Keep a draft, or share it when you’re ready.')
  return <div className="composition-preview">
    <ButtonGroup label="Document actions">
      <Button onPress={() => setMessage('Your draft is saved.')}>Save draft</Button>
      <DropdownMenu label="More save options" trigger={<Button iconOnly aria-label="More save options"><Icon name="chevron-down" /></Button>}
        items={[{ id: 'publish', label: 'Save and publish' }, { id: 'copy', label: 'Save a copy' }]}
        onAction={id => setMessage(id === 'publish' ? 'Your draft is published.' : 'A copy is saved.')} />
    </ButtonGroup>
    <p className="preview-note" role="status">{message}</p>
    <ButtonGroup label="History actions"><Button variant="secondary" onPress={() => setMessage('Last change undone.')}>Undo</Button><Button variant="secondary" disabled>Redo</Button></ButtonGroup>
  </div>
}

export function TogglePreview() {
  const [saved, setSaved] = useState(false)
  return <div className="composition-preview">
    <Toggle isSelected={saved} onChange={setSaved} variant="secondary"><Icon name="bookmark" />Save for later</Toggle>
    <p className="preview-note" role="status">{saved ? 'Added to your reading list.' : 'Keep something good within reach.'}</p>
    <Toggle disabled>Unavailable</Toggle>
  </div>
}

export function ToggleGroupPreview() {
  const [selected, setSelected] = useState(new Set<Key>(['bold']))
  return <div className="composition-preview">
    <ToggleGroup label="Text formatting" selectedKeys={selected} onSelectionChange={setSelected}>
      <Toggle id="bold" size="sm"><strong>Bold</strong></Toggle>
      <Toggle id="italic" size="sm"><em>Italic</em></Toggle>
      <Toggle id="underline" size="sm"><span className="composition-preview__underline">Underline</span></Toggle>
      <Toggle id="strike" size="sm" disabled>Strike</Toggle>
    </ToggleGroup>
    <p className="composition-preview__sample" style={{ fontWeight: selected.has('bold') ? 600 : 400, fontStyle: selected.has('italic') ? 'italic' : 'normal', textDecoration: selected.has('underline') ? 'underline' : 'none' }}>A little more emphasis.</p>
    <p className="preview-note">Choose more than one style. Arrow keys move between controls.</p>
  </div>
}

export function InputGroupPreview() {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  return <div className="composition-preview composition-preview--fields">
    <InputGroup label="Project address" defaultValue="studio" startAddon={<span>https://</span>} endAddon={<span>.bbb.app</span>} hint="Choose a short, memorable address." />
    <InputGroup label="Budget" type="number" defaultValue="1200" min="0" startAddon={<select aria-label="Budget currency" defaultValue="USD"><option>USD</option><option>EUR</option><option>PHP</option></select>} endAddon={<span>per month</span>} />
    <InputGroup multiline label="Team update" placeholder="What’s taking shape?" rows={3} value={message} maxLength={240}
      onChange={event => { setMessage(event.target.value); setSent(false) }}
      footer={<><span>{message.length}/240</span><Button size="sm" disabled={!message.trim()} onPress={() => { setMessage(''); setSent(true) }}>Post update</Button></>} />
    {sent && <p className="preview-note" role="status">Your update is posted in this preview.</p>}
  </div>
}

export function CollapsiblePreview() {
  return <div className="composition-preview composition-preview--fields">
    <TextField label="Project name" defaultValue="A new beginning" />
    <Collapsible label="Advanced options">
      <div className="composition-preview--fields"><TextField label="Project slug" defaultValue="a-new-beginning" /><Checkbox label="Allow comments" defaultSelected /></div>
    </Collapsible>
  </div>
}

export function DrawerPreview() {
  const [message, setMessage] = useState('Make room for the work that matters.')
  const formId = useId()
  return <div className="composition-preview">
    <Drawer title="Filter projects" description="Choose what you want to see." trigger={<Button variant="secondary"><Icon name="sliders-horizontal" />Filter projects</Button>}
      footer={close => <><Button variant="secondary" onPress={close}>Cancel</Button><Button type="submit" form={formId}>Apply filters</Button></>}>
      {close => <form id={formId} className="composition-preview--fields" onSubmit={event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const query = String(data.get('query') ?? '').trim()
        const scope = data.has('owned') ? 'Showing projects you own' : 'Showing all projects'
        setMessage(`${scope}${query ? ` matching “${query}”` : ''}${data.has('archived') ? ', including archived projects' : ''}.`)
        close()
      }}><TextField label="Project contains" name="query" placeholder="Search by name" /><Checkbox label="Only projects I own" name="owned" defaultSelected /><Checkbox label="Include archived projects" name="archived" /></form>}
    </Drawer>
    <p className="preview-note" role="status">{message}</p>
  </div>
}
