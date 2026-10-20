import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './ListRow.css'

export type ListRowProps = {
  label: string
  description?: string
  leading?: ReactNode
  className?: string
} & (
  | { onAction: () => void; disabled?: boolean; href?: never; trailing?: never }
  | { href: string; onAction?: never; disabled?: never; trailing?: never }
  | { trailing?: ReactNode; onAction?: never; href?: never; disabled?: never }
)

export function ListRow({
  label,
  description,
  leading,
  trailing,
  onAction,
  href,
  disabled,
  className = '',
}: ListRowProps) {
  const interactive = Boolean(onAction || href)
  const content = (
    <>
      <span className="bbb-list-row__main">
        {leading && <span className="bbb-list-row__leading">{leading}</span>}
        <span className="bbb-list-row__copy">
          <span className="bbb-list-row__label">{label}</span>
          {description && <span className="bbb-list-row__description">{description}</span>}
        </span>
      </span>
      {interactive ? (
        <Icon name="chevron-right" />
      ) : (
        trailing && <span className="bbb-list-row__trailing">{trailing}</span>
      )}
    </>
  )
  const classes = `bbb-list-row ${interactive ? 'bbb-list-row--interactive' : ''} ${className}`
  if (onAction)
    return (
      <Button variant="ghost" className={classes} disabled={disabled} onPress={onAction}>
        {content}
      </Button>
    )
  if (href)
    return (
      <a className={classes} href={href}>
        {content}
      </a>
    )
  return <div className={classes}>{content}</div>
}
