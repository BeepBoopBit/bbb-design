import { useId } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  as?: 'div' | 'section'
  title?: string
  description?: string
  action?: ReactNode
  footer?: ReactNode
  headingLevel?: 2 | 3 | 4
  variant?: 'default' | 'quiet'
}

export function Card({
  as: Root = 'div',
  title,
  description,
  action,
  footer,
  headingLevel = 3,
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) {
  const titleId = useId()
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  return (
    <Root
      aria-labelledby={Root === 'section' && title ? titleId : undefined}
      {...props}
      className={`bbb-card bbb-card--${variant} ${className}`}
    >
      {(title || description || action) && (
        <div className="bbb-card__header">
          <div className="bbb-card__heading">
            {title && <Heading id={titleId}>{title}</Heading>}
            {description && <p>{description}</p>}
          </div>
          {action && <div className="bbb-card__action">{action}</div>}
        </div>
      )}
      {children !== undefined && <div className="bbb-card__body">{children}</div>}
      {footer && <div className="bbb-card__footer">{footer}</div>}
    </Root>
  )
}
