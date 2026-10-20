import type { HTMLAttributes, ReactNode } from 'react'
import { Icon } from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import './Alert.css'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'
const toneIcons: Record<AlertTone, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'triangle-alert',
  danger: 'triangle-alert',
}
export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: string
  tone?: AlertTone
  children?: ReactNode
}

export function Alert({
  title,
  tone = 'info',
  children,
  className = '',
  role = 'status',
  ...props
}: AlertProps) {
  return (
    <div {...props} role={role} className={`bbb-alert bbb-alert--${tone} ${className}`}>
      <Icon name={toneIcons[tone]} />
      <div>
        <p className="bbb-alert__title">{title}</p>
        {children && <div className="bbb-alert__description">{children}</div>}
      </div>
    </div>
  )
}
