import { useEffect, useState } from 'react'
import { CalendarDate, Time } from '@internationalized/date'
import { Calendar } from '../../../components/Calendar/Calendar'
import { DatePicker, DateRangePicker, TimePicker } from '../../../components/DatePicker/DatePicker'
import { NumberField } from '../../../components/NumberField/NumberField'
import { MultiSelect } from '../../../components/MultiSelect/MultiSelect'
import { TagField } from '../../../components/TagField/TagField'
import { FileUpload } from '../../../components/FileUpload/FileUpload'
import type { UploadFile } from '../../../components/FileUpload/FileUpload'
import { Slider, RangeSlider } from '../../../components/Slider/Slider'
import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl'
import { Stepper } from '../../../components/Stepper/Stepper'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { Select } from '../../../components/Select/Select'
import { Button } from '../../../components/Button/Button'
import { Icon } from '../../../components/Icon/Icon'
import './Previews.css'
function FieldState({
  name,
  value,
  onChange,
}: {
  name: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Select
      label={`${name} example state`}
      value={value}
      onChange={onChange}
      options={[
        { id: 'default', label: 'Default' },
        { id: 'error', label: 'Error' },
        { id: 'disabled', label: 'Disabled' },
      ]}
    />
  )
}
export function CalendarPreview() {
  const [date, setDate] = useState(new CalendarDate(2026, 9, 22))
  return (
    <div className="preview-stack">
      <Calendar aria-label="Choose a day" value={date} onChange={setDate} />
      <p className="preview-note" role="status">
        Selected {date.toString()}.
      </p>
    </div>
  )
}
export function DatePickerPreview() {
  const [date, setDate] = useState<CalendarDate | null>(null)
  const [state, setState] = useState('default')
  return (
    <div className="field-preview">
      <DatePicker
        label="Due date"
        value={date}
        onChange={setDate}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Choose a date before continuing.' : undefined}
        hint="Type each part, or open the calendar."
      />
      <FieldState name="Date picker" value={state} onChange={setState} />
      <p className="preview-note" role="status">
        {date ? `Due ${date.toString()}.` : 'No date selected.'}
      </p>
    </div>
  )
}
export function DateRangePickerPreview() {
  const [range, setRange] = useState<{ start: CalendarDate; end: CalendarDate } | null>(null)
  const [state, setState] = useState('default')
  return (
    <div className="field-preview">
      <DateRangePicker
        label="Travel dates"
        value={range}
        onChange={setRange}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Choose both a start and an end date.' : undefined}
        hint="Select the first and last day of your trip."
      />
      <FieldState name="Date range" value={state} onChange={setState} />
      <p className="preview-note" role="status">
        {range ? `${range.start.toString()} to ${range.end.toString()}.` : 'No range selected.'}
      </p>
    </div>
  )
}
export function TimePickerPreview() {
  const [time, setTime] = useState<Time | null>(new Time(9, 30))
  const [state, setState] = useState('default')
  return (
    <div className="field-preview">
      <TimePicker
        label="Start time"
        value={time}
        onChange={setTime}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Choose an available time.' : undefined}
        hint="Use the arrow keys to adjust each segment."
      />
      <FieldState name="Time picker" value={state} onChange={setState} />
      <p className="preview-note" role="status">
        {time ? `Starts at ${time.toString()}.` : 'No time selected.'}
      </p>
    </div>
  )
}
export function NumberFieldPreview() {
  const [number, setNumber] = useState(3)
  const [state, setState] = useState('default')
  return (
    <div className="field-preview">
      <NumberField
        label="Seats"
        minValue={1}
        maxValue={10}
        value={number}
        onChange={setNumber}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Choose the number of seats you need.' : undefined}
        hint="Between 1 and 10 seats."
      />
      <NumberField
        label="Monthly budget"
        defaultValue={250}
        minValue={0}
        step={25}
        formatOptions={{ style: 'currency', currency: 'USD' }}
      />
      <FieldState name="Number field" value={state} onChange={setState} />
    </div>
  )
}
export function MultiSelectPreview() {
  const [values, setValues] = useState(['design'])
  const [state, setState] = useState('default')
  return (
    <div className="field-preview">
      <MultiSelect
        label="Project disciplines"
        value={values}
        onChange={setValues}
        options={[
          {
            id: 'design',
            label: 'Design',
            description: 'Shape the experience',
            leading: <Icon name="layers" />,
          },
          {
            id: 'engineering',
            label: 'Engineering',
            description: 'Build with care',
            leading: <Icon name="box" />,
          },
          { id: 'research', label: 'Research' },
          { id: 'operations', label: 'Operations · unavailable', disabled: true },
        ]}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Choose at least one discipline.' : undefined}
        hint="Space toggles an option; Escape closes the list."
      />
      <FieldState name="Multi-select" value={state} onChange={setState} />
      <p className="preview-note" role="status">
        {values.length} disciplines selected.
      </p>
    </div>
  )
}
export function TagFieldPreview() {
  const [tags, setTags] = useState(['Craft', 'Clarity'])
  const [state, setState] = useState('default')
  return (
    <div className="field-preview">
      <TagField
        label="Keywords"
        name="keywords"
        value={tags}
        onChange={setTags}
        maxTags={5}
        disabled={state === 'disabled'}
        error={state === 'error' ? 'Add a keyword to describe your work.' : undefined}
        hint="Up to 5 tags. Enter or comma adds; duplicates are ignored."
      />
      <FieldState name="Tag entry" value={state} onChange={setState} />
    </div>
  )
}
export function FileUploadPreview() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [fail, setFail] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const uploading = files.some((file) => file.status === 'uploading')
  useEffect(() => {
    if (!uploading) return
    const timer = setInterval(
      () =>
        setFiles((previous) =>
          previous.map((item) => {
            if (item.status !== 'uploading') return item
            const progress = Math.min(100, (item.progress ?? 0) + 25)
            return progress < 100
              ? { ...item, progress }
              : {
                  ...item,
                  progress,
                  status: fail ? 'error' : 'complete',
                  error: fail
                    ? 'The preview upload failed. Turn off simulated failure and retry.'
                    : undefined,
                }
          }),
        ),
      400,
    )
    return () => clearInterval(timer)
  }, [uploading, fail])
  return (
    <div className="field-preview">
      <FileUpload
        label="Attachments"
        files={files}
        disabled={disabled}
        accept="image/*,.pdf"
        maxSize={5_000_000}
        hint="Images or PDFs up to 5 MB. Files stay on your device; progress is simulated."
        onAdd={(incoming) =>
          setFiles((previous) => [
            ...previous,
            ...incoming.map((file) => ({
              id: crypto.randomUUID(),
              file,
              status: 'uploading' as const,
              progress: 0,
            })),
          ])
        }
        onRemove={(id) => setFiles((previous) => previous.filter((file) => file.id !== id))}
        onRetry={(id) =>
          setFiles((previous) =>
            previous.map((file) =>
              file.id === id
                ? { ...file, status: 'uploading', progress: 0, error: undefined }
                : file,
            ),
          )
        }
      />
      <Checkbox label="Simulate upload failure" isSelected={fail} onChange={setFail} />
      <Checkbox label="Disable attachments" isSelected={disabled} onChange={setDisabled} />
    </div>
  )
}
export function SliderPreview() {
  const [value, setValue] = useState(60)
  return (
    <div className="field-preview">
      <Slider
        formatOptions={{ maximumFractionDigits: 0 }}
        label="Volume"
        value={value}
        onChange={setValue}
        minValue={0}
        maxValue={100}
        step={0.01}
        keyboardStep={5}
        hint="Arrow keys adjust by 5; Home and End reach the limits."
      />
      <Slider label="Managed volume" value={35} disabled />
    </div>
  )
}
export function RangeSliderPreview() {
  const [range, setRange] = useState([20, 80])
  return (
    <div className="field-preview">
      <RangeSlider
        label="Price range"
        value={range}
        onChange={setRange}
        minValue={0}
        maxValue={100}
        step={0.01}
        keyboardStep={5}
        formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        thumbLabels={['Minimum price', 'Maximum price']}
        hint="Each handle has its own keyboard focus. Handles do not cross."
      />
    </div>
  )
}
export function SegmentedControlPreview() {
  const [view, setView] = useState('week')
  return (
    <div className="field-preview">
      <SegmentedControl
        label="Schedule view"
        value={view}
        onChange={setView}
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year', disabled: true },
        ]}
      />
      <p className="preview-note" role="status">
        Showing the {view} view.
      </p>
    </div>
  )
}
export function StepperPreview() {
  const [step, setStep] = useState(0)
  return (
    <div className="preview-stack">
      <Stepper
        label="Example progress"
        steps={['Details', 'Preferences', 'Review']}
        currentStep={step}
      />
      <div className="preview-row">
        <Button
          variant="secondary"
          size="sm"
          disabled={step === 0}
          onPress={() => setStep(step - 1)}
        >
          Previous step
        </Button>
        <Button size="sm" disabled={step === 3} onPress={() => setStep(step + 1)}>
          Next step
        </Button>
      </div>
      <p className="preview-note" role="status">
        {step === 3 ? 'All steps complete.' : `Step ${step + 1} of 3.`}
      </p>
    </div>
  )
}
