import type { ComponentPropsWithRef, ReactNode } from 'react'
import { FormField } from '../FormField/FormField'
import type { FieldProps } from '../FormField/FormField'
import './TextField.css'

export type TextFieldProps = ComponentPropsWithRef<'input'> &
  FieldProps & {
    leadingIcon?: ReactNode
    trailingAction?: ReactNode
  }

export function TextField({
  label,
  hideLabel = false,
  hint,
  error,
  variant,
  leadingIcon,
  trailingAction,
  id,
  className = '',
  'aria-describedby': describedBy,
  ...props
}: TextFieldProps) {
  return (
    <FormField {...{ label, hideLabel, hint, error, variant, id, className, describedBy }}>
      {({ id: inputId, describedBy: description }) => (
        <div className="bbb-field__control" data-invalid={Boolean(error)}>
          {leadingIcon}
          <input
            {...props}
            id={inputId}
            aria-invalid={error ? true : props['aria-invalid']}
            aria-describedby={description}
          />
          {trailingAction}
        </div>
      )}
    </FormField>
  )
}
