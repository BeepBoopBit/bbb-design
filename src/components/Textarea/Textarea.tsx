import type { ComponentPropsWithRef } from 'react'
import { FormField } from '../FormField/FormField'
import type { FieldProps } from '../FormField/FormField'
import './Textarea.css'

export type TextareaProps = ComponentPropsWithRef<'textarea'> & FieldProps

export function Textarea({
  label,
  hideLabel,
  hint,
  error,
  variant,
  id,
  className,
  'aria-describedby': describedBy,
  ...props
}: TextareaProps) {
  return (
    <FormField {...{ label, hideLabel, hint, error, variant, id, className, describedBy }}>
      {({ id: inputId, describedBy: description }) => (
        <textarea
          {...props}
          id={inputId}
          className="bbb-input bbb-textarea"
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={description}
        />
      )}
    </FormField>
  )
}
