import { useMessages } from '../LocaleProvider/locale'
import { OptionContent } from '../DropdownSurface/OptionContent'
import type { ChoiceOption } from '../DropdownSurface/OptionContent'
import type { ReactNode } from 'react'
import {
  Label,
  ListBox,
  ListBoxItem,
  Select as AriaSelect,
  SelectValue,
  Text,
} from 'react-aria-components'
import type { SelectProps as AriaSelectProps } from 'react-aria-components'
import type { Ref } from 'react'
import { useRef } from 'react'
import { Button } from '../Button/Button'
import { DropdownSurface } from '../DropdownSurface/DropdownSurface'
import type { FieldProps } from '../FormField/FormField'
import { FieldSurface } from '../FormField/FieldSurface'
import { Icon } from '../Icon/Icon'
import '../FormField/FormField.css'
import './Select.css'

export type SelectOption = ChoiceOption
export type SelectProps = Omit<
  AriaSelectProps<SelectOption>,
  | 'children'
  | 'className'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange'
  | 'isDisabled'
  | 'isRequired'
  | 'disabledKeys'
  | 'selectionMode'
> &
  FieldProps & {
    options: SelectOption[]
    value?: string | null
    defaultValue?: string
    onChange?: (value: string) => void
    disabled?: boolean
    required?: boolean
    renderOption?: (option: SelectOption) => ReactNode
    className?: string
    ref?: Ref<HTMLButtonElement>
  }

export function Select({
  label,
  hideLabel,
  options,
  value,
  defaultValue,
  onChange,
  disabled,
  required,
  hint,
  error,
  variant,
  ref,
  renderOption,
  className = '',
  ...props
}: SelectProps) {
  const { t } = useMessages()
  const surfaceRef = useRef<HTMLDivElement>(null)
  return (
    <AriaSelect
      {...props}
      selectedKey={value}
      defaultSelectedKey={defaultValue}
      onSelectionChange={key => {
        if (key !== null) onChange?.(String(key))
      }}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={Boolean(error) || props.isInvalid}
      disabledKeys={options.filter(option => option.disabled).map(option => option.id)}
      className={`bbb-field bbb-select ${className}`}
    >
      <FieldSurface ref={surfaceRef} variant={variant} invalid={Boolean(error)} label={
        <Label className={hideLabel ? 'bbb-visually-hidden' : 'bbb-field__label'}>{label}</Label>
      }>
        <Button ref={ref} variant="secondary" className="bbb-input bbb-select__trigger">
          <SelectValue className="bbb-select__value">{({ selectedText, isPlaceholder }) => isPlaceholder ? props.placeholder ?? t('selectOption') : selectedText}</SelectValue>
          <Icon name="chevron-down" />
        </Button>
      </FieldSurface>
      {(error || hint) && (
        <Text
          slot="description"
          className={`bbb-field__message ${error ? 'bbb-field__message--error' : ''}`}
        >
          {error || hint}
        </Text>
      )}
      <DropdownSurface triggerRef={surfaceRef} className="bbb-select__popover">
        <ListBox
          items={options}
          className="bbb-option-list"
          renderEmptyState={() => (
            <span className="bbb-option-list__empty">{t('noOptions')}</span>
          )}
        >
          {option => (
            <ListBoxItem id={option.id} textValue={option.label} className="bbb-option">
              {({ isSelected }) => (
                <>
                  <span>{renderOption ? renderOption(option) : <OptionContent option={option} />}</span>
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
