import { useEffect, useRef, useState } from 'react'
import { CommandSearch } from '../../../components/CommandPalette/CommandSearch'
import { DescriptionList } from '../../../components/DescriptionList/DescriptionList'
import { Select } from '../../../components/Select/Select'
import { Icon } from '../../../components/Icon/Icon'
import './WorkflowPatterns.css'

const results = [
  { id: 'brand', label: 'Brand refresh', group: 'Projects', description: 'Identity, guidelines, and rollout.', keywords: ['identity'], leading: <Icon name="box" /> },
  { id: 'launch', label: 'Autumn launch', group: 'Projects', description: 'The next release, together.', leading: <Icon name="box" /> },
  { id: 'notes', label: 'Design review notes', group: 'Documents', description: 'Decisions from our latest review.', leading: <Icon name="file-text" /> },
  { id: 'alex', label: 'Alex Morgan', group: 'People', description: 'Design · Workspace member', leading: <Icon name="user-round" /> },
]

export function SearchPattern() {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('all')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string>()
  const heading = useRef<HTMLHeadingElement>(null)
  const result = results.find(item => item.id === selected)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [query, scope])
  return <div className="workflow-pattern">
    <header className="workflow-pattern__intro"><h4>Find it in your workspace</h4><p>Search projects, documents, and people from one place.</p></header>
    <Select label="Search scope" variant="subtle" hideLabel value={scope} onChange={value => { setScope(value); setLoading(true) }} options={[
      { id: 'all', label: 'Everything' }, { id: 'Projects', label: 'Projects' }, { id: 'Documents', label: 'Documents' }, { id: 'People', label: 'People' },
    ]} />
    <CommandSearch label="Search workspace" items={results.filter(item => scope === 'all' || scope === item.group)} query={query}
      onQueryChange={value => { setQuery(value); setLoading(true) }} loading={loading}
      onAction={id => { setSelected(id); requestAnimationFrame(() => heading.current?.focus()) }} />
    {result && <section aria-label="Selected search result">
      <h4 ref={heading} tabIndex={-1}>{result.label}</h4>
      <DescriptionList items={[{ id: 'type', label: 'Type', value: result.group }, { id: 'about', label: 'About', value: result.description }]} />
    </section>}
    <p className="preview-note">Search timing and results are local examples.</p>
  </div>
}
