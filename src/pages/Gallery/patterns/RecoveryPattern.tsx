import { useRef, useState } from 'react'
import { Button } from '../../../components/Button/Button'
import { EmptyState } from '../../../components/EmptyState/EmptyState'
import { Select } from '../../../components/Select/Select'
import { Skeleton } from '../../../components/Skeleton/Skeleton'
import { Card } from '../../../components/Card/Card'
import { useDemoRequest } from './useDemoRequest'
import './WorkflowPatterns.css'
const states = {
  error: {
    title: 'Something didn’t load',
    description: 'Your work is safe. Try loading this view again.',
    action: 'Try again',
  },
  offline: {
    title: 'You’re offline',
    description: 'Check your connection, then try again.',
    action: 'Reconnect',
  },
  denied: {
    title: 'This space is private',
    description: 'Ask the workspace owner for access.',
    action: 'Request access',
  },
  missing: {
    title: 'We couldn’t find that page',
    description: 'It may have moved. Your workspace is still here.',
    action: 'Back to workspace',
  },
}
export function RecoveryPattern() {
  const [state, setState] = useState<keyof typeof states | 'loading' | 'ready'>('error')
  const [message, setMessage] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const { run, cancel } = useDemoRequest()
  function load() {
    setState('loading')
    setMessage('Loading workspace.')
    run(() => {
      setState('ready')
      setMessage('Workspace loaded.')
      requestAnimationFrame(() => heading.current?.focus())
    })
  }
  return (
    <div className="workflow-pattern">
      <Select
        label="Page state example"
        value={state}
        onChange={(value) => {
          cancel()
          setMessage('')
          if (value === 'loading') load()
          else setState(value as typeof state)
        }}
        options={[
          { id: 'error', label: 'Load error' },
          { id: 'offline', label: 'Offline' },
          { id: 'denied', label: 'No access' },
          { id: 'missing', label: 'Not found' },
          { id: 'loading', label: 'Loading' },
          { id: 'ready', label: 'Loaded' },
        ]}
      />
      <div aria-busy={state === 'loading'}>
        {state === 'loading' ? (
          <div className="workflow-pattern__fields" aria-label="Loading workspace">
            <Skeleton variant="title" />
            <Skeleton />
            <Skeleton />
          </div>
        ) : state === 'ready' ? (
          <Card>
            <div className="workflow-pattern__intro">
              <h4 ref={heading} tabIndex={-1}>
                Welcome to your workspace
              </h4>
              <p>Everything is ready. Pick up where you left off.</p>
            </div>
          </Card>
        ) : (
          <EmptyState
            headingLevel={4}
            title={states[state].title}
            description={states[state].description}
            tone={state === 'error' ? 'error' : 'neutral'}
            icon={state === 'denied' ? 'user-round' : 'refresh-cw'}
            action={
              <Button
                onPress={() => {
                  if (state === 'denied') setMessage('Access request recorded in this preview.')
                  else load()
                }}
              >
                {states[state].action}
              </Button>
            }
          />
        )}
      </div>
      <p className="workflow-pattern__note" role="status">
        {message || 'Switch states to explore loading, recovery, and access.'}
      </p>
    </div>
  )
}
