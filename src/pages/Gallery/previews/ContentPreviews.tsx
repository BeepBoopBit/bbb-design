import { useEffect, useId, useRef, useState } from 'react'
import { Avatar } from '../../../components/Avatar/Avatar'
import { AvatarGroup } from '../../../components/AvatarGroup/AvatarGroup'
import type { AvatarMember } from '../../../components/AvatarGroup/AvatarGroup'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Icon } from '../../../components/Icon/Icon'
import { ListRow } from '../../../components/ListRow/ListRow'
import { SettingsSection } from '../../../components/SettingsSection/SettingsSection'
import { Switch } from '../../../components/Switch/Switch'
import './ContentPreviews.css'

const collaborators: AvatarMember[] = [
  { id: 'alex', name: 'Alex Morgan', tone: 'teal' },
  { id: 'jamie', name: 'Jamie Chen', tone: 'ember' },
  { id: 'robin', name: 'Robin Lee' },
  { id: 'sam', name: 'Sam Rivera', tone: 'teal' },
  { id: 'taylor', name: 'Taylor Park', tone: 'ember' },
]

export function AvatarPreview() {
  const inputRef = useRef<HTMLInputElement>(null)
  const chooseRef = useRef<HTMLButtonElement>(null)
  const [photo, setPhoto] = useState<string>()
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo)
    },
    [photo],
  )
  return (
    <div className="preview-stack">
      <div className="preview-row">
        <Avatar name="Jamie Chen" size="sm" tone="ember" />
        <Avatar name="Robin Lee" />
        <Avatar name="Alex Morgan" size="lg" tone="teal" src={photo} />
        <Avatar name="" />
      </div>
      <div className="preview-row">
        <input
          ref={inputRef}
          className="bbb-visually-hidden"
          tabIndex={-1}
          type="file"
          accept="image/*"
          aria-label="Avatar image"
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) setPhoto(URL.createObjectURL(file))
            event.target.value = ''
          }}
        />
        <Button
          ref={chooseRef}
          variant="secondary"
          size="sm"
          onPress={() => inputRef.current?.click()}
        >
          Choose photo
        </Button>
        {photo && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              setPhoto(undefined)
              chooseRef.current?.focus()
            }}
          >
            Remove photo
          </Button>
        )}
      </div>
      <p className="preview-note">
        Initials, photos, and a fallback. Your photo stays in this preview.
      </p>
    </div>
  )
}

export function AvatarGroupPreview() {
  return (
    <div className="preview-stack">
      <AvatarGroup label="Project collaborators" members={collaborators} maxVisible={3} />
      <p className="preview-note">A few faces, with room for everyone.</p>
    </div>
  )
}

export function CardPreview() {
  const [saved, setSaved] = useState(false)
  return (
    <Card
      title="A place for good ideas"
      description="Keep the details that make a difference."
      headingLevel={4}
      footer={
        <>
          <span role="status">{saved ? 'Saved to your collection.' : 'Ready when you are.'}</span>
          <Button variant="secondary" size="sm" onPress={() => setSaved(!saved)}>
            {saved ? 'Unsave card' : 'Save card'}
          </Button>
        </>
      }
    >
      <div className="content-preview__card-content">
        <Badge tone="accent">In progress</Badge>
        <p>One shared space for the work you care about.</p>
      </div>
    </Card>
  )
}

export function ListRowPreview() {
  const [message, setMessage] = useState('Choose a row to try its action.')
  const targetId = useId()
  return (
    <div className="content-preview">
      <div className="content-preview__rows">
        <ListRow
          label="Jamie Chen"
          description="Design · available to collaborate"
          leading={<Avatar name="Jamie Chen" tone="ember" decorative />}
          trailing={<Badge>Member</Badge>}
        />
        <ListRow
          label="Open activity"
          description="See the latest changes."
          leading={<Icon name="layers" />}
          onAction={() => setMessage('Activity opened in this preview.')}
        />
        <ListRow label="Jump to row details" leading={<Icon name="info" />} href={`#${targetId}`} />
        <ListRow
          label="Archived workspace"
          description="This action is unavailable."
          onAction={() => setMessage('This should not run.')}
          disabled
        />
      </div>
      <p id={targetId} tabIndex={-1} className="preview-note" role="status">
        {message}
      </p>
    </div>
  )
}

export function SettingsSectionPreview() {
  const [enabled, setEnabled] = useState(true)
  return (
    <SettingsSection
      title="Stay in the loop"
      description="Small updates, on your terms."
      headingLevel={4}
    >
      <Switch
        label="Activity emails"
        description="A note when something needs your attention."
        checked={enabled}
        onChange={event => setEnabled(event.target.checked)}
      />
      <Switch
        label="Security notices"
        description="Essential account updates stay on."
        defaultChecked
        disabled
      />
    </SettingsSection>
  )
}

export function EmptyStatePreview() {
  const [state, setState] = useState<'empty' | 'error' | 'ready'>('empty')
  const actionRef = useRef<HTMLButtonElement>(null)
  const interacted = useRef(false)
  useEffect(() => {
    if (interacted.current) actionRef.current?.focus()
  }, [state])
  function change(next: typeof state) {
    interacted.current = true
    setState(next)
  }
  return (
    <div className="content-preview">
      {state === 'ready' ? (
        <Card
          variant="quiet"
          title="Your first collection"
          description="A little space for something new."
          headingLevel={4}
          footer={
            <Button ref={actionRef} variant="ghost" size="sm" onPress={() => change('empty')}>
              Reset collection
            </Button>
          }
        />
      ) : (
        <EmptyState
          headingLevel={4}
          title={state === 'error' ? 'Couldn’t load your collections' : 'Make room for a good idea'}
          description={
            state === 'error'
              ? 'Try again to pick up where you left off.'
              : 'Start your first collection and keep everything together.'
          }
          tone={state === 'error' ? 'error' : 'neutral'}
          icon={state === 'error' ? 'triangle-alert' : 'box'}
          action={
            <Button ref={actionRef} onPress={() => change('ready')}>
              {state === 'error' ? 'Try again' : 'Create collection'}
            </Button>
          }
        />
      )}
      <Button
        variant="ghost"
        size="sm"
        onPress={() => change(state === 'error' ? 'empty' : 'error')}
      >
        {state === 'error' ? 'Show empty state' : 'Show error state'}
      </Button>
      <p role="status" className="preview-note">
        {state === 'ready'
          ? 'Collection created in this preview.'
          : state === 'error'
            ? 'Showing a recoverable error.'
            : 'No collections yet.'}
      </p>
    </div>
  )
}
