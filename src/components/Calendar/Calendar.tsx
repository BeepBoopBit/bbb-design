import {
  Calendar as AriaCalendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
  Heading,
  RangeCalendar as AriaRangeCalendar,
} from 'react-aria-components'
import type {
  CalendarProps as AriaCalendarProps,
  RangeCalendarProps as AriaRangeCalendarProps,
  DateValue,
} from 'react-aria-components'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './Calendar.css'

export function CalendarContent() {
  return (
    <>
      <header className="bbb-calendar__header">
        <Button slot="previous" variant="ghost" size="sm" iconOnly>
          <Icon name="chevron-left" />
        </Button>
        <Heading />
        <Button slot="next" variant="ghost" size="sm" iconOnly>
          <Icon name="chevron-right" />
        </Button>
      </header>
      <CalendarGrid className="bbb-calendar__grid">
        <CalendarGridHeader>
          {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} className="bbb-calendar__day" />}
        </CalendarGridBody>
      </CalendarGrid>
    </>
  )
}
export type CalendarProps<T extends DateValue> = Omit<
  AriaCalendarProps<T>,
  'children' | 'className'
> & { className?: string }
export function Calendar<T extends DateValue>({ className = '', ...props }: CalendarProps<T>) {
  return (
    <AriaCalendar {...props} className={`bbb-calendar ${className}`}>
      <CalendarContent />
    </AriaCalendar>
  )
}
export type RangeCalendarProps<T extends DateValue> = Omit<
  AriaRangeCalendarProps<T>,
  'children' | 'className'
> & { className?: string }
export function RangeCalendar<T extends DateValue>({
  className = '',
  ...props
}: RangeCalendarProps<T>) {
  return (
    <AriaRangeCalendar {...props} className={`bbb-calendar bbb-calendar--range ${className}`}>
      <CalendarContent />
    </AriaRangeCalendar>
  )
}
