import type { ComponentPropsWithRef } from 'react'
import { Icon } from '../Icon/Icon'
import './Link.css'

export type LinkProps = ComponentPropsWithRef<'a'> & {
  external?: boolean
  variant?: 'default' | 'quiet'
}

export function Link({
  external = false,
  variant = 'default',
  target,
  rel,
  children,
  className = '',
  ...props
}: LinkProps) {
  const resolvedTarget = external ? '_blank' : target
  const newTab = resolvedTarget === '_blank'
  const relationship = newTab
    ? [...new Set(`${rel ?? ''} noopener noreferrer`.trim().split(/\s+/))].join(' ')
    : rel
  return (
    <a
      {...props}
      target={resolvedTarget}
      rel={relationship}
      className={`bbb-link bbb-link--${variant} ${className}`}
    >
      {children}
      {newTab && (
        <>
          <Icon name="external-link" />
          <span className="bbb-visually-hidden"> (opens in a new tab)</span>
        </>
      )}
    </a>
  )
}
