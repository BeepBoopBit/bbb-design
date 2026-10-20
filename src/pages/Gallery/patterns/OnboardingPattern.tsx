import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../../components/Button/Button'
import { TextField } from '../../../components/TextField/TextField'
import { MultiSelect } from '../../../components/MultiSelect/MultiSelect'
import { Switch } from '../../../components/Switch/Switch'
import { Stepper } from '../../../components/Stepper/Stepper'
import { Alert } from '../../../components/Alert/Alert'
import { useDemoRequest } from './useDemoRequest'
import './WorkflowPatterns.css'
const interests = [
  { id: 'design', label: 'Design' },
  { id: 'research', label: 'Research' },
  { id: 'engineering', label: 'Engineering' },
]
export function OnboardingPattern() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState(['design'])
  const [updates, setUpdates] = useState(true)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const previous = useRef('0-false')
  const id = useId()
  const { pending, run } = useDemoRequest()
  useEffect(() => {
    const next = `${step}-${done}`
    if (previous.current !== next) {
      heading.current?.focus()
      previous.current = next
    }
  }, [step, done])
  return (
    <form
      className="workflow-pattern"
      aria-labelledby={id}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) {
          setError('Give your workspace a name.')
          nameRef.current?.focus()
          return
        }
        if (step < 2) setStep(step + 1)
        else run(() => setDone(true))
      }}
    >
      <Stepper
        label="Workspace setup progress"
        steps={['Workspace', 'Preferences', 'Review']}
        currentStep={done ? 3 : step}
      />
      <header className="workflow-pattern__intro">
        <h4 id={id} ref={heading} tabIndex={-1}>
          {done
            ? 'Make yourself at home'
            : ['A place for your ideas', 'Make it yours', 'Ready when you are'][step]}
        </h4>
        <p>Your choices stay in this local preview.</p>
      </header>
      {done ? (
        <>
          <Alert title={`${name} is ready`} tone="success">
            Your workspace preferences have been saved in this preview.
          </Alert>
          <Button
            onPress={() => {
              setDone(false)
              setStep(0)
            }}
          >
            Edit setup
          </Button>
        </>
      ) : (
        <>
          <div className="workflow-pattern__step" key={step}>
            {step === 0 && (
              <TextField
                ref={nameRef}
                label="Workspace name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                error={error}
                required
              />
            )}
            {step === 1 && (
              <>
                <MultiSelect
                  label="Your interests"
                  options={interests}
                  value={selected}
                  onChange={setSelected}
                  hint="Choose as many as you like."
                />
                <Switch
                  label="Weekly workspace summary"
                  checked={updates}
                  onChange={(e) => setUpdates(e.target.checked)}
                />
              </>
            )}
            {step === 2 && (
              <dl className="workflow-pattern__summary">
                <dt>Workspace</dt>
                <dd>{name}</dd>
                <dt>Interests</dt>
                <dd>
                  {interests
                    .filter((i) => selected.includes(i.id))
                    .map((i) => i.label)
                    .join(', ') || 'None selected'}
                </dd>
                <dt>Weekly summary</dt>
                <dd>{updates ? 'On' : 'Off'}</dd>
              </dl>
            )}
          </div>
          <div className="workflow-pattern__actions">
            <Button
              variant="ghost"
              disabled={step === 0 || pending}
              onPress={() => setStep(step - 1)}
            >
              Back
            </Button>
            <Button type="submit" loading={pending}>
              {pending ? 'Creating…' : step === 2 ? 'Create workspace' : 'Continue'}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
