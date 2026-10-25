import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon/Icon'
import { Tabs } from '../../components/Tabs/Tabs'
import { CodeBlock } from '../../components/CodeBlock/CodeBlock'
import { Link } from '../../components/Link/Link'
import { galleryItems } from '../Gallery/galleryItems'
import { usageExamples } from '../Gallery/usageExamples'
import { SourceBundleDetails } from '../Gallery/components/SourceBundleDetails'
import { sitePath } from '../Gallery/useGalleryLocation'
import { SiteFooter } from '../Site/SiteFooter'
import type { ComponentPage } from './componentRoutes'
import './ComponentDocs.css'

export type ComponentGuidance = { use: string; states: string; keyboard: string[]; api: string[][]; extraCode?: string }

export function ComponentDocPage({ id, info, children }: { id: ComponentPage; info: ComponentGuidance; children: ReactNode }) {
  const item = galleryItems.find(item => item.id === id)!
  const { Preview } = item
  const code = usageExamples[item.source!]
  const sections = ['preview', 'installation', 'usage', 'states', 'accessibility', 'api']
  useEffect(() => {
    let hash: string
    try { hash = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
    if (!hash) return
    const frame = requestAnimationFrame(() => { const target = document.getElementById(hash); target?.focus({ preventScroll: true }); target?.scrollIntoView() })
    return () => cancelAnimationFrame(frame)
  }, [id])
  return <>
    <div className="component-docs">
      <article className="component-docs__article" aria-labelledby="component-title">
        <div className="component-docs__breadcrumb"><a href={`${sitePath('gallery')}?category=components`}>Components</a><Icon name="chevron-right" /><span>{item.name}</span></div>
        <header className="component-docs__header"><h1 id="component-title">{item.name}</h1><p>{item.description}</p></header>
        <section id="preview" className="component-docs__section" aria-label={`${item.name} preview`} tabIndex={-1}>
          <Tabs className="component-docs__tabs" label={`${item.name} example`} items={[
            { id: 'preview', label: 'Preview', content: <div className="component-docs__preview"><Preview /></div> },
            { id: 'code', label: 'Code', content: <CodeBlock language="tsx" label={`${item.name} example code`} code={code} /> },
          ]} />
        </section>
        <section className="component-docs__section" aria-labelledby="installation"><h2 id="installation" tabIndex={-1}>Installation</h2>
          <p><Link href={sitePath('getting-started')}>Set up BBB</Link>, then add the component and its shared dependencies.</p>
          <CodeBlock language="sh" label={`Install ${item.name}`} code={`npx @beepboopbit/ui@latest add ${id}`} />
          {id === 'button-group' && <p>The split-button example also needs <code>dropdown-menu</code>. Add it with the same command.</p>}
          <details className="component-docs__source"><summary>Manual installation and source</summary><SourceBundleDetails itemId={id} /></details>
        </section>
        <section className="component-docs__section" aria-labelledby="usage"><h2 id="usage" tabIndex={-1}>Usage</h2><p>{info.use}</p><CodeBlock language="tsx" label={`${item.name} usage`} code={code} />
          {info.extraCode && <CodeBlock language="tsx" label={`${item.name} composition`} code={info.extraCode} />}
        </section>
        <section className="component-docs__section" aria-labelledby="states"><h2 id="states" tabIndex={-1}>Variants and states</h2><p>{info.states}</p><div className="component-docs__example">{children}</div></section>
        <section className="component-docs__section" aria-labelledby="accessibility"><h2 id="accessibility" tabIndex={-1}>Accessibility</h2><ul>{info.keyboard.map(text => <li key={text}>{text}</li>)}</ul></section>
        <section className="component-docs__section" aria-labelledby="api"><h2 id="api" tabIndex={-1}>API reference</h2>
          <div className="component-docs__table" role="region" aria-label={`${item.name} properties`} tabIndex={0}><table><thead><tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Default / notes</th></tr></thead><tbody>{info.api.map(([prop, type, note]) => <tr key={prop}><th scope="row">{prop}</th><td>{type}</td><td>{note}</td></tr>)}</tbody></table></div>
        </section>
        <div className="component-docs__next"><span>Make it your own.</span><Link href={`${sitePath('gallery')}?category=components`}>Explore all components <Icon name="arrow-right" /></Link></div>
      </article>
      <nav className="component-docs__contents" aria-label="On this page"><span>On this page</span>{sections.map(section => <a key={section} href={`#${section}`}>{section === 'api' ? 'API reference' : section === 'states' ? 'Variants and states' : section[0].toUpperCase() + section.slice(1)}</a>)}</nav>
    </div>
    <SiteFooter />
  </>
}
