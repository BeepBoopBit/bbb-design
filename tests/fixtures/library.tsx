import '../../src/index.css'
import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '../../src/components/ThemeProvider/ThemeProvider'
import { Button } from '../../src/components/Button/Button'
import { Link } from '../../src/components/Link/Link'
import { HoverCard } from '../../src/components/HoverCard/HoverCard'
import { NativeSelect } from '../../src/components/NativeSelect/NativeSelect'
import { NavigationMenu } from '../../src/components/NavigationMenu/NavigationMenu'
import { Separator } from '../../src/components/Separator/Separator'
import type { FieldVariant } from '../../src/components/FormField/FieldSurface'

export function Fixture() {
  const params = new URLSearchParams(location.search)
  const [open, setOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [result, setResult] = useState('')
  const [value, setValue] = useState('one')
  const select = useRef<HTMLSelectElement>(null)
  const variant = (params.get('variant') ?? 'filled') as FieldVariant
  return <ThemeProvider mode={params.get('mode') === 'dark' ? 'dark' : 'light'} brand={params.get('brand') === 'studio' ? 'studio' : 'bbb'} density={params.get('density') === 'compact' ? 'compact' : 'comfortable'} locale={params.get('locale') ?? 'en-US'}>
    <main style={{ display: 'grid', gap: 'var(--bbb-space-6)', padding: 'var(--bbb-space-4)', maxWidth: '42rem', margin: 'auto' }}>
      <h1>Library controls</h1>
      <Button variant="secondary">Before navigation</Button>
      <NavigationMenu label="Fixture navigation" currentId="overview" openId={openId} onOpenChange={setOpenId} items={[
        { id: 'overview', label: 'Overview', href: '#destination' },
        { id: 'learn', label: 'Learn', groups: [{ label: 'Guides', links: [
          { id: 'start', label: 'Quick start', href: '#destination', description: 'Set up your first project.' },
          { id: 'concepts', label: 'Core concepts', href: '#destination', target: '_blank' },
        ] }, { label: 'Reference', links: [{ id: 'api', label: 'API', href: '#destination' }] }] },
        { id: 'more', label: 'More', groups: [{ label: 'Examples', links: [{ id: 'examples', label: 'Browse examples', href: '#destination' }] }] },
        { id: 'soon', label: 'Soon', groups: [], disabled: true },
      ]} />
      <Button variant="secondary">After navigation</Button>
      <HoverCard title="Project preview" delay={100} closeDelay={150} trigger={<Link href="#destination">Project link</Link>}>
        <p>A preview of this project.</p><Link href="#destination">Open project</Link><Button variant="secondary">Preview action</Button>
      </HoverCard>
      <HoverCard title="Controlled preview" open={open} onOpenChange={setOpen} delay={0} trigger={<Button variant="secondary">Controlled trigger</Button>}>
        <p>Controlled content</p><Button onPress={() => setOpen(false)}>Close preview</Button>
      </HoverCard>
      <HoverCard title="Unavailable preview" disabled trigger={<Link href="#destination">Disabled preview link</Link>}>Hidden preview</HoverCard>
      <Separator aria-label="Section break" />
      <div style={{ display: 'flex', gap: 'var(--bbb-space-3)' }}><span>One</span><Separator orientation="vertical" aria-label="Vertical break" /><span>Two</span><Separator decorative orientation="vertical" /><span>Three</span></div>
      <form aria-label="Native fields" style={{ display: 'grid', gap: 'var(--bbb-space-4)' }} onSubmit={event => { event.preventDefault(); setResult(JSON.stringify(Array.from(new FormData(event.currentTarget)))) }}>
        <NativeSelect ref={select} variant={variant} label="Region" hint="Choose a nearby region." name="region" required defaultValue="manila">
          <optgroup label="Asia"><option value="manila">Manila</option><option value="singapore">Singapore</option><option value="disabled" disabled>Unavailable</option></optgroup>
        </NativeSelect>
        <NativeSelect variant={variant} label="Controlled choice" name="choice" value={value} onChange={event => setValue(event.target.value)}><option value="one">One</option><option value="two">Two</option></NativeSelect>
        <NativeSelect variant={variant} label="Days" name="days" multiple size={3} defaultValue={['Monday']}><option>Monday</option><option>Tuesday</option><option>Wednesday</option></NativeSelect>
        <NativeSelect variant={variant} label="Required choice" defaultValue="" required error="Make a selection."><option value="" disabled>Select one</option><option value="yes">Yes</option></NativeSelect>
        <NativeSelect variant={variant} label="Disabled choice" name="disabled" disabled defaultValue="hidden"><option>hidden</option></NativeSelect>
        <Button type="submit">Submit fields</Button><Button type="reset">Reset fields</Button><Button onPress={() => select.current?.focus()}>Focus region</Button>
        <output aria-label="Submitted fields">{result}</output>
      </form>
      <h2 id="destination">Destination</h2>
    </main>
  </ThemeProvider>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
