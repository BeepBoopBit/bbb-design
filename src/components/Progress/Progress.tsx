import { useMessages } from '../LocaleProvider/locale'
import { useId } from 'react'
import type { CSSProperties } from 'react'
import './Progress.css'

export type ProgressProps = { label: string; value?: number; max?: number; className?: string }

export function Progress({ label, value, max = 100, className = '' }: ProgressProps) {
  const { t, locale } = useMessages()
  const id = useId()
  const maximum = Number.isFinite(max) && max > 0 ? max : 100
  const current =
    value === undefined || !Number.isFinite(value)
      ? undefined
      : Math.min(maximum, Math.max(0, value))
  const percent = current === undefined ? undefined : Math.round((current / maximum) * 100)
  return (
    <div className={`bbb-progress ${className}`}>
      <div className="bbb-progress__label">
        <span id={id}>{label}</span>
        <span aria-hidden="true">{percent === undefined ? t('working') : new Intl.NumberFormat(locale, { style: 'percent' }).format(percent / 100)}</span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={maximum}
        aria-valuenow={current}
        className="bbb-progress__track"
        data-indeterminate={current === undefined}
      >
        <span
          className="bbb-progress__fill"
          style={
            {
              '--bbb-progress-value': percent === undefined ? undefined : `${percent}%`,
            } as CSSProperties
          }
        />
      </div>
    </div>
  )
}
