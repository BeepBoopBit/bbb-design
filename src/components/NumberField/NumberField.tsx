import type { Ref } from 'react'
import { NumberField as AriaNumberField, Group, Input, Label } from 'react-aria-components'
import type { NumberFieldProps as AriaNumberFieldProps } from 'react-aria-components'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { FieldSurface } from '../FormField/FieldSurface'
import type { FieldVariant } from '../FormField/FieldSurface'
import { FieldFeedback } from '../FormField/FieldFeedback'
import '../FormField/FormField.css'
import '../TextField/TextField.css'
import './NumberField.css'

export type NumberFieldProps = Omit<
  AriaNumberFieldProps,
  'children' | 'className' | 'isDisabled' | 'isRequired'
> & {
  ref?: Ref<HTMLInputElement>
  label: string
  hint?: string
  error?: string
  variant?: FieldVariant
  disabled?: boolean
  required?: boolean
  className?: string
}
export function NumberField({
  label,
  hint,
  error,
  variant,
  disabled,
  required,
  ref,
  className = '',
  ...props
}: NumberFieldProps) {
  return (
    <AriaNumberField
      {...props}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error || props.isInvalid}
      className={`bbb-field bbb-number-field ${className}`}
    >
      <FieldSurface variant={variant} invalid={!!error} label={
        <Label className="bbb-field__label">{label}</Label>
      }>
        <Group className="bbb-field__control">
          <Input ref={ref} />
          <Button slot="decrement" variant="ghost" size="sm" iconOnly>
            <Icon name="minus" />
          </Button>
          <Button slot="increment" variant="ghost" size="sm" iconOnly>
            <Icon name="plus" />
          </Button>
        </Group>
      </FieldSurface>
      <FieldFeedback hint={hint} error={error} />
    </AriaNumberField>
  )
}
