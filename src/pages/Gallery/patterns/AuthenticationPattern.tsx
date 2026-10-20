import { PasswordField } from '../../../components/PasswordField/PasswordField'
import { VerificationCode } from '../../../components/VerificationCode/VerificationCode'
import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../../components/Button/Button'
import { TextField } from '../../../components/TextField/TextField'
import { Alert } from '../../../components/Alert/Alert'
import { useDemoRequest } from './useDemoRequest'
import './WorkflowPatterns.css'
type Stage = 'signin' | 'recover' | 'verify' | 'reset' | 'complete'
const titles: Record<Stage, string> = {
  signin: 'Welcome back',
  recover: 'Reset your password',
  verify: 'Check your code',
  reset: 'Choose a new password',
  complete: 'You’re all set',
}
export function AuthenticationPattern() {
  const [stage, setStage] = useState<Stage>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState<'email' | 'password' | 'code' | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const previous = useRef(stage)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const { pending, run } = useDemoRequest()
  useEffect(() => {
    if (previous.current !== stage) {
      heading.current?.focus()
      previous.current = stage
    }
  }, [stage])
  function move(next: Stage) {
    setError('')
    setStage(next)
  }
  return (
    <form
      className="workflow-pattern"
      aria-labelledby={id}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        setError('')
        if (
          (stage === 'signin' || stage === 'recover') &&
          (!email.trim() || emailRef.current?.validity.typeMismatch)
        ) {
          setErrorField('email')
          setError('Enter a valid email address.')
          emailRef.current?.focus()
          return
        }
        if ((stage === 'signin' || stage === 'reset') && password.length < 8) {
          setErrorField('password')
          setError('Use at least 8 characters for your password.')
          passwordRef.current?.focus()
          return
        }
        if (stage === 'verify' && code !== '123456') {
          setErrorField('code')
          setError('That code doesn’t match. Try 123456 in this preview.')
          codeRef.current?.focus()
          return
        }
        run(() => {
          if (stage === 'recover') move('verify')
          else if (stage === 'verify') {
            setPassword('')
            move('reset')
          } else move('complete')
        })
      }}
    >
      <header className="workflow-pattern__intro">
        <h4 id={id} ref={heading} tabIndex={-1}>
          {titles[stage]}
        </h4>
        <p>
          {stage === 'verify'
            ? 'Preview verification code: 123456.'
            : 'A local preview. No account is created and no email is sent.'}
        </p>
      </header>
      {error && (
        <Alert title="Check your details" tone="danger" role="alert">
          {error}
        </Alert>
      )}
      {stage === 'complete' ? (
        <>
          <Alert title="Preview completed" tone="success">
            Your details were accepted for this example.
          </Alert>
          <Button
            onPress={() => {
              setPassword('')
              setCode('')
              move('signin')
            }}
          >
            Start again
          </Button>
        </>
      ) : (
        <>
          {(stage === 'signin' || stage === 'recover') && (
            <TextField
              ref={emailRef}
              error={errorField === 'email' ? error : undefined}
              label="Account email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              required
              disabled={pending}
            />
          )}
          {(stage === 'signin' || stage === 'reset') && (
            <PasswordField
              ref={passwordRef}
              error={errorField === 'password' ? error : undefined}
              label={stage === 'reset' ? 'New password' : 'Password'}
              autoComplete={stage === 'reset' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              hint="Use at least 8 characters in this preview."
              required
              disabled={pending}
            />
          )}
          {stage === 'verify' && (
            <VerificationCode
              ref={codeRef}
              error={errorField === 'code' ? error : undefined}
              label="Verification code"
              value={code}
              onChange={(value) => {
                setCode(value)
                setError('')
              }}
              required
              disabled={pending}
            />
          )}
          <div className="workflow-pattern__actions">
            <Button
              variant="ghost"
              disabled={pending}
              onPress={() => move(stage === 'signin' ? 'recover' : 'signin')}
            >
              {stage === 'signin' ? 'Forgot password?' : 'Back to sign in'}
            </Button>
            <Button type="submit" loading={pending}>
              {pending
                ? 'Working…'
                : stage === 'signin'
                  ? 'Sign in'
                  : stage === 'recover'
                    ? 'Continue to verification'
                    : stage === 'verify'
                      ? 'Verify code'
                      : 'Save password'}
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
