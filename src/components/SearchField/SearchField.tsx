import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'
import { TextField } from '../TextField/TextField'
import type { TextFieldProps } from '../TextField/TextField'
import type { FieldVariant } from '../FormField/FieldSurface'
import './SearchField.css'

export type SearchFieldProps = Omit<TextFieldProps,
  'type' | 'hideLabel' | 'leadingIcon' | 'trailingAction' | 'value' | 'defaultValue' | 'onChange' | 'variant'
> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  variant?: Exclude<FieldVariant, 'filled'>
  clearLabel?: string
}

/** A compact search input; the consumer owns filtering, results, and submission. */
export function SearchField({
  value, defaultValue = '', onChange, variant = 'subtle', clearLabel,
  ref, className = '', onKeyDown, ...props
}: SearchFieldProps) {
  const [local, setLocal] = useState(defaultValue)
  const input = useRef<HTMLInputElement>(null)
  const { t } = useMessages()
  const query = value ?? local
  useImperativeHandle(ref, () => input.current!)
  useEffect(() => {
    const form = input.current?.form
    const reset = () => { if (value === undefined) setLocal(defaultValue) }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [defaultValue, value])

  function change(next: string) {
    if (value === undefined) setLocal(next)
    onChange?.(next)
  }

  return <TextField
    {...props} ref={input} type="search" hideLabel variant={variant}
    className={`bbb-search-field ${className}`} value={query}
    onChange={event => change(event.target.value)}
    onKeyDown={event => {
      onKeyDown?.(event)
      if (event.key === 'Escape' && query && !props.readOnly && !event.defaultPrevented
        && !event.nativeEvent.isComposing && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault()
        event.stopPropagation()
        change('')
      }
    }}
    leadingIcon={<Icon name="search" />}
    trailingAction={query && !props.readOnly ? <Button
      variant="ghost" size="sm" iconOnly disabled={props.disabled}
      aria-label={clearLabel ?? t('clearSearch')}
      onPress={() => { input.current?.focus(); change('') }}
    ><Icon name="x" /></Button> : undefined}
  />
}
