import { Button } from '../Button/Button'
import './FilterGroup.css'

export type FilterGroupProps<Value extends string> = {
  className?: string
  label: string
  value: Value
  options: { value: Value; label: string; count: number }[]
  onChange: (value: Value) => void
}

export function FilterGroup<Value extends string>({
  label,
  value,
  options,
  onChange,
  className = '',
}: FilterGroupProps<Value>) {
  return (
    <div className={`bbb-filters ${className}`} role="group" aria-label={label}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="sm"
          className="bbb-filters__option"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          <span className="bbb-filters__count">{option.count}</span>
        </Button>
      ))}
    </div>
  )
}
