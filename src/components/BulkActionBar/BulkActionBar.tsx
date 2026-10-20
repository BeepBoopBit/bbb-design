import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { useMessages } from '../LocaleProvider/locale'
import './BulkActionBar.css'
export type BulkActionBarProps = { count: number; scope: string; onClear: () => void; children: ReactNode; className?: string }
/** Keep mounted while selection changes; the consumer restores row focus after bulk removal. */
export function BulkActionBar({ count, scope, onClear, children, className = '' }: BulkActionBarProps) {
  const { t } = useMessages()
  return <div className={`bbb-bulk-action-bar ${className}`} role="group" aria-label={t('bulkActions')}>
    <span role="status">{t('selectedCount', { count })} · {scope}</span>
    <div className="bbb-bulk-action-bar__actions">{children}<Button variant="ghost" size="sm" aria-disabled={!count} onPress={() => { if (count) onClear() }}>{t('clearSelection')}</Button></div>
  </div>
}
