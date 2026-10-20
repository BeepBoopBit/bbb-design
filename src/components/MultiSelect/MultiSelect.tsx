import { useMessages } from '../LocaleProvider/locale'
import {
  Select as AriaSelect,
  SelectValue,
  Label,
  ListBox,
  ListBoxItem,
} from 'react-aria-components'
import type { SelectProps as AriaSelectProps } from 'react-aria-components'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { DropdownSurface } from '../DropdownSurface/DropdownSurface'
import { OptionContent } from '../DropdownSurface/OptionContent'
import type { ChoiceOption } from '../DropdownSurface/OptionContent'
import { FieldSurface } from '../FormField/FieldSurface'
import type { FieldVariant } from '../FormField/FieldSurface'
import { FieldFeedback } from '../FormField/FieldFeedback'
import '../FormField/FormField.css'
import '../Select/Select.css'
export type MultiSelectProps = Omit<
  AriaSelectProps<ChoiceOption, 'multiple'>,
  | 'children'
  | 'className'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'selectionMode'
  | 'isDisabled'
  | 'isRequired'
  | 'disabledKeys'
> & {
  label: string
  options: ChoiceOption[]
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[]) => void
  hint?: string
  error?: string
  variant?: FieldVariant
  disabled?: boolean
  required?: boolean
  className?: string
  renderOption?: (option: ChoiceOption) => ReactNode
}
export function MultiSelect({
  label,
  options,
  value,
  defaultValue,
  onChange,
  hint,
  error,
  variant,
  disabled,
  required,
  className = '',
  renderOption,
  ...props
}: MultiSelectProps) {
  const { t } = useMessages()
  const surface = useRef<HTMLDivElement>(null)
  return (
    <AriaSelect
      {...props}
      selectionMode="multiple"
      value={value}
      defaultValue={defaultValue}
      onChange={(keys) => onChange?.(keys.map(String))}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={!!error || props.isInvalid}
      disabledKeys={options.filter((o) => o.disabled).map((o) => o.id)}
      className={`bbb-field bbb-select ${className}`}
    >
      <FieldSurface ref={surface} variant={variant} invalid={!!error} label={
        <Label className="bbb-field__label">{label}</Label>
      }>
        <Button variant="secondary" className="bbb-input bbb-select__trigger">
          <SelectValue className="bbb-select__value">
            {({ selectedText, isPlaceholder }) =>
              isPlaceholder ? (props.placeholder ?? t('selectOption')) : selectedText
            }
          </SelectValue>
          <Icon name="chevron-down" />
        </Button>
      </FieldSurface>
      <FieldFeedback hint={hint} error={error} />
      <DropdownSurface triggerRef={surface} className="bbb-select__popover">
        <ListBox
          items={options}
          className="bbb-option-list"
          renderEmptyState={() => (
            <span className="bbb-option-list__empty">{t('noOptions')}</span>
          )}
        >
          {(option) => (
            <ListBoxItem id={option.id} textValue={option.label} className="bbb-option">
              {({ isSelected }) => (
                <>
                  {renderOption ? renderOption(option) : <OptionContent option={option} />}
                  {isSelected && <Icon name="check" />}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </DropdownSurface>
    </AriaSelect>
  )
}
