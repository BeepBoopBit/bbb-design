import { useState } from 'react'
import { HoverCard } from '../../../components/HoverCard/HoverCard'
import { NavigationMenu } from '../../../components/NavigationMenu/NavigationMenu'
import { NativeSelect } from '../../../components/NativeSelect/NativeSelect'
import { Separator } from '../../../components/Separator/Separator'
import { Link } from '../../../components/Link/Link'
import { Button } from '../../../components/Button/Button'
import type { FieldVariant } from '../../../components/FormField/FieldSurface'
import { FieldStylePicker } from '../components/FieldStylePicker'
import './LibraryPreviews.css'

export function HoverCardPreview() {
  return <div className="library-preview library-preview--hover">
    <p>A little context, before you follow the link.</p>
    <span><HoverCard title="Made for your team" trigger={<Link href="/getting-started">Explore BBB</Link>}>
      <p>Thoughtful defaults, familiar interactions, and source you can make your own.</p>
      <Link href="/getting-started">Get started with BBB</Link>
    </HoverCard></span>
    <p className="preview-note">Hover, focus, or touch and hold the link to preview.</p>
  </div>
}

export function NavigationMenuPreview() {
  return <div className="library-preview library-preview--navigation">
    <NavigationMenu label="Example site" items={[
      { id: 'explore', label: 'Explore', groups: [
        { label: 'Build with BBB', links: [
          { id: 'start', label: 'Get started', href: '/getting-started', description: 'Bring BBB into your project.' },
          { id: 'components', label: 'Components', href: '/gallery?category=components', description: 'Small pieces for everyday interfaces.' },
        ] },
        { label: 'Learn the system', links: [
          { id: 'foundations', label: 'Foundations', href: '/gallery?category=foundations', description: 'Color, type, spacing, and more.' },
          { id: 'patterns', label: 'Patterns', href: '/gallery?category=patterns', description: 'See the pieces working together.' },
        ] },
      ] },
      { id: 'about', label: 'Our approach', href: '/#approach' },
    ]} />
    <p className="preview-note">Open Explore to find your next starting point.</p>
  </div>
}

export function SeparatorPreview() {
  return <div className="library-preview">
    <div><strong>A little breathing room</strong><p className="preview-note">Separate related sections without adding another surface.</p></div>
    <Separator />
    <div className="library-preview__row"><Link href="/getting-started">Get started</Link><Separator orientation="vertical" decorative /><Link href="/gallery">Explore components</Link></div>
  </div>
}

export function NativeSelectPreview() {
  const [variant, setVariant] = useState<FieldVariant>('filled')
  const [result, setResult] = useState('')
  return <form className="library-preview" aria-label="Native select example" onReset={() => setResult('')}
    onSubmit={event => { event.preventDefault(); setResult(String(new FormData(event.currentTarget).get('region'))) }}>
    <FieldStylePicker value={variant} onChange={setVariant} />
    <NativeSelect label="Region" name="region" variant={variant} defaultValue="manila" hint="Choose the nearest location." required>
      <optgroup label="Asia Pacific"><option value="manila">Manila</option><option value="singapore">Singapore</option></optgroup>
      <optgroup label="Europe"><option value="amsterdam">Amsterdam</option><option value="london" disabled>London · unavailable</option></optgroup>
    </NativeSelect>
    <div className="library-preview__row"><Button type="submit" size="sm">Save region</Button><Button type="reset" variant="ghost" size="sm">Reset</Button></div>
    <output className="preview-note" aria-live="polite">{result ? `Saved region: ${result}.` : 'Uses your browser’s selection picker.'}</output>
  </form>
}
