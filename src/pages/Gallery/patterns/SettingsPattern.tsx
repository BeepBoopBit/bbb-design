import { ThemeProvider } from '../../../components/ThemeProvider/ThemeProvider'
import type { ThemeMode, Density } from '../../../components/ThemeProvider/ThemeProvider'
import { AppearanceSettings } from '../../../components/AppearanceSettings/AppearanceSettings'
import { Select } from '../../../components/Select/Select'
import { useThemeAttributes } from '../../../components/ThemeProvider/theme'
import { useState } from 'react'
import { Avatar } from '../../../components/Avatar/Avatar'
import { AvatarGroup } from '../../../components/AvatarGroup/AvatarGroup'
import type { AvatarMember } from '../../../components/AvatarGroup/AvatarGroup'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { Dialog } from '../../../components/Dialog/Dialog'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { ListRow } from '../../../components/ListRow/ListRow'
import { SettingsSection } from '../../../components/SettingsSection/SettingsSection'
import { Switch } from '../../../components/Switch/Switch'
import { TextField } from '../../../components/TextField/TextField'
import './SettingsPattern.css'

function InviteForm({
  onInvite,
  close,
}: {
  onInvite: (name: string, email: string) => void
  close: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  return (
    <form
      className="settings-pattern__invite-form"
      onSubmit={event => {
        event.preventDefault()
        if (name.trim()) {
          onInvite(name.trim(), email.trim())
          close()
        }
      }}
    >
      <TextField
        label="Teammate name"
        value={name}
        onChange={event => setName(event.target.value)}
        required
        autoFocus
      />
      <TextField
        label="Teammate email"
        type="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        required
      />
      <div className="bbb-dialog__actions">
        <Button variant="secondary" onPress={close}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          Add invitation
        </Button>
      </div>
    </form>
  )
}

const initialMembers: AvatarMember[] = [
  { id: 'alex', name: 'Alex Morgan', tone: 'teal' },
  { id: 'jamie', name: 'Jamie Chen', tone: 'ember' },
  { id: 'robin', name: 'Robin Lee' },
  { id: 'sam', name: 'Sam Rivera', tone: 'teal' },
]

export function SettingsPattern() {
  const theme = useThemeAttributes()
  const [mode, setMode] = useState<ThemeMode>()
  const [density, setDensity] = useState<Density>('comfortable')
  const [locale, setLocale] = useState('en-US')
  const [displayName, setDisplayName] = useState('Alex Morgan')
  const [signedOut, setSignedOut] = useState(false)
  const [activity, setActivity] = useState(true)
  const [digest, setDigest] = useState(false)
  const [invites, setInvites] = useState<{ id: string; name: string; email: string }[]>([])
  const [message, setMessage] = useState('Changes and invitations stay in this preview.')
  return (
    <ThemeProvider mode={mode} density={density} locale={locale} className="settings-pattern" role="group" aria-label="Workspace settings example">
      <header className="settings-pattern__header">
        <div>
          <span className="settings-pattern__eyebrow">MAKE YOURSELF AT HOME</span>
          <h4>Workspace settings</h4>
          <p>A few thoughtful choices for the way you work.</p>
        </div>
        <Badge tone="neutral">Personal workspace</Badge>
      </header>
      <Card
        title="Your people"
        description="Good work starts with a little company."
        headingLevel={4}
        footer={
          <>
            <AvatarGroup label="Workspace members" members={initialMembers} />
            <span>4 people in this space</span>
          </>
        }
      >
        <ListRow
          label="Alex Morgan"
          description="alex@example.com"
          leading={<Avatar name="Alex Morgan" tone="teal" size="lg" decorative />}
          trailing={<Badge tone="accent">Owner</Badge>}
        />
      </Card>
      <SettingsSection title="Profile" description="How you appear to your team." headingLevel={4}>
        <form className="settings-pattern__invite-form" onSubmit={event => {
          event.preventDefault(); if (displayName.trim()) setMessage(`Profile saved for ${displayName.trim()}.`)
        }}>
          <TextField label="Display name" value={displayName} required onChange={event => setDisplayName(event.target.value)} />
          <Button type="submit" disabled={!displayName.trim()}>Save profile</Button>
        </form>
      </SettingsSection>
      <SettingsSection title="Appearance" description="Make this space comfortable for you." headingLevel={4}>
        <AppearanceSettings mode={mode ?? theme['data-bbb-mode']} onModeChange={setMode} density={density} onDensityChange={setDensity} />
      </SettingsSection>
      <SettingsSection title="Language" description="Shared controls follow your language and reading direction." headingLevel={4}>
        <Select label="Interface language" value={locale} onChange={setLocale} options={[
          { id: 'en-US', label: 'English' }, { id: 'ar', label: 'العربية' },
        ]} />
      </SettingsSection>
      <SettingsSection
        title="Notifications"
        description="Keep what matters. Quiet the rest."
        headingLevel={4}
      >
        <Switch
          label="Workspace activity"
          description="Updates from the people you work with."
          checked={activity}
          onChange={event => {
            setActivity(event.target.checked)
            setMessage(`Workspace activity ${event.target.checked ? 'enabled' : 'disabled'}.`)
          }}
        />
        <Switch
          label="Weekly digest"
          description="A calm summary at the end of the week."
          checked={digest}
          onChange={event => {
            setDigest(event.target.checked)
            setMessage(`Weekly digest ${event.target.checked ? 'enabled' : 'disabled'}.`)
          }}
        />
      </SettingsSection>
      <Card
        title="Invitations"
        description="There’s room for one more perspective."
        headingLevel={4}
        action={
          <Dialog
            title="Invite a teammate"
            description="Add a local example invitation. No email is sent."
            trigger={
              <Button variant="secondary" size="sm" aria-label="Invite teammate">
                Invite
              </Button>
            }
          >
            {close => (
              <InviteForm
                close={close}
                onInvite={(name, email) => {
                  setInvites(previous => [
                    ...previous,
                    { id: String(previous.length), name, email },
                  ])
                  setMessage(`Invitation for ${name} added to this preview.`)
                }}
              />
            )}
          </Dialog>
        }
      >
        {invites.length ? (
          <div className="settings-pattern__invitations">
            {invites.map(invite => (
              <ListRow
                key={invite.id}
                label={invite.name}
                description={invite.email}
                leading={<Avatar name={invite.name} tone="ember" decorative />}
                trailing={<Badge>Pending</Badge>}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No pending invitations"
            description="Invite someone to share this space with you."
            icon="mail"
            headingLevel={4}
          />
        )}
      </Card>
      <SettingsSection title="Account" headingLevel={4}>
        <Button variant="secondary" onPress={() => { setSignedOut(!signedOut); setMessage(signedOut ? 'Welcome back to this preview.' : 'Signed out of this preview.') }}>
          {signedOut ? 'Sign in to preview' : 'Sign out of preview'}
        </Button>
      </SettingsSection>
      <p className="settings-pattern__status" role="status">
        {message}
      </p>
    </ThemeProvider>
  )
}
