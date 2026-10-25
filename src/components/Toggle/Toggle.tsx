import { ToggleButton } from 'react-aria-components'
import type { ToggleButtonProps } from 'react-aria-components'
import type { ReactNode, Ref } from 'react'
import '../Button/Button.css'
import './Toggle.css'

export type ToggleProps = Omit<ToggleButtonProps, 'children' | 'className' | 'isDisabled' | 'render'> & {
  children: ReactNode
  disabled?: boolean
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'secondary'
  iconOnly?: boolean
  className?: string
  ref?: Ref<HTMLButtonElement>
}

export function Toggle({ children, disabled, size = 'md', variant = 'ghost', iconOnly, className = '', ...props }: ToggleProps) {
  return <ToggleButton {...props} isDisabled={disabled} className={`bbb-button bbb-button--${variant} bbb-button--${size} bbb-toggle ${iconOnly ? 'bbb-button--icon' : ''} ${className}`}>
    {children}
  </ToggleButton>
}
