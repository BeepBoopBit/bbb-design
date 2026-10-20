import { useRef } from 'react'
import { Popover } from '../Popover/Popover'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Badge } from '../Badge/Badge'
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator'
import { useMessages } from '../LocaleProvider/locale'
import './NotificationCenter.css'
export type NotificationItem = { id: string; title: string; description?: string; time?: string; unread?: boolean }
export type NotificationCenterProps = {
  items: NotificationItem[]
  onRead: (id: string) => void
  onReadAll?: () => void
  onOpenItem?: (id: string) => void
  loading?: boolean
  error?: string
  onRetry?: () => void
  disabled?: boolean
  className?: string
}
export function NotificationCenter({ items, onRead, onReadAll, onOpenItem, loading, error, onRetry, disabled, className = '' }: NotificationCenterProps) {
  const { t } = useMessages()
  const contentRef = useRef<HTMLDivElement>(null)
  const unread = items.filter(item => item.unread).length
  return <Popover title={t('notifications')} className={className} trigger={
    <Button variant="ghost" disabled={disabled} aria-label={t('unreadNotifications', { count: unread })}>
      <Icon name="bell" />{!!unread && <Badge tone="accent">{unread}</Badge>}
    </Button>
  }><div ref={contentRef} tabIndex={-1} className="bbb-notification-center">
    {loading ? <LoadingIndicator /> : error ? <div role="alert"><p>{error}</p>{onRetry && <Button variant="secondary" onPress={() => { onRetry(); requestAnimationFrame(() => contentRef.current?.focus()) }}>{t('retry')}</Button>}</div> : <>
      <div className="bbb-notification-center__summary"><span role="status">{t('unreadCount', { count: unread })}</span>
        {onReadAll && <Button variant="ghost" size="sm" aria-disabled={!unread} onPress={() => { if (unread) onReadAll() }}>{t('markAllRead')}</Button>}</div>
      {items.length ? <ul className="bbb-notification-center__list">{items.map(item => <li key={item.id}>
        <div className="bbb-notification-center__heading"><strong>{item.title}</strong>{item.unread && <Badge dot>{t('unread')}</Badge>}</div>
        {item.description && <p>{item.description}</p>}{item.time && <small>{item.time}</small>}
        <div className="bbb-notification-center__actions">
          {onOpenItem && <Button variant="ghost" size="sm" onPress={() => { onRead(item.id); onOpenItem(item.id) }}>{t('openItem', { name: item.title })}</Button>}
          <Button variant="ghost" size="sm" aria-disabled={!item.unread} onPress={() => { if (item.unread) onRead(item.id) }} aria-label={t('markItemRead', { name: item.title })}>{item.unread ? t('markRead') : t('read')}</Button>
        </div>
      </li>)}</ul> : <p>{t('noNotifications')}</p>}
    </>}
  </div></Popover>
}
