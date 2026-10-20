import { Icon } from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import './StatusIndicator.css'
export type StatusIndicatorProps = { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger'; icon?: IconName; live?: boolean; className?: string }
export function StatusIndicator({ label, tone = 'neutral', icon, live, className = '' }: StatusIndicatorProps) {
  return <span role={live ? 'status' : undefined} className={`bbb-status-indicator bbb-status-indicator--${tone} ${className}`}>
    {icon ? <Icon name={icon} /> : <span className="bbb-status-indicator__dot" aria-hidden="true" />}{label}
  </span>
}
