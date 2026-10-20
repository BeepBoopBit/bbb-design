import { useEffect, useId, useRef, useState } from 'react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { Button } from '../../../components/Button/Button'
import { TextField } from '../../../components/TextField/TextField'
import { DateRangePicker } from '../../../components/DatePicker/DatePicker'
import { NumberField } from '../../../components/NumberField/NumberField'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { Stepper } from '../../../components/Stepper/Stepper'
import { Alert } from '../../../components/Alert/Alert'
import { useDemoRequest } from './useDemoRequest'
import './WorkflowPatterns.css'
export function MultiStepFormPattern() {
  const start = today(getLocalTimeZone())
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dates, setDates] = useState({ start, end: start.add({ days: 2 }) })
  const [people, setPeople] = useState(2)
  const [errors, setErrors] = useState<string[]>([])
  const [failure, setFailure] = useState(false)
  const [serverError, setServerError] = useState(false)
  const [done, setDone] = useState(false)
  const id = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const summary = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const previous = useRef('0-false')
  const { pending, run } = useDemoRequest()
  useEffect(() => {
    if (errors.length) summary.current?.focus()
  }, [errors])
  useEffect(() => {
    const next = `${step}-${done}`
    if (previous.current !== next) {
      heading.current?.focus()
      previous.current = next
    }
  }, [step, done])
  return (
    <form
      ref={form}
      className="workflow-pattern"
      aria-labelledby={id}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const next: string[] = []
        if (!name.trim()) next.push('Enter your name.')
        if (
          !email.trim() ||
          (step === 0 &&
            form.current?.querySelector<HTMLInputElement>('input[type="email"]')?.validity
              .typeMismatch)
        )
          next.push('Enter a valid contact email.')
        if (
          step === 1 &&
          (!Number.isFinite(people) || people < 1 || people > 12 || !Number.isInteger(people))
        )
          next.push('Choose 1 to 12 attendees.')
        if (step === 1 && !form.current?.checkValidity())
          next.push('Check the dates and attendee count.')
        setErrors(next)
        if (next.length) return
        if (step < 2) setStep(step + 1)
        else {
          setServerError(false)
          run(() => {
            if (failure) {
              setServerError(true)
              heading.current?.focus()
            } else setDone(true)
          })
        }
      }}
    >
      <Stepper
        label="Reservation progress"
        steps={['Contact', 'Details', 'Review']}
        currentStep={done ? 3 : step}
      />
      <header className="workflow-pattern__intro">
        <h4 ref={heading} id={id} tabIndex={-1}>
          {done
            ? 'Reservation complete'
            : ['Who’s joining?', 'Choose the details', 'Review your reservation'][step]}
        </h4>
        <p>A sample reservation; nothing is booked or charged.</p>
      </header>
      {!!errors.length && (
        <div ref={summary} tabIndex={-1} role="alert" className="workflow-pattern__error">
          <strong>Check these details</strong>
          <ul>
            {errors.map((error, index) => (
              <li key={error}>
                {step === 0 ? (
                  <a href={`#${id}-${index === 0 && !name.trim() ? 'name' : 'email'}`}>{error}</a>
                ) : (
                  error
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {serverError && (
        <Alert title="We couldn’t save your reservation" tone="danger" role="alert">
          Your details are still here. Turn off the failure example and try again.
        </Alert>
      )}
      {done ? (
        <>
          <Alert title={`Saved for ${name}`} tone="success">
            {people} attendees, {dates.start.toString()} to {dates.end.toString()}.
          </Alert>
          <Button
            onPress={() => {
              setDone(false)
              setStep(0)
            }}
          >
            Edit reservation
          </Button>
        </>
      ) : (
        <>
          <div className="workflow-pattern__step" key={step}>
            {step === 0 && (
              <>
                <TextField
                  id={`${id}-name`}
                  label="Contact name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.length && !name.trim() ? 'Enter your name.' : undefined}
                />
                <TextField
                  id={`${id}-email`}
                  label="Contact email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={
                    errors.some((error) => error.includes('email'))
                      ? 'Enter a valid email address.'
                      : undefined
                  }
                />
              </>
            )}
            {step === 1 && (
              <>
                <DateRangePicker
                  label="Reservation dates"
                  value={dates}
                  onChange={(value) => {
                    if (value) setDates(value)
                  }}
                  minValue={start}
                  required
                />
                <NumberField
                  label="Attendees"
                  value={people}
                  onChange={setPeople}
                  minValue={1}
                  maxValue={12}
                  step={1}
                  required
                />
              </>
            )}
            {step === 2 && (
              <>
                <dl className="workflow-pattern__summary">
                  <dt>Contact</dt>
                  <dd>
                    {name}
                    <br />
                    {email}
                  </dd>
                  <dt>Dates</dt>
                  <dd>
                    {dates.start.toString()} – {dates.end.toString()}
                  </dd>
                  <dt>Attendees</dt>
                  <dd>{people}</dd>
                </dl>
                <Checkbox
                  label="Simulate a save failure"
                  isSelected={failure}
                  onChange={setFailure}
                  disabled={pending}
                />
              </>
            )}
          </div>
          <div className="workflow-pattern__actions">
            <Button
              variant="ghost"
              disabled={step === 0 || pending}
              onPress={() => {
                setErrors([])
                setServerError(false)
                setStep(step - 1)
              }}
            >
              Back
            </Button>
            <Button type="submit" loading={pending}>
              {pending ? 'Saving…' : step === 2 ? 'Save reservation' : 'Continue'}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
