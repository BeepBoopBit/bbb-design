import type { ComponentPropsWithRef } from 'react'
import './Separator.css'

export type SeparatorProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'role' | 'aria-orientation' | 'aria-hidden'> & {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

export function Separator({ orientation = 'horizontal', decorative = false, className = '', ...props }: SeparatorProps) {
  return <div {...props} className={`bbb-separator ${className}`} data-orientation={orientation}
    role={decorative ? 'none' : 'separator'} aria-hidden={decorative || undefined}
    aria-orientation={decorative ? undefined : orientation} />
}
