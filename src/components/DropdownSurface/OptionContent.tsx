import type { ReactNode } from 'react'
export type ChoiceOption = {
  id: string
  label: string
  description?: string
  leading?: ReactNode
  disabled?: boolean
}
/** textValue stays separate from rich option content for typeahead and naming. */
export function OptionContent({ option }: { option: ChoiceOption }) {
  return (
    <span className="bbb-option__content">
      {option.leading}
      <span>
        <span>{option.label}</span>
        {option.description && (
          <span className="bbb-option__description">{option.description}</span>
        )}
      </span>
    </span>
  )
}
