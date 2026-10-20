import type { HTMLAttributes, ReactNode, Ref } from 'react'
import './PageHeader.css'

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> & {
  title: string
  description?: ReactNode
  eyebrow?: string
  breadcrumbs?: ReactNode
  actions?: ReactNode
  headingLevel?: 1 | 2 | 3 | 4
  titleId?: string
  titleRef?: Ref<HTMLHeadingElement>
}

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  actions,
  headingLevel = 1,
  titleId,
  titleRef,
  className = '',
  ...props
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4'
  return (
    <header {...props} className={`bbb-page-header ${className}`}>
      {breadcrumbs && <div className="bbb-page-header__breadcrumbs">{breadcrumbs}</div>}
      <div className="bbb-page-header__row">
        <div className="bbb-page-header__copy">
          {eyebrow && <p className="bbb-page-header__eyebrow">{eyebrow}</p>}
          <Heading ref={titleRef} id={titleId} tabIndex={-1}>
            {title}
          </Heading>
          {description && <div className="bbb-page-header__description">{description}</div>}
        </div>
        {actions && <div className="bbb-page-header__actions">{actions}</div>}
      </div>
    </header>
  )
}
