import { useEffect, useState } from 'react'
import { Alert } from '../../../components/Alert/Alert'
import type { AlertTone } from '../../../components/Alert/Alert'
import { Button } from '../../../components/Button/Button'
import { Progress } from '../../../components/Progress/Progress'
import { Select } from '../../../components/Select/Select'
import { Skeleton } from '../../../components/Skeleton/Skeleton'
import { ToastRegion } from '../../../components/Toast/ToastRegion'
import { createToastQueue } from '../../../components/Toast/toastQueue'
import './Previews.css'

const alerts: Record<AlertTone, { title: string; message: string }> = {
  info: { title: 'A little heads-up', message: 'Your changes are visible only to you.' },
  success: { title: 'Everything is saved', message: 'You’re ready for the next step.' },
  warning: { title: 'Almost at the limit', message: 'Make a little space before adding more.' },
  danger: { title: 'We couldn’t save that', message: 'Check your connection and try again.' },
}

export function AlertPreview() {
  const [tone, setTone] = useState<AlertTone>('info')
  return (
    <div className="field-preview">
      <Alert tone={tone} title={alerts[tone].title}>
        {alerts[tone].message}
      </Alert>
      <Select
        label="Message tone"
        value={tone}
        onChange={value => setTone(value as AlertTone)}
        options={[
          { id: 'info', label: 'Information' },
          { id: 'success', label: 'Success' },
          { id: 'warning', label: 'Warning' },
          { id: 'danger', label: 'Error' },
        ]}
      />
    </div>
  )
}

export function ToastPreview() {
  const [queue] = useState(createToastQueue)
  const [restored, setRestored] = useState(false)
  useEffect(() => () => queue.clear(), [queue])
  return (
    <div className="preview-stack">
      <ToastRegion queue={queue} />
      <Button
        variant="secondary"
        onPress={() =>
          queue.add({
            title: 'Changes saved',
            description: 'Everything is right where you left it.',
          })
        }
      >
        Show notification
      </Button>
      <Button variant="secondary" onPress={() => {
        setRestored(false)
        const key = queue.add({
          title: 'Item archived',
          description: 'You can restore it with Undo.',
          action: {
            label: 'Undo',
            onPress: () => {
              setRestored(true)
              queue.close(key)
            },
          },
        })
      }}>Try Undo notification</Button>
      {restored && <p className="preview-note" role="status">Item restored.</p>}
      <p className="preview-note">A small confirmation. Dismiss when you’re ready.</p>
    </div>
  )
}

export function ProgressPreview() {
  const [value, setValue] = useState(40)
  return (
    <div className="field-preview">
      <Progress label="Upload progress" value={value} />
      <Progress label="Preparing your files" />
      <div className="preview-row">
        <Button
          size="sm"
          variant="secondary"
          disabled={value === 100}
          onPress={() => setValue(previous => Math.min(100, previous + 20))}
        >
          Advance
        </Button>
        <Button size="sm" variant="ghost" onPress={() => setValue(0)}>
          Reset
        </Button>
      </div>
      <p className="preview-note" role="status">
        {value === 100 ? 'Upload complete.' : `${value}% uploaded.`}
      </p>
    </div>
  )
}

export function SkeletonPreview() {
  const [loading, setLoading] = useState(true)
  return (
    <div className="field-preview">
      <div
        role="group"
        aria-busy={loading}
        aria-label="Profile preview"
        className="preview-skeleton-profile"
      >
        {loading ? (
          <>
            <Skeleton variant="avatar" />
            <div className="preview-skeleton-lines">
              <Skeleton variant="title" short />
              <Skeleton />
              <Skeleton short />
            </div>
          </>
        ) : (
          <div className="preview-loaded-profile">
            <strong>Alex Morgan</strong>
            <span>A little more space for your next idea.</span>
          </div>
        )}
      </div>
      <Button variant="secondary" size="sm" onPress={() => setLoading(previous => !previous)}>
        {loading ? 'Reveal content' : 'Show skeleton'}
      </Button>
      <p className="preview-note" role="status">
        {loading ? 'Loading profile…' : 'Profile loaded.'}
      </p>
    </div>
  )
}
