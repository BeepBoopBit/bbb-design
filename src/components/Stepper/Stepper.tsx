import { useMessages } from '../LocaleProvider/locale'
import { Icon } from '../Icon/Icon'
import './Stepper.css'
export type StepperProps = {
  label: string
  steps: string[]
  currentStep: number
  className?: string
}
/** Progress is informational; the surrounding form owns Back/Continue and validation. */
export function Stepper({ label, steps, currentStep, className = '' }: StepperProps) {
  const { t, formatNumber } = useMessages()
  return (
    <ol aria-label={label} className={`bbb-stepper ${className}`}>
      {steps.map((step, index) => (
        <li
          key={step}
          aria-current={index === currentStep ? 'step' : undefined}
          data-complete={index < currentStep || undefined}
        >
          <span className="bbb-stepper__marker" aria-hidden="true">
            {index < currentStep ? <Icon name="check" /> : formatNumber(index + 1)}
          </span>
          <span>
            {step}
            {index < currentStep && <span className="bbb-visually-hidden">{t('completeStep')}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}
