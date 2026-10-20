import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import type { ButtonProps } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'
export type CopyButtonProps = Omit<ButtonProps, 'onPress' | 'children' | 'loading'> & {
  text: string
  label?: string
  onCopy?: () => void
  onCopyError?: (error: unknown) => void
}
export function CopyButton(props: CopyButtonProps) {
  return <CopyAction key={props.text} {...props} />
}
function CopyAction({ text, label, onCopy, onCopyError, iconOnly, ...props }: CopyButtonProps) {
  const { t } = useMessages()
  const [state, setState] = useState<'idle' | 'pending' | 'copied' | 'error'>('idle')
  const lifetime = useRef({ active: true })
  useEffect(() => { const instance = lifetime.current; instance.active = true; return () => { instance.active = false } }, [])
  const title = state === 'copied' ? t('copied') : state === 'error' ? t('copyFailed') : label ?? t('copy')
  return <span className="bbb-copy-button">
    <Button variant="secondary" size="sm" {...props} iconOnly={iconOnly} aria-label={iconOnly ? title : props['aria-label']}
      aria-busy={state === 'pending'} aria-disabled={state === 'pending' || props['aria-disabled']} onPress={async () => {
        if (state === 'pending' || props['aria-disabled']) return
        setState('pending')
        try {
          await navigator.clipboard.writeText(text)
          if (lifetime.current.active) { setState('copied'); onCopy?.() }
        } catch (error) {
          if (lifetime.current.active) { setState('error'); onCopyError?.(error) }
        }
      }}>{state === 'pending' ? <span className="bbb-button__spinner" aria-hidden="true" /> : <Icon name={state === 'copied' ? 'check' : 'copy'} />}{!iconOnly && title}</Button>
    <span aria-live="polite" className="bbb-visually-hidden">{state === 'copied' || state === 'error' ? title : ''}</span>
  </span>
}
