import { useState } from 'react'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Icon } from '../../../components/Icon/Icon'
import { Switch } from '../../../components/Switch/Switch'
import { TextField } from '../../../components/TextField/TextField'
import type { FieldVariant } from '../../../components/FormField/FieldSurface'
import { FieldStylePicker } from '../components/FieldStylePicker'
import './Previews.css'

export function ButtonPreview() {
  const [message, setMessage] = useState('Try an action. Tab to explore focus states.')

  return (
    <div className="button-preview">
      <div className="preview-row">
        <Button onClick={() => setMessage('Continue selected. You’re ready for the next step.')}>
          Continue <Icon name="arrow-right" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => setMessage('Changes cancelled. Try another action.')}
        >
          Cancel
        </Button>
        <Button
          variant="ghost"
          onClick={() => setMessage('Three variants. One consistent interaction.')}
        >
          Learn more
        </Button>
      </div>
      <div className="preview-row">
        <span className="preview-state-label">States</span>
        <Button disabled size="sm">
          Disabled
        </Button>
        <Button loading size="sm">
          Loading
        </Button>
      </div>
      <div className="preview-row">
        <Button
          variant="danger"
          size="sm"
          onPress={() => setMessage('Destructive action selected.')}
        >
          <Icon name="trash-2" />
          Delete
        </Button>
        <Button
          variant="secondary"
          iconOnly
          size="sm"
          aria-label="Add item"
          onPress={() => setMessage('New item added.')}
        >
          <Icon name="plus" />
        </Button>
      </div>
      <p className="preview-note" role="status">
        {message}
      </p>
    </div>
  )
}

export function BadgePreview() {
  return (
    <div className="badge-preview">
      <div className="preview-row">
        <Badge dot tone="success">
          Available
        </Badge>
        <Badge dot tone="warning">
          In progress
        </Badge>
      </div>
      <div className="preview-row">
        <Badge>Draft</Badge>
        <Badge tone="accent">New addition</Badge>
      </div>
      <p className="preview-note">A clear signal, without the noise.</p>
    </div>
  )
}

export function TextFieldPreview() {
  const [variant, setVariant] = useState<FieldVariant>('filled')
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const error = touched && !value.trim() ? 'Enter a name to continue.' : undefined

  return (
    <div className="field-preview">
      <FieldStylePicker value={variant} onChange={setVariant} />
      <TextField
        variant={variant}
        label="Project name"
        placeholder="A new beginning"
        value={value}
        onChange={event => setValue(event.target.value)}
        onBlur={() => setTouched(true)}
        hint="Make it something memorable."
        error={error}
        required
      />
      <TextField variant={variant} label="Workspace" value="Personal workspace" disabled />
      <p className="preview-note">Leave the name empty to try validation.</p>
    </div>
  )
}

export function SwitchPreview() {
  const [notifications, setNotifications] = useState(true)
  const [sounds, setSounds] = useState(false)

  return (
    <div className="switch-preview">
      <Switch
        label="Notifications"
        description="Stay in the loop."
        checked={notifications}
        onChange={event => setNotifications(event.target.checked)}
      />
      <Switch
        label="Sound effects"
        description="A little audible feedback."
        checked={sounds}
        onChange={event => setSounds(event.target.checked)}
      />
      <Switch label="Automatic updates" defaultChecked disabled />
      <p className="preview-note" role="status">
        Notifications {notifications ? 'on' : 'off'}. Sound {sounds ? 'on' : 'off'}.
      </p>
    </div>
  )
}
