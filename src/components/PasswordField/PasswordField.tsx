import { useId, useImperativeHandle, useRef, useState } from 'react'
import { TextField } from '../TextField/TextField'
import type { TextFieldProps } from '../TextField/TextField'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailingAction'> & {
  showLabel?: string
  hideLabelText?: string
}

export function PasswordField({ ref, id, showLabel, hideLabelText, ...props }: PasswordFieldProps) {
  const generatedId = useId()
  const input = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => input.current!)
  const [visible, setVisible] = useState(false)
  const { t } = useMessages()
  const inputId = id ?? generatedId
  return (
    <TextField
      {...props}
      ref={input}
      id={inputId}
      type={visible ? 'text' : 'password'}
      autoComplete={props.autoComplete ?? 'current-password'}
      autoCapitalize="none"
      spellCheck={false}
      trailingAction={
        <Button
          variant="ghost" size="sm" iconOnly disabled={props.disabled}
          aria-label={visible ? hideLabelText ?? t('hidePassword') : showLabel ?? t('showPassword')}
          aria-controls={inputId}
          onPress={() => {
            const start = input.current?.selectionStart ?? 0
            const end = input.current?.selectionEnd ?? start
            setVisible(value => !value)
            requestAnimationFrame(() => {
              input.current?.focus()
              input.current?.setSelectionRange(start, end)
            })
          }}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} />
        </Button>
      }
    />
  )
}
