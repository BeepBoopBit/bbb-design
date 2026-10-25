import { ToggleButtonGroup } from 'react-aria-components'
import type { ToggleButtonGroupProps } from 'react-aria-components'
import type { ReactNode, Ref } from 'react'
import './ToggleGroup.css'
export { Toggle } from '../Toggle/Toggle'

export type ToggleGroupProps = Omit<ToggleButtonGroupProps, 'children' | 'className' | 'isDisabled'> & {
  label: string
  children: ReactNode
  disabled?: boolean
  className?: string
  ref?: Ref<HTMLDivElement>
}

export function ToggleGroup({ label, children, disabled, selectionMode = 'multiple', className = '', ...props }: ToggleGroupProps) {
  return <ToggleButtonGroup {...props} aria-label={label} selectionMode={selectionMode} isDisabled={disabled} className={`bbb-toggle-group ${className}`}>
    {children}
  </ToggleButtonGroup>
}
