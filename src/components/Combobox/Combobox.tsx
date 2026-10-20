import { useMessages } from '../LocaleProvider/locale'
import { OptionContent } from '../DropdownSurface/OptionContent'
import type { ChoiceOption } from '../DropdownSurface/OptionContent'
import type { ReactNode } from 'react'
import {
  ComboBox as AriaComboBox,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Text,
} from 'react-aria-components'
import type { ComboBoxProps as AriaComboBoxProps } from 'react-aria-components'
import { useRef } from 'react'
import { Button } from '../Button/Button'
import { DropdownSurface } from '../DropdownSurface/DropdownSurface'
import { Icon } from '../Icon/Icon'
import { FieldSurface } from '../FormField/FieldSurface'
import type { FieldVariant } from '../FormField/FieldSurface'
import '../FormField/FormField.css'
import '../TextField/TextField.css'
import './Combobox.css'

export type ComboboxOption = ChoiceOption
export type ComboboxProps = Omit<
  AriaComboBoxProps<ComboboxOption>,
  'children' | 'className' | 'items' | 'defaultItems' | 'isDisabled' | 'disabledKeys'
> & {
  label: string
  options: ComboboxOption[]
  placeholder?: string
  hint?: string
  error?: string
  variant?: FieldVariant
  disabled?: boolean
  loading?: boolean
  emptyMessage?: string
  renderOption?: (option: ComboboxOption) => ReactNode
  className?: string
}

export function Combobox({
  label,
  options,
  placeholder,
  hint,
  error,
  variant,
  disabled,
  loading,
  emptyMessage,
  renderOption,
  className = '',
  ...props
}: ComboboxProps) {
  const { t } = useMessages()
  const surfaceRef = useRef<HTMLDivElement>(null)
  return (
    <AriaComboBox
      {...props}
      defaultItems={options}
      disabledKeys={options.filter(option => option.disabled).map(option => option.id)}
      isDisabled={disabled}
      isInvalid={Boolean(error) || props.isInvalid}
      validationBehavior="aria"
      allowsEmptyCollection
      className={`bbb-field bbb-combobox ${className}`}
    >
      <FieldSurface ref={surfaceRef} variant={variant} invalid={Boolean(error)} label={
        <Label className="bbb-field__label">{label}</Label>
      }>
        <Group className="bbb-field__control" data-invalid={Boolean(error)}>
          <Input placeholder={placeholder ?? t('searchOptions')} />
          <Button variant="ghost" iconOnly aria-label={t('showOptions')}>
            <Icon name="chevron-down" />
          </Button>
        </Group>
      </FieldSurface>
      {(error || hint) && (
        <Text
          slot="description"
          className={`bbb-field__message ${error ? 'bbb-field__message--error' : ''}`}
        >
          {error || hint}
        </Text>
      )}
      <DropdownSurface triggerRef={surfaceRef} className="bbb-combobox__popover">
        <ListBox<ComboboxOption>
          className="bbb-option-list"
          aria-busy={loading}
          renderEmptyState={() => (
            <span className="bbb-option-list__empty">
              {loading ? t('loadingOptions') : emptyMessage ?? t('noMatchingOptions')}
            </span>
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
    </AriaComboBox>
  )
}
