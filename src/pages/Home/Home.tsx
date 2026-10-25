import { useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { Avatar } from '../../components/Avatar/Avatar'
import { AvatarGroup } from '../../components/AvatarGroup/AvatarGroup'
import { Badge } from '../../components/Badge/Badge'
import { Checkbox } from '../../components/Checkbox/Checkbox'
import { Switch } from '../../components/Switch/Switch'
import { TextField } from '../../components/TextField/TextField'
import { Select } from '../../components/Select/Select'
import { Dialog } from '../../components/Dialog/Dialog'
import { ThemeProvider } from '../../components/ThemeProvider/ThemeProvider'
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl'
import { CodeBlock } from '../../components/CodeBlock/CodeBlock'
import { Link } from '../../components/Link/Link'
import { SiteFooter } from '../Site/SiteFooter'
import { examplePath, sitePath } from '../Gallery/useGalleryLocation'
import './Home.css'

const members = [
  { id: 'alex', name: 'Alex Morgan', tone: 'teal' as const },
  { id: 'jamie', name: 'Jamie Chen', tone: 'ember' as const },
  { id: 'robin', name: 'Robin Lee', tone: 'neutral' as const },
]

function ProjectExample() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'Find a little inspiration', done: true },
    { id: 2, name: 'Make something your own', done: false },
    { id: 3, name: 'Share it with the world', done: false },
  ])
  const [name, setName] = useState('')
  const completed = projects.filter(project => project.done).length
  return <section className="home-demo home-demo--projects" aria-labelledby="projects-heading">
    <div className="home-demo__topline"><span className="home-demo__icon"><Icon name="layers" /></span><Badge tone="accent">Personal workspace</Badge></div>
    <h3 id="projects-heading">A little space for<br />your next big idea.</h3>
    <p>Good things start with a small step.</p>
    <div className="home-projects">
      {projects.map(project => <Checkbox key={project.id} label={project.name} isSelected={project.done}
        onChange={done => setProjects(items => items.map(item => item.id === project.id ? { ...item, done } : item))} />)}
    </div>
    <div className="home-project-progress"><span role="status">{completed} of {projects.length} complete</span><span>{Math.round(completed / projects.length * 100)}%</span></div>
    <div className="home-progress-track" aria-hidden="true"><span style={{ width: `${completed / projects.length * 100}%` }} /></div>
    <div className="home-demo__footer">
      <AvatarGroup label="Example project members" members={members} size="sm" />
      <Dialog title="Add a small step" description="Try adding a task to this example workspace."
        trigger={<Button size="sm" variant="secondary"><Icon name="plus" /> Add a task</Button>}>
        {close => <form className="home-demo-form" onSubmit={event => {
          event.preventDefault()
          if (!name.trim()) return
          setProjects(items => [...items, { id: Math.max(...items.map(item => item.id)) + 1, name: name.trim(), done: false }])
          setName('')
          close()
        }}>
          <TextField label="Task name" value={name} onChange={event => setName(event.target.value)} required autoFocus />
          <Button type="submit" disabled={!name.trim()}>Add task</Button>
        </form>}
      </Dialog>
    </div>
  </section>
}

function ProfileExample() {
  const [name, setName] = useState('Alex Morgan')
  const [email, setEmail] = useState('alex@example.com')
  const [role, setRole] = useState('designer')
  const [saved, setSaved] = useState(false)
  return <section className="home-demo" aria-labelledby="profile-heading">
    <div className="home-demo__topline"><Avatar name={name || 'Your profile'} tone="teal" size="lg" /><Badge dot tone="success">Available for ideas</Badge></div>
    <h3 id="profile-heading">Make yourself at home.</h3>
    <p>A few details that make this space yours.</p>
    <form className="home-demo-form" onChange={() => setSaved(false)} onSubmit={event => { event.preventDefault(); setSaved(true) }}>
      <TextField label="Full name" value={name} onChange={event => setName(event.target.value)} required />
      <TextField label="Email address" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
      <Select label="What you do" value={role} onChange={next => { setRole(next); setSaved(false) }} options={[
        { id: 'designer', label: 'Designer' }, { id: 'developer', label: 'Developer' }, { id: 'both', label: 'A little of both' },
      ]} />
      <Button type="submit" disabled={!name.trim()}>{saved ? <><Icon name="check" /> Changes saved</> : <>Save changes <Icon name="arrow-right" /></>}</Button>
      <p className="home-demo__note" role="status">{saved ? 'Profile updated in this preview.' : 'Just a preview. Your details stay here.'}</p>
    </form>
  </section>
}

function PreferencesExample() {
  const [activity, setActivity] = useState(true)
  const [digest, setDigest] = useState(false)
  return <section className="home-demo" aria-labelledby="preferences-heading">
    <span className="home-demo__icon"><Icon name="settings" /></span>
    <h3 id="preferences-heading">Less noise.<br />More of what matters.</h3>
    <p>A quieter kind of connected.</p>
    <div className="home-preferences">
      <Switch label="Project updates" description="The things you’re working on." checked={activity} onChange={event => setActivity(event.target.checked)} />
      <Switch label="Weekly digest" description="A little perspective, once a week." checked={digest} onChange={event => setDigest(event.target.checked)} />
    </div>
  </section>
}

function ActionsExample() {
  const [saved, setSaved] = useState(false)
  return <section className="home-demo home-demo--actions" aria-labelledby="actions-heading">
    <div className="home-demo__topline"><h3 id="actions-heading">Small details. Big difference.</h3><Link href={sitePath('button')} aria-label="Explore Button documentation"><Icon name="arrow-right" /></Link></div>
    <div className="home-actions-row">
      <Button size="sm" onPress={() => setSaved(value => !value)}><Icon name={saved ? 'check' : 'plus'} />{saved ? 'Added' : 'Add to collection'}</Button>
      <Button size="sm" variant="secondary" iconOnly aria-label={saved ? 'Remove from collection' : 'Save to collection'} aria-pressed={saved} onPress={() => setSaved(value => !value)}><Icon name="folder" /></Button>
    </div>
    <div className="home-actions-row"><Badge dot tone="success">Ready</Badge><Badge tone="accent">In progress</Badge><Badge>Draft</Badge></div>
  </section>
}

function BrandExample() {
  const [brand, setBrand] = useState('bbb')
  return <section className="home-brand-section" aria-labelledby="brand-heading">
    <div className="home-section-copy">
      <span className="site-eyebrow">A foundation, with room for you</span>
      <h2 id="brand-heading" className="site-section-heading">One system.<br />Your point of view.</h2>
      <p>Start with BBB’s warm, considered defaults. Make the colors, shapes, and density your own. The same components carry your choices into every interaction.</p>
      <Link href={examplePath('brand-workspace')}>Explore the brand workspace <Icon name="arrow-right" /></Link>
    </div>
    <div className="home-brand-example">
      <SegmentedControl label="Preview a brand" value={brand} onChange={setBrand} options={[
        { value: 'bbb', label: 'BBB · warm & calm' }, { value: 'studio', label: 'Studio · cool & precise' },
      ]} />
      <ThemeProvider brand={brand === 'studio' ? 'studio' : 'bbb'} className="home-brand-preview">
        <div className="home-brand-preview__heading"><span className="home-demo__icon"><Icon name="sparkles" /></span><Badge tone="accent">Your next chapter</Badge></div>
        <h3>A fresh start, already familiar.</h3>
        <p>Thoughtful choices, all the way through.</p>
        <TextField label="Workspace name" defaultValue="Something good" />
        <div className="home-brand-preview__footer"><div className="home-palette" role="img" aria-label={`${brand === 'bbb' ? 'BBB' : 'Studio'} color palette`}><i /><i /><i /><i /></div><a className="bbb-button bbb-button--primary site-button-link" href={examplePath('brand-workspace')}>Make it yours <Icon name="arrow-right" /></a></div>
      </ThemeProvider>
    </div>
  </section>
}

export function Home() {
  return <>
    <section className="home-hero" aria-labelledby="home-title">
      <a href={sitePath('getting-started')} className="home-intro-link"><span aria-hidden="true" /> Open source. Ready to make your own. <Icon name="arrow-right" /></a>
      <h1 id="home-title">Thoughtful interfaces.<br /><span>Built with BBB.</span></h1>
      <p>Editable React components, design foundations, and patterns.<br className="home-desktop-break" /> Copy the source into your app and make it your own.</p>
      <div className="home-hero__actions">
        <a className="bbb-button bbb-button--primary site-button-link" href={sitePath('getting-started')}>Get started <Icon name="arrow-right" /></a>
        <a className="bbb-button bbb-button--secondary site-button-link" href={`${sitePath('gallery')}?category=components`}>Explore components</a>
      </div>
      <div className="home-hero__details"><span>React + TypeScript</span><span>Plain CSS</span><span>Yours to customize</span></div>
    </section>

    <section className="home-showcase" aria-label="Interactive BBB examples">
      <div className="home-showcase__column"><ProjectExample /><ActionsExample /></div>
      <div className="home-showcase__column"><ProfileExample /></div>
      <div className="home-showcase__column"><PreferencesExample />
        <div className="home-showcase-note"><span className="site-eyebrow">Made of the same pieces</span><p>Try a switch.<br />Add a task.<br />Make a small change.</p><Link href={`${sitePath('gallery')}?category=patterns`}>Explore all patterns <Icon name="arrow-right" /></Link></div>
      </div>
    </section>
    <p className="home-showcase-caption"><Icon name="mouse-pointer" /> Real components. Local examples. Go ahead and try them.</p>

    <section className="home-principles" aria-label="The BBB approach">
      <div><span>01 / Clarity</span><h2>Less to figure out.</h2><p>Familiar controls, clear labels, and feedback that helps you take the next step.</p></div>
      <div><span>02 / Care</span><h2>Details you can feel.</h2><p>Keyboard interaction, visible focus, and considered states, built into the pieces you use.</p></div>
      <div><span>03 / Ownership</span><h2>A starting point that’s yours.</h2><p>Bring the source into your project. Change the code and styles as your product grows.</p></div>
    </section>

    <BrandExample />

    <section className="home-start" aria-labelledby="start-heading">
      <div className="home-section-copy"><span className="site-eyebrow">From browsing to building</span><h2 id="start-heading" className="site-section-heading">Start with one good piece.</h2><p>Set up BBB in your React app, add a component, and build from there. The installer copies the files. You take it from there.</p><Link href={sitePath('getting-started')}>Read the setup guide <Icon name="arrow-right" /></Link></div>
      <div className="home-install"><div className="home-install__label"><Icon name="square-terminal" /><span>In your existing React app</span></div><CodeBlock language="sh" label="Install BBB" code={'npx @beepboopbit/ui@latest init\nnpx @beepboopbit/ui@latest add button'} /><p>React 19.2 · TypeScript 6 · Vite · Node.js 24</p></div>
    </section>
    <SiteFooter />
  </>
}
