import type { ReactNode, Ref } from 'react'

export type FieldVariant = 'filled' | 'outlined' | 'subtle' | 'plain'
export type FieldSurfaceProps = {
  children: ReactNode
  label?: ReactNode
  variant?: FieldVariant
  invalid?: boolean
  ref?: Ref<HTMLDivElement>
}

/** Places persistent labels inside filled fields and above simpler controls. */
export function FieldSurface({ children, label, variant = 'filled', invalid, ref }: FieldSurfaceProps) {
  return (
    <>
      {variant !== 'filled' && label}
      <div
        className="bbb-field__surface"
        data-variant={variant}
        ref={ref}
        data-invalid={invalid || undefined}
        onClick={event => {
          if (
            event.target instanceof Element &&
            event.target.closest('input, textarea, select, button, a, label, [contenteditable]')
          )
            return
          const control = event.currentTarget.querySelector<HTMLElement>(
            'input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [role="spinbutton"][contenteditable="true"]:not([aria-disabled="true"])',
          )
          control?.focus()
        }}
      >
        {variant === 'filled' && label}
        {children}
      </div>
    </>
  )
}
