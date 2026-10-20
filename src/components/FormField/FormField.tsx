import { useId } from 'react'
import type { ReactNode } from 'react'
import { FieldSurface } from './FieldSurface'
import type { FieldVariant } from './FieldSurface'
import './FormField.css'

export type FieldProps = {
  label: string
  hideLabel?: boolean
  hint?: string
  error?: string
  variant?: FieldVariant
}

export type FormFieldProps = FieldProps & {
  id?: string
  className?: string
  describedBy?: string
  children: (ids: { id: string; describedBy?: string }) => ReactNode
}

export function FormField({
  label,
  hideLabel,
  hint,
  error,
  variant = 'filled',
  id,
  className = '',
  describedBy,
  children,
}: FormFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const message = error || hint
  const messageId = `${inputId}-message`
  const description =
    [describedBy, message ? messageId : undefined].filter(Boolean).join(' ') || undefined
  return (
    <div className={`bbb-field ${className}`}>
      <FieldSurface variant={variant} invalid={Boolean(error)} label={
        <label className={hideLabel ? 'bbb-visually-hidden' : 'bbb-field__label'} htmlFor={inputId}>
          {label}
        </label>
      }>
        {children({ id: inputId, describedBy: description })}
      </FieldSurface>
      {message && (
        <p
          id={messageId}
          className={`bbb-field__message ${error ? 'bbb-field__message--error' : ''}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
