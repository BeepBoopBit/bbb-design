import type { ComponentPropsWithRef } from 'react'
import { FormField } from '../FormField/FormField'
import type { FieldProps } from '../FormField/FormField'
import { Icon } from '../Icon/Icon'
import './NativeSelect.css'

export type NativeSelectProps = ComponentPropsWithRef<'select'> & FieldProps

/** Browser-owned options, form submission, validation, and mobile picker. */
export function NativeSelect({ label, hideLabel, hint, error, variant, id, className = '',
  children, 'aria-describedby': describedBy, ...props }: NativeSelectProps) {
  const listbox = props.multiple || (props.size ?? 0) > 1
  return <FormField {...{ label, hideLabel, hint, error, variant, id, describedBy }} className={`bbb-native-select ${className}`}>
    {({ id: inputId, describedBy: description }) => <div className="bbb-native-select__control" data-listbox={listbox || undefined}>
      <select {...props} id={inputId} className="bbb-input" aria-describedby={description}
        aria-invalid={error ? true : props['aria-invalid']}>
        {children}
      </select>
      {!listbox && <Icon name="chevron-down" />}
    </div>}
  </FormField>
}
