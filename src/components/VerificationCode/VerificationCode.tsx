import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { TextField } from '../TextField/TextField'
import type { TextFieldProps } from '../TextField/TextField'
import './VerificationCode.css'

export type VerificationCodeProps = Omit<TextFieldProps, 'value' | 'defaultValue' | 'onChange' | 'type' | 'maxLength' | 'minLength' | 'pattern'> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  length?: number
}

function digits(value: string, length: number) {
  return value.replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) - (digit <= '٩' ? 0x660 : 0x6f0)))
    .replace(/[^0-9]/g, '').slice(0, length)
}

/** One native input preserves paste, autofill, selection, and screen-reader navigation. */
export function VerificationCode({
  value, defaultValue = '', onChange, length = 6, ref, className = '', ...props
}: VerificationCodeProps) {
  const size = Number.isFinite(length) ? Math.max(1, Math.floor(length)) : 6
  const [local, setLocal] = useState(() => digits(defaultValue, size))
  const [composition, setComposition] = useState<string | null>(null)
  const composing = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => input.current!)
  useEffect(() => {
    const form = input.current?.form
    const reset = () => { if (value === undefined) setLocal(digits(defaultValue, size)) }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [defaultValue, size, value])
  function change(next: string) {
    const normalized = digits(next, size)
    if (value === undefined) setLocal(normalized)
    onChange?.(normalized)
  }
  return (
    <TextField
      {...props} ref={input} className={`bbb-verification-code ${className}`}
      type="text" inputMode="numeric" autoComplete="one-time-code" dir="ltr"
      spellCheck={false} autoCapitalize="none" minLength={size} pattern={`[0-9]{${size}}`}
      value={composition ?? digits(value ?? local, size)}
      onChange={event => {
        if (composing.current) setComposition(event.target.value)
        else change(event.target.value)
      }}
      onCompositionStart={event => {
        composing.current = true
        setComposition(event.currentTarget.value)
        props.onCompositionStart?.(event)
      }}
      onCompositionEnd={event => {
        composing.current = false
        setComposition(null)
        change(event.currentTarget.value)
        props.onCompositionEnd?.(event)
      }}
    />
  )
}
