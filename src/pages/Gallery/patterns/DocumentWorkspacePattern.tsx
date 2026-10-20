import { useRef, useState } from 'react'
import { DocumentWorkspace } from '../../../components/DocumentWorkspace/DocumentWorkspace'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Button } from '../../../components/Button/Button'
import { SearchField } from '../../../components/SearchField/SearchField'
import { ListRow } from '../../../components/ListRow/ListRow'
import { SidebarNavigation } from '../../../components/SidebarNavigation/SidebarNavigation'
import { HelpResources } from '../components/HelpResources'
import { WorkspaceAccount } from './WorkspaceAccount'
import './DocumentWorkspacePattern.css'

const documents = [
  { id: 'brief', workspace: 0, title: 'A thoughtful starting point', favorite: true,
    body: 'Start with the person using this space. What are they trying to do, and what would make that a little easier?\n\nKeep the content at the center. Give navigation a quiet place beside it, and keep account access close without interrupting the work.' },
  { id: 'decisions', workspace: 0, title: 'Decisions worth remembering', favorite: false,
    body: 'Write down the decision, the reason behind it, and the next step.\n\nA shared record gives everyone a clear place to begin.' },
  { id: 'reading', workspace: 1, title: 'Room for discovery', favorite: true,
    body: 'A personal collection of things to explore.\n\nSave a question, follow an idea, and leave space for the unexpected.' },
]

export function DocumentWorkspacePattern() {
  const [workspaces, setWorkspaces] = useState([
    { name: 'Studio', description: 'Documents we share.', digest: true },
    { name: 'Personal', description: 'A place to explore.', digest: false },
  ])
  const [active, setActive] = useState(0)
  const [signedOut, setSignedOut] = useState(false)
  const [selectedId, setSelectedId] = useState('brief')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const searchRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const visible = documents.filter(item => item.workspace === active && (filter === 'all' || item.favorite) &&
    `${item.title} ${item.body}`.toLowerCase().includes(query.trim().toLowerCase()))
  const selected = visible.find(item => item.id === selectedId) ?? visible[0]

  return <DocumentWorkspace className="document-workspace-pattern" label="Document workspace example"
    contentLabel="Open document" navigationLabel="Document library" openNavigationLabel="Open document library"
    contentRef={contentRef} navigationDisabled={signedOut}
    navigation={({ compact, onNavigate, expandNavigation }) => <>
      <div hidden={compact}>
        <SearchField ref={searchRef} label="Search documents" placeholder="Search documents"
          value={query} onChange={setQuery} clearLabel="Clear document search" />
      </div>
      <SidebarNavigation label="Document views" compact={compact} currentId={filter}
        groups={[{ id: 'views', items: [
          { id: 'all', label: 'All documents', icon: 'file-text', href: '#all-documents' },
          { id: 'favorites', label: 'Favorites', icon: 'sparkles', href: '#favorite-documents' },
        ] }]} onNavigate={id => { setFilter(id); setQuery(''); expandNavigation() }} />
      <div hidden={compact}>
        <h4 className="document-workspace-pattern__label">Your library</h4>
        <ul className="document-workspace-pattern__list" aria-label="Documents">
          {visible.map(item => <li key={item.id}><ListRow label={item.title}
            className={selected?.id === item.id ? 'document-workspace-pattern__selected' : ''}
            description={selected?.id === item.id ? 'Open' : undefined}
            onAction={() => { setSelectedId(item.id); onNavigate() }} /></li>)}
        </ul>
        {!visible.length && <p className="preview-note">No documents in this view.</p>}
      </div>
      <div className="document-workspace-pattern__help"><HelpResources compact={compact} /></div>
    </>}
    account={<WorkspaceAccount workspaces={workspaces} active={active} signedOut={signedOut}
      onSessionChange={setSignedOut}
      onSwitch={index => { setActive(index); setQuery(''); setFilter('all'); setSelectedId(documents.find(item => item.workspace === index)!.id) }}
      onSave={value => setWorkspaces(items => items.map((item, index) => index === active ? value : item))} />}
    footer={<p className="document-workspace-pattern__status" role="status">{signedOut ? 'Signed out of this preview.' : `${visible.length} documents · Changes stay in this preview.`}</p>}
  >
    {signedOut ? <EmptyState headingLevel={4} icon="user-round" title="Your workspace is waiting" description="Sign in through the account menu to continue." /> : selected ?
      <div className="document-workspace-pattern__document">
        <p className="document-workspace-pattern__label">Library / Documents</p>
        <h4>{selected.title}</h4>
        <p className="document-workspace-pattern__body">{selected.body}</p>
      </div> : <EmptyState headingLevel={4} icon="search" title="No documents found" description="Try another word or explore the full library."
        action={<Button variant="secondary" onPress={() => {
          setQuery(''); setFilter('all')
          requestAnimationFrame(() => (searchRef.current?.getClientRects().length ? searchRef.current : contentRef.current)?.focus())
        }}>Show all documents</Button>} />}
  </DocumentWorkspace>
}
