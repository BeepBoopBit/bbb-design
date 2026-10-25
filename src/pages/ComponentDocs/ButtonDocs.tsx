import { useEffect, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { Tabs } from '../../components/Tabs/Tabs'
import { CodeBlock } from '../../components/CodeBlock/CodeBlock'
import { Link } from '../../components/Link/Link'
import { SourceBundleDetails } from '../Gallery/components/SourceBundleDetails'
import { sitePath } from '../Gallery/useGalleryLocation'
import { SiteFooter } from '../Site/SiteFooter'
import './ComponentDocs.css'

const usage = `import { Button } from './bbb/components/Button/Button'

export function SaveAction() {
  return <Button onPress={() => console.log('Saved')}>Save changes</Button>
}`
const sections = [
  ['preview', 'Preview'], ['installation', 'Installation'], ['usage', 'Usage'],
  ['variants', 'Variants'], ['sizes', 'Sizes and icons'], ['states', 'States'],
  ['accessibility', 'Accessibility'], ['api', 'API reference'],
] as const
const api = [
  ['variant', "'primary' | 'secondary' | 'ghost' | 'danger'", "'primary'"],
  ['size', "'sm' | 'md'", "'md'"],
  ['type', "'button' | 'submit' | 'reset'", "'button'"],
  ['loading', 'boolean', 'false'],
  ['disabled', 'boolean', 'false'],
  ['iconOnly', 'boolean', 'false'],
  ['onPress', '(event: PressEvent) => void', '—'],
  ['children', 'ReactNode', '—'],
  ['className', 'string', "''"],
  ['ref', 'Ref<HTMLButtonElement>', '—'],
]

export default function ButtonDocs() {
  const [message, setMessage] = useState('Try the button. You can use your keyboard, too.')
  const [variantMessage, setVariantMessage] = useState('Choose the emphasis that fits the action.')
  useEffect(() => {
    let id: string
    try { id = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
    if (!id) return
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(id)
      target?.focus({ preventScroll: true })
      target?.scrollIntoView()
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  return <>
    <div className="component-docs">
      <article className="component-docs__article" aria-labelledby="button-title">
        <div className="component-docs__breadcrumb"><a href={`${sitePath('gallery')}?category=components`}>Components</a><Icon name="chevron-right" /><span>Button</span></div>
        <header className="component-docs__header"><h1 id="button-title">Button</h1><p>A clear next step. Trigger an action, submit a form, or move a task forward.</p></header>

        <section id="preview" className="component-docs__section" aria-label="Button preview" tabIndex={-1}>
          <Tabs label="Button example" items={[
            { id: 'preview', label: 'Preview', content: <div className="component-docs__preview">
              <Button onPress={() => setMessage('You’re ready for the next step.')} >Continue <Icon name="arrow-right" /></Button>
              <p role="status">{message}</p>
            </div> },
            { id: 'code', label: 'Code', content: <CodeBlock language="tsx" label="Button preview code" code={`import { Button } from './bbb/components/Button/Button'
import { Icon } from './bbb/components/Icon/Icon'

<Button onPress={() => console.log('Continue')}>
  Continue <Icon name="arrow-right" />
</Button>`} /> },
          ]} />
        </section>

        <section className="component-docs__section" aria-labelledby="installation">
          <h2 id="installation" tabIndex={-1}>Installation</h2>
          <p>First, <Link href={sitePath('getting-started')}>set up BBB in your React app</Link>. Then add Button from the source registry.</p>
          <CodeBlock language="sh" label="Install Button" code="npx @beepboopbit/ui@latest add button" />
          <p className="component-docs__note">The installer copies Button, its styles, and shared dependencies into your project.</p>
          <details className="component-docs__source"><summary>Manual installation and source</summary><SourceBundleDetails itemId="button" /></details>
        </section>

        <section className="component-docs__section" aria-labelledby="usage">
          <h2 id="usage" tabIndex={-1}>Usage</h2><p>Import from your copied files. Use <code>onPress</code> for pointer, touch, and keyboard activation.</p>
          <CodeBlock language="tsx" label="Button usage" code={usage} />
          <p>For a form’s primary action, set <code>type="submit"</code> and handle saving in the form’s <code>onSubmit</code>.</p>
        </section>

        <section className="component-docs__section" aria-labelledby="variants">
          <h2 id="variants" tabIndex={-1}>Variants</h2><p>Use primary for the main action, secondary for supporting actions, ghost for lower emphasis, and danger for destructive actions.</p>
          <div className="component-docs__example"><div className="component-docs__row">
            <Button onPress={() => setVariantMessage('Primary: the main action on this screen.')}>Primary</Button>
            <Button variant="secondary" onPress={() => setVariantMessage('Secondary: a supporting action.')}>Secondary</Button>
            <Button variant="ghost" onPress={() => setVariantMessage('Ghost: an action with less visual emphasis.')}>Ghost</Button>
            <Button variant="danger" onPress={() => setVariantMessage('Danger: a destructive action. This is only a preview.')}>Danger</Button>
          </div><p role="status">{variantMessage}</p></div>
          <CodeBlock language="tsx" label="Button variants" code={'<Button>Save changes</Button>\n<Button variant="secondary">Cancel</Button>\n<Button variant="ghost">Learn more</Button>\n<Button variant="danger">Delete project</Button>'} />
        </section>

        <section className="component-docs__section" aria-labelledby="sizes">
          <h2 id="sizes" tabIndex={-1}>Sizes and icons</h2><p>Choose the default size for everyday actions and small for compact layouts. Give buttons containing only an icon a descriptive accessible name.</p>
          <div className="component-docs__example"><div className="component-docs__row"><Button size="sm" variant="secondary">Small</Button><Button variant="secondary">Default</Button><Button iconOnly variant="secondary" aria-label="Add item"><Icon name="plus" /></Button></div></div>
          <CodeBlock language="tsx" label="Button sizes and icons" code={'<Button size="sm">Small</Button>\n<Button size="md">Default</Button>\n<Button iconOnly aria-label="Add item">\n  <Icon name="plus" />\n</Button>'} />
          <p className="component-docs__note">Import <code>Icon</code> from <code>./bbb/components/Icon/Icon</code> when using the icon example.</p>
        </section>

        <section className="component-docs__section" aria-labelledby="states">
          <h2 id="states" tabIndex={-1}>States</h2><p>Keep a meaningful label while work is in progress. A loading button shows a spinner, sets <code>aria-busy</code>, and prevents repeated activation.</p>
          <div className="component-docs__example"><div className="component-docs__row"><Button disabled>Unavailable</Button><Button loading>Saving changes…</Button></div></div>
          <CodeBlock language="tsx" label="Button states" code={'<Button disabled>Unavailable</Button>\n<Button loading>Saving changes…</Button>'} />
        </section>

        <section className="component-docs__section" aria-labelledby="accessibility">
          <h2 id="accessibility" tabIndex={-1}>Accessibility</h2>
          <ul><li><kbd>Tab</kbd> moves focus to an enabled button. <kbd>Enter</kbd> or <kbd>Space</kbd> activates it.</li>
            <li>Visible text supplies the accessible name. Add <code>aria-label</code> when the button contains only an icon.</li>
            <li>Disabled and loading buttons cannot be activated and leave the tab order.</li>
            <li>Use a link for navigation to another page. Use Button for an action.</li>
            <li>The loading animation respects reduced motion preferences.</li></ul>
        </section>

        <section className="component-docs__section" aria-labelledby="api">
          <h2 id="api" tabIndex={-1}>API reference</h2><p>Button uses React Aria’s press behavior and renders a native <code>button</code>. It also accepts supported button and ARIA attributes.</p>
          <div className="component-docs__table" role="region" aria-label="Button properties" tabIndex={0}><table><thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Default</th></tr></thead><tbody>{api.map(([prop, type, fallback]) => <tr key={prop}><th scope="row"><code>{prop}</code></th><td><code>{type}</code></td><td><code>{fallback}</code></td></tr>)}</tbody></table></div>
        </section>
        <div className="component-docs__next"><span>Keep exploring</span><Link href={`${sitePath('gallery')}?category=components`}>All components <Icon name="arrow-right" /></Link></div>
      </article>
      <nav className="component-docs__contents" aria-label="On this page"><span>On this page</span>{sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
    </div>
    <SiteFooter />
  </>
}
