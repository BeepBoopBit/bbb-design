import { useRef } from 'react'
import {
  DatePicker as AriaDatePicker,
  DateRangePicker as AriaDateRangePicker,
  DateInput,
  DateSegment,
  Group,
  Label,
  Dialog,
  TimeField,
} from 'react-aria-components'
import type {
  DatePickerProps as AriaDatePickerProps,
  DateRangePickerProps as AriaDateRangePickerProps,
  TimeFieldProps,
  DateValue,
  TimeValue,
} from 'react-aria-components'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Calendar, RangeCalendar } from '../Calendar/Calendar'
import { DropdownSurface } from '../DropdownSurface/DropdownSurface'
import { FieldSurface } from '../FormField/FieldSurface'
import type { FieldVariant } from '../FormField/FieldSurface'
import { FieldFeedback } from '../FormField/FieldFeedback'
import '../FormField/FormField.css'
import './DatePicker.css'

type FieldOptions = {
  label: string
  hint?: string
  error?: string
  variant?: FieldVariant
  disabled?: boolean
  required?: boolean
  className?: string
}
export function SegmentedDateInput({ slot }: { slot?: string }) {
  return (
    <DateInput slot={slot} className="bbb-date-input">
      {(segment) => <DateSegment segment={segment} className="bbb-date-segment" />}
    </DateInput>
  )
}
export type DatePickerProps<T extends DateValue> = Omit<
  AriaDatePickerProps<T>,
  'children' | 'className' | 'isDisabled' | 'isRequired'
> &
  FieldOptions
export function DatePicker<T extends DateValue>({
  label,
  hint,
  error,
  variant,
  disabled,
  required,
  className = '',
  ...props
}: DatePickerProps<T>) {
  const surface = useRef<HTMLDivElement>(null)
  return (
    <AriaDatePicker
      {...props}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error || props.isInvalid}
      className={`bbb-field bbb-date-picker ${className}`}
    >
      <FieldSurface ref={surface} variant={variant} invalid={!!error} label={
        <Label className="bbb-field__label">{label}</Label>
      }>
        <Group className="bbb-field__control">
          <SegmentedDateInput />
          <Button variant="ghost" size="sm" iconOnly>
            <Icon name="calendar" />
          </Button>
        </Group>
      </FieldSurface>
      <FieldFeedback hint={hint} error={error} />
      <DropdownSurface triggerRef={surface}>
        <Dialog className="bbb-calendar-dialog">
          <Calendar />
        </Dialog>
      </DropdownSurface>
    </AriaDatePicker>
  )
}
export type DateRangePickerProps<T extends DateValue> = Omit<
  AriaDateRangePickerProps<T>,
  'children' | 'className' | 'isDisabled' | 'isRequired'
> &
  FieldOptions
export function DateRangePicker<T extends DateValue>({
  label,
  hint,
  error,
  variant,
  disabled,
  required,
  className = '',
  ...props
}: DateRangePickerProps<T>) {
  const surface = useRef<HTMLDivElement>(null)
  return (
    <AriaDateRangePicker
      {...props}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error || props.isInvalid}
      className={`bbb-field bbb-date-picker ${className}`}
    >
      <FieldSurface ref={surface} variant={variant} invalid={!!error} label={
        <Label className="bbb-field__label">{label}</Label>
      }>
        <Group className="bbb-field__control bbb-date-range">
          <div className="bbb-date-range__values">
            <SegmentedDateInput slot="start" />
            <span aria-hidden="true">–</span>
            <SegmentedDateInput slot="end" />
          </div>
          <Button variant="ghost" size="sm" iconOnly>
            <Icon name="calendar" />
          </Button>
        </Group>
      </FieldSurface>
      <FieldFeedback hint={hint} error={error} />
      <DropdownSurface triggerRef={surface}>
        <Dialog className="bbb-calendar-dialog">
          <RangeCalendar />
        </Dialog>
      </DropdownSurface>
    </AriaDateRangePicker>
  )
}
export type TimePickerProps<T extends TimeValue> = Omit<
  TimeFieldProps<T>,
  'children' | 'className' | 'isDisabled' | 'isRequired'
> &
  FieldOptions
export function TimePicker<T extends TimeValue>({
  label,
  hint,
  error,
  variant,
  disabled,
  required,
  className = '',
  ...props
}: TimePickerProps<T>) {
  return (
    <TimeField
      {...props}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error || props.isInvalid}
      className={`bbb-field bbb-date-picker ${className}`}
    >
      <FieldSurface variant={variant} invalid={!!error} label={
        <Label className="bbb-field__label">{label}</Label>
      }>
        <SegmentedDateInput />
      </FieldSurface>
      <FieldFeedback hint={hint} error={error} />
    </TimeField>
  )
}
