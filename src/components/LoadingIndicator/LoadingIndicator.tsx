import { useMessages } from '../LocaleProvider/locale'
import '../Button/Button.css'
import './LoadingIndicator.css'
export type LoadingIndicatorProps = { label?: string; hideLabel?: boolean; className?: string }
export function LoadingIndicator({ label, hideLabel, className = '' }: LoadingIndicatorProps) {
  const { t } = useMessages()
  return <span role="status" className={`bbb-loading-indicator ${className}`}>
    <span className="bbb-button__spinner" aria-hidden="true" /><span className={hideLabel ? 'bbb-visually-hidden' : undefined}>{label ?? t('working')}</span>
  </span>
}
