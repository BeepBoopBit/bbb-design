import { useId, useRef, useState } from 'react'
import { Avatar } from '../../../components/Avatar/Avatar'
import { Button } from '../../../components/Button/Button'
import { Combobox } from '../../../components/Combobox/Combobox'
import { Select } from '../../../components/Select/Select'
import { Switch } from '../../../components/Switch/Switch'
import { Textarea } from '../../../components/Textarea/Textarea'
import { TextField } from '../../../components/TextField/TextField'
import type { FieldVariant } from '../../../components/FormField/FieldSurface'
import { FieldStylePicker } from '../components/FieldStylePicker'
import './ProfileFormPattern.css'

type Profile = {
  fullName: string
  email: string
  region: string
  team: string | null
  bio: string
  available: boolean
}

const initialProfile: Profile = {
  fullName: 'Alex Morgan',
  email: 'alex@example.com',
  region: 'asia',
  team: 'design',
  bio: 'Making thoughtful things, one detail at a time.',
  available: true,
}

export function ProfileFormPattern() {
  const [variant, setVariant] = useState<FieldVariant>('filled')
  const headingId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState(initialProfile)
  const [draft, setDraft] = useState(initialProfile)
  const [errors, setErrors] = useState({ fullName: '', email: '' })
  const [message, setMessage] = useState('')

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft(previous => ({ ...previous, [key]: value }))
    if (key === 'fullName' || key === 'email') setErrors(previous => ({ ...previous, [key]: '' }))
    setMessage('')
  }

  return (
    <form
      className="profile-form"
      aria-labelledby={headingId}
      noValidate
      onSubmit={event => {
        event.preventDefault()
        const nextErrors = {
          fullName: draft.fullName.trim() ? '' : 'Enter your full name.',
          email: !draft.email.trim()
            ? 'Enter your email address.'
            : emailRef.current?.validity.typeMismatch
              ? 'Use an email like alex@example.com.'
              : '',
        }
        setErrors(nextErrors)
        if (nextErrors.fullName || nextErrors.email) {
          setMessage('Check the highlighted details.')
          ;(nextErrors.fullName ? nameRef : emailRef).current?.focus()
          return
        }
        const profile = { ...draft, fullName: draft.fullName.trim(), email: draft.email.trim() }
        setDraft(profile)
        setSaved(profile)
        setMessage('Profile saved. Your details are up to date.')
      }}
    >
      <header className="profile-form__header">
        <Avatar name={saved.fullName} size="lg" tone="teal" decorative />
        <div className="profile-form__heading">
          <h4 id={headingId}>Personal details</h4>
          <p>Choose how you appear to your team.</p>
        </div>
      </header>
      <FieldStylePicker value={variant} onChange={setVariant} />
      <div className="profile-form__fields">
        <TextField
          ref={nameRef}
          variant={variant}
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          value={draft.fullName}
          onChange={event => update('fullName', event.target.value)}
          error={errors.fullName}
        />
        <TextField
          ref={emailRef}
          variant={variant}
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={draft.email}
          onChange={event => update('email', event.target.value)}
          error={errors.email}
        />
        <Combobox
          variant={variant}
          label="Team"
          name="team"
          selectedKey={draft.team}
          onSelectionChange={key => update('team', key === null ? null : String(key))}
          options={[
            { id: 'design', label: 'Design' },
            { id: 'engineering', label: 'Engineering' },
            { id: 'product', label: 'Product' },
          ]}
        />
        <Select
          variant={variant}
          label="Region"
          name="region"
          value={draft.region}
          onChange={value => update('region', value)}
          options={[
            { id: 'asia', label: 'Asia Pacific' },
            { id: 'europe', label: 'Europe' },
            { id: 'americas', label: 'Americas' },
          ]}
        />
        <Textarea
          variant={variant}
          className="profile-form__full-width"
          label="A little about you"
          name="bio"
          value={draft.bio}
          onChange={event => update('bio', event.target.value)}
          maxLength={240}
        />
      </div>
      <div className="profile-form__preference">
        <Switch
          label="Available for collaboration"
          description="Let your team know you’re open to new ideas."
          checked={draft.available}
          onChange={event => update('available', event.target.checked)}
        />
      </div>
      <footer className="profile-form__footer">
        <p role="status">{message || 'Your changes stay in this preview.'}</p>
        <div className="profile-form__actions">
          <Button
            variant="ghost"
            aria-label="Discard changes"
            onPress={() => {
              setDraft(saved)
              setErrors({ fullName: '', email: '' })
              setMessage('Unsaved changes discarded.')
            }}
          >
            Discard
          </Button>
          <Button type="submit">Save profile</Button>
        </div>
      </footer>
    </form>
  )
}
