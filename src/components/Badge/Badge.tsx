import type { HTMLAttributes } from 'react'
import './Badge.css'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'accent' | 'success' | 'warning'
  dot?: boolean
}

export function Badge({
  tone = 'neutral',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span {...props} className={`bbb-badge bbb-badge--${tone} ${className}`}>
      {dot && <span className="bbb-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
