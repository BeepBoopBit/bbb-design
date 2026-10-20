import { useId } from 'react'
import type { ComponentPropsWithRef } from 'react'
import './Switch.css'

export type SwitchProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'role' | 'size'> & {
  label: string
  description?: string
}

export function Switch({
  label,
  description,
  id,
  className = '',
  'aria-describedby': describedBy,
  ...props
}: SwitchProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const labelId = `${inputId}-label`
  const descriptionId = `${inputId}-description`

  return (
    <label className={`bbb-switch ${className}`} htmlFor={inputId}>
      <span className="bbb-switch__copy">
        <span id={labelId} className="bbb-switch__label">{label}</span>
        {description && (
          <span id={descriptionId} className="bbb-switch__description">{description}</span>
        )}
      </span>
      <span className="bbb-switch__control">
        <input
          {...props}
          id={inputId}
          type="checkbox"
          role="switch"
          aria-labelledby={props['aria-labelledby'] ?? (props['aria-label'] ? undefined : labelId)}
          aria-describedby={
            [describedBy, description ? descriptionId : undefined].filter(Boolean).join(' ') || undefined
          }
        />
        <span className="bbb-switch__track" aria-hidden="true" />
      </span>
    </label>
  )
}
