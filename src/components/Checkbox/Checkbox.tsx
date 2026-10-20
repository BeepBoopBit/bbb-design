import { Checkbox as AriaCheckbox, Text } from 'react-aria-components'
import type { CheckboxProps as AriaCheckboxProps } from 'react-aria-components'
import { Icon } from '../Icon/Icon'
import '../FormField/ChoiceControl.css'
import './Checkbox.css'

export type CheckboxProps = Omit<AriaCheckboxProps, 'children' | 'className' | 'isDisabled'> & {
  label: string
  hideLabel?: boolean
  description?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({
  label,
  hideLabel = false,
  description,
  disabled,
  className = '',
  ...props
}: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      aria-label={props['aria-label'] ?? label}
      isDisabled={disabled}
      className={`bbb-choice bbb-checkbox ${className}`}
    >
      {({ isIndeterminate }) => (
        <>
          <span className="bbb-choice__indicator bbb-checkbox__box" aria-hidden="true">
            <Icon name={isIndeterminate ? 'minus' : 'check'} />
          </span>
          <span className={hideLabel ? 'bbb-visually-hidden' : 'bbb-checkbox__copy'}>
            <span>{label}</span>
            {description && (
              <Text slot="description" className="bbb-checkbox__description">
                {description}
              </Text>
            )}
          </span>
        </>
      )}
    </AriaCheckbox>
  )
}
