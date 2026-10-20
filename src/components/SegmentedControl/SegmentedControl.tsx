import { Radio, RadioGroup } from 'react-aria-components'
import type { ReactNode } from 'react'
import '../Button/Button.css'
import '../FilterGroup/FilterGroup.css'
import './SegmentedControl.css'
export type SegmentedControlProps = {
  label: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  options: { value: string; label: string; icon?: ReactNode; disabled?: boolean }[]
}
export function SegmentedControl({
  label,
  value,
  defaultValue,
  onChange,
  disabled,
  className = '',
  options,
}: SegmentedControlProps) {
  return (
    <RadioGroup
      aria-label={label}
      orientation="horizontal"
      isDisabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      className={`bbb-filters bbb-segmented ${className}`}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          isDisabled={option.disabled}
          className="bbb-button bbb-button--ghost bbb-button--sm bbb-filters__option"
        >
          {option.icon}
          <span className="bbb-segmented__label">{option.label}</span>
        </Radio>
      ))}
    </RadioGroup>
  )
}
