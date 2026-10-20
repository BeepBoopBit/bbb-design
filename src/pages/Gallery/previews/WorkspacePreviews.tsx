import { useId, useRef, useState } from 'react'
import { Breadcrumbs } from '../../../components/Breadcrumbs/Breadcrumbs'
import { Button } from '../../../components/Button/Button'
import { PageHeader } from '../../../components/PageHeader/PageHeader'
import { Sheet } from '../../../components/Sheet/Sheet'
import { SidebarNavigation } from '../../../components/SidebarNavigation/SidebarNavigation'
import { TextField } from '../../../components/TextField/TextField'
import { Switch } from '../../../components/Switch/Switch'
import './WorkspacePreviews.css'

export function SidebarNavigationPreview() {
  const [current, setCurrent] = useState('overview')
  const sectionId = useId()
  const statusRef = useRef<HTMLParagraphElement>(null)
  return (
    <div className="sidebar-preview">
      <SidebarNavigation
        label="Example workspace"
        currentId={current}
        onNavigate={id => {
          setCurrent(id)
          statusRef.current?.focus()
        }}
        groups={[
          {
            id: 'work',
            label: 'Workspace',
            items: [
              { id: 'overview', label: 'Overview', href: `#${sectionId}`, icon: 'layout-grid' },
              {
                id: 'projects',
                label: 'Projects',
                href: `#${sectionId}`,
                icon: 'layers',
                badge: '3',
              },
            ],
          },
          {
            id: 'manage',
            label: 'Manage',
            items: [
              {
                id: 'members',
                label: 'Members',
                href: `#${sectionId}`,
                icon: 'user-round',
                badge: '4',
              },
              {
                id: 'billing',
                label: 'Billing',
                href: `#${sectionId}`,
                icon: 'box',
                badge: 'Soon',
                disabled: true,
              },
            ],
          },
        ]}
      />
      <p ref={statusRef} id={sectionId} className="preview-note" role="status" tabIndex={-1}>
        {current === 'overview'
          ? 'Your workspace at a glance.'
          : current === 'projects'
            ? 'Three projects, ready to explore.'
            : 'Four people, working together.'}
      </p>
    </div>
  )
}

export function PageHeaderPreview() {
  const [following, setFollowing] = useState(false)
  const titleId = useId()
  return (
    <div className="page-header-preview">
      <PageHeader
        title="Projects"
        titleId={titleId}
        headingLevel={4}
        eyebrow="YOUR WORKSPACE"
        description="A home for the things you're making together."
        breadcrumbs={
          <Breadcrumbs
            label="Header location"
            items={[
              { id: 'workspace', label: 'Workspace', href: `#${titleId}` },
              { id: 'projects', label: 'Projects' },
            ]}
          />
        }
        actions={
          <Button
            variant={following ? 'secondary' : 'primary'}
            aria-pressed={following}
            onPress={() => setFollowing(!following)}
          >
            {following ? 'Following updates' : 'Follow updates'}
          </Button>
        }
      />
      <p className="preview-note" role="status">
        {following
          ? 'Project updates followed in this preview.'
          : 'Choose which updates reach you.'}
      </p>
    </div>
  )
}

export function SheetPreview() {
  const [name, setName] = useState('Design notes')
  const [favorite, setFavorite] = useState(true)
  const [message, setMessage] = useState('Open a sheet to edit this example.')
  const formId = useId()
  return (
    <div className="preview-stack">
      <Sheet
        title="Collection details"
        description="Keep a little context close to your work."
        trigger={<Button variant="secondary">Edit collection</Button>}
        footer={close => (
          <>
            <Button variant="secondary" onPress={close}>
              Cancel
            </Button>
            <Button type="submit" form={formId}>
              Save collection
            </Button>
          </>
        )}
      >
        {close => (
          <form
            id={formId}
            className="sheet-preview-form"
            onSubmit={event => {
              event.preventDefault()
              const value = String(new FormData(event.currentTarget).get('collectionName')).trim()
              if (!value) return
              setName(value)
              setFavorite(new FormData(event.currentTarget).has('favorite'))
              setMessage(`${value} saved in this preview.`)
              close()
            }}
          >
            <TextField
              label="Collection name"
              name="collectionName"
              defaultValue={name}
              required
              pattern=".*\S.*"
              autoFocus
            />
            <Switch
              label="Show in favorites"
              name="favorite"
              defaultChecked={favorite}
              description="Keep this collection within easy reach."
            />
          </form>
        )}
      </Sheet>
      <p className="preview-note" role="status">
        {message}
      </p>
    </div>
  )
}
