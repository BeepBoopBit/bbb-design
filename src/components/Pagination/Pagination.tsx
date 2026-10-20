import { useMessages } from '../LocaleProvider/locale'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './Pagination.css'

export type PaginationProps = {
  className?: string
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  label?: string
  disabled?: boolean
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  label,
  disabled = false,
  className = '',
}: PaginationProps) {
  const { t, formatNumber } = useMessages()
  const total = Number.isFinite(totalItems) ? Math.max(0, Math.floor(totalItems)) : 0
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1
  const count = Math.max(1, Math.ceil(total / size))
  const current = Number.isFinite(page) ? Math.min(count, Math.max(1, Math.floor(page))) : 1
  const pages = [
    ...new Set([
      1,
      count,
      current - 1,
      current,
      current + 1,
      ...(current <= 2 ? [2, 3] : []),
      ...(current >= count - 1 ? [count - 2, count - 1] : []),
    ]),
  ]
    .filter(value => value >= 1 && value <= count)
    .sort((a, b) => a - b)
  return (
    <nav className={`bbb-pagination ${className}`} aria-label={label ?? t('pagination')}>
      <p className="bbb-pagination__summary" aria-live="polite">
        {total
          ? t('itemRange', { start: (current - 1) * size + 1, end: Math.min(current * size, total), count: total, unit: t(total === 1 ? 'item' : 'items') })
          : t('noItems')}
      </p>
      <div className="bbb-pagination__controls">
        <Button
          variant="ghost"
          iconOnly
          aria-label={t('previousPage')}
          disabled={disabled || current === 1 || !total}
          onPress={() => onPageChange(current - 1)}
        >
          <Icon name="chevron-left" />
        </Button>
        <div className="bbb-pagination__pages">
          {pages.map((value, index) => (
            <span className="bbb-pagination__page" key={value}>
              {index > 0 && value - pages[index - 1] > 1 && (
                <span className="bbb-pagination__ellipsis" aria-hidden="true">
                  …
                </span>
              )}
              <Button
                variant="ghost"
                className="bbb-pagination__number"
                aria-label={t('page', { page: value })}
                aria-current={value === current ? 'page' : undefined}
                disabled={disabled || !total}
                onPress={() => onPageChange(value)}
              >
                {formatNumber(value)}
              </Button>
            </span>
          ))}
        </div>
        <span className="bbb-pagination__compact">
          {t('pageOf', { page: current, count })}
        </span>
        <Button
          variant="ghost"
          iconOnly
          aria-label={t('nextPage')}
          disabled={disabled || current === count || !total}
          onPress={() => onPageChange(current + 1)}
        >
          <Icon name="chevron-right" />
        </Button>
      </div>
    </nav>
  )
}
