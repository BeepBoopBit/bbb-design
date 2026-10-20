import { Label, Radio, RadioGroup as AriaRadioGroup, Text } from 'react-aria-components'
import type { RadioGroupProps as AriaRadioGroupProps } from 'react-aria-components'
import '../FormField/FormField.css'
import '../FormField/ChoiceControl.css'
import './RadioGroup.css'

export type RadioGroupProps = Omit<AriaRadioGroupProps, 'children' | 'className' | 'isDisabled'> & {
  label: string
  options: { value: string; label: string; description?: string; disabled?: boolean }[]
  hint?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function RadioGroup({
  label,
  options,
  hint,
  error,
  disabled,
  className = '',
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...props}
      isDisabled={disabled}
      isInvalid={Boolean(error) || props.isInvalid}
      validationBehavior="aria"
      className={`bbb-radio-group ${className}`}
    >
      <Label className="bbb-field__label">{label}</Label>
      <div className="bbb-radio-group__options">
        {options.map(option => (
          <Radio
            key={option.value}
            value={option.value}
            aria-label={option.label}
            isDisabled={option.disabled}
            className="bbb-choice bbb-radio"
          >
            <span className="bbb-choice__indicator bbb-radio__indicator" aria-hidden="true" />
            <span>
              <span>{option.label}</span>
              {option.description && (
                <Text slot="description" className="bbb-radio__description">
                  {option.description}
                </Text>
              )}
            </span>
          </Radio>
        ))}
      </div>
      {(error || hint) && (
        <Text
          slot="description"
          className={`bbb-field__message ${error ? 'bbb-field__message--error' : ''}`}
        >
          {error || hint}
        </Text>
      )}
    </AriaRadioGroup>
  )
}
