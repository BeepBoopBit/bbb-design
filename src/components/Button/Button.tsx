import { Button as AriaButton } from 'react-aria-components'
import type { ButtonProps as AriaButtonProps } from 'react-aria-components'
import type { AriaAttributes, ReactNode, Ref } from 'react'
import './Button.css'

export type ButtonProps = Omit<
  AriaButtonProps,
  'children' | 'className' | 'isDisabled' | 'render'
> &
  AriaAttributes & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    loading?: boolean
    disabled?: boolean
    iconOnly?: boolean
    className?: string
    children?: ReactNode
    ref?: Ref<HTMLButtonElement>
  }

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled,
  iconOnly = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      type={type}
      isDisabled={disabled || loading || undefined}
      // React Aria filters aria-busy; apply it to the native element explicitly.
      render={nativeProps => <button {...nativeProps} aria-busy={loading || props['aria-busy']} />}
      className={`bbb-button bbb-button--${variant} bbb-button--${size} ${iconOnly ? 'bbb-button--icon' : ''} ${className}`}
    >
      {loading && <span className="bbb-button__spinner" aria-hidden="true" />}
      {children}
    </AriaButton>
  )
}
