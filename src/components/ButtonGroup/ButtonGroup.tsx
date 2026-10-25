import type { ComponentPropsWithRef } from 'react'
import './ButtonGroup.css'
export { Button } from '../Button/Button'

export type ButtonGroupProps = Omit<ComponentPropsWithRef<'div'>, 'role'> & {
  label: string
  orientation?: 'horizontal' | 'vertical'
}

/** Related actions keep their normal Tab order; use Toolbar for arrow navigation. */
export function ButtonGroup({ label, orientation = 'horizontal', className = '', ...props }: ButtonGroupProps) {
  return <div {...props} role="group" aria-label={label} data-orientation={orientation} className={`bbb-button-group ${className}`} />
}
