import type { HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import './EmptyState.css'

export type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> & {
  title: string
  description: string
  icon?: IconName
  action?: ReactNode
  tone?: 'neutral' | 'error'
  headingLevel?: 2 | 3 | 4
}

export function EmptyState({
  title,
  description,
  icon = 'box',
  action,
  tone = 'neutral',
  headingLevel = 3,
  className = '',
  ...props
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  return (
    <div {...props} className={`bbb-empty-state bbb-empty-state--${tone} ${className}`}>
      <span className="bbb-empty-state__icon">
        <Icon name={icon} />
      </span>
      <div className="bbb-empty-state__copy">
        <Heading>{title}</Heading>
        <p>{description}</p>
      </div>
      {action && <div className="bbb-empty-state__action">{action}</div>}
    </div>
  )
}
