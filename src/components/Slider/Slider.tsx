import { useMessages } from '../LocaleProvider/locale'
import {
  Slider as AriaSlider,
  SliderTrack,
  SliderThumb,
  SliderOutput,
  SliderFill,
  Label,
} from 'react-aria-components'
import type { SliderProps as AriaSliderProps } from 'react-aria-components'
import { useId } from 'react'
import './Slider.css'
export type SliderProps<T extends number | number[] = number> = Omit<
  AriaSliderProps<T>,
  'children' | 'className' | 'isDisabled' | 'orientation'
> & {
  label: string
  hint?: string
  disabled?: boolean
  className?: string
  thumbLabels?: string[]
  names?: string[]
  keyboardStep?: number
}
export function Slider<T extends number | number[]>({
  label,
  hint,
  disabled,
  className = '',
  thumbLabels,
  names,
  keyboardStep,
  ...props
}: SliderProps<T>) {
  const { t, direction } = useMessages()
  const hintId = useId()
  return (
    <AriaSlider
      {...props}
      isDisabled={disabled}
      aria-describedby={hint ? hintId : props['aria-describedby']}
      className={`bbb-slider ${className}`}
    >
      <div className="bbb-slider__heading">
        <Label>{label}</Label>
        <SliderOutput>
          {({ state }) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
        </SliderOutput>
      </div>
      <SliderTrack className="bbb-slider__track">
        {({ state }) => (
          <>
            <SliderFill
              className="bbb-slider__fill"
              // Override React Aria's full-height fill while preserving its value-based width.
              style={{ height: 'var(--bbb-slider-track-height)' }}
            />
            {state.values.map((_, index) => (
              <div
                key={index}
                // Capture before the native thumb handler applies the pointer precision.
                onKeyDownCapture={event => {
                  if (disabled || keyboardStep === undefined || event.altKey || event.ctrlKey || event.metaKey) return
                  const increase = event.key === 'ArrowUp' || event.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
                  const decrease = event.key === 'ArrowDown' || event.key === (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft')
                  if (!increase && !decrease) return
                  event.preventDefault()
                  event.stopPropagation()
                  state.setThumbDragging(index, true)
                  const amount = event.shiftKey ? Math.max(state.pageSize, keyboardStep) : keyboardStep
                  state.setThumbValue(index, state.values[index] + (increase ? amount : -amount))
                  state.setThumbDragging(index, false)
                }}
              >
                <SliderThumb
                  index={index}
                  name={names?.[index]}
                  aria-label={
                    thumbLabels?.[index] ??
                    (state.values.length > 1 ? (t(index === 0 ? 'minimum' : 'maximum')) : undefined)
                  }
                  className="bbb-slider__thumb"
                />
              </div>
            ))}
          </>
        )}
      </SliderTrack>
      {hint && (
        <p id={hintId} className="bbb-field__message">
          {hint}
        </p>
      )}
    </AriaSlider>
  )
}
export type RangeSliderProps = Omit<SliderProps<number[]>, 'thumbLabels'> & {
  thumbLabels?: [string, string]
}
export function RangeSlider({ defaultValue = [25, 75], ...props }: RangeSliderProps) {
  return <Slider<number[]> defaultValue={defaultValue} {...props} />
}
