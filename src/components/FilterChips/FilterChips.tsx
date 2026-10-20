import { useMessages } from '../LocaleProvider/locale'
import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './FilterChips.css'

type FilterChip = { id: string; label: string; disabled?: boolean }
export type FilterChipsProps = {
  className?: string
  label: string
  items: FilterChip[]
  onRemove: (id: string) => void
  onClear?: (removableIds: string[]) => void
  emptyFocusRef: RefObject<HTMLElement | null>
  disabled?: boolean
}

export function FilterChips({
  label,
  items,
  onRemove,
  onClear,
  emptyFocusRef,
  disabled = false,
  className = '',
}: FilterChipsProps) {
  const { t } = useMessages()
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = useRef<{ id?: string } | null>(null)
  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const target = pendingFocus.current.id
      ? buttons.current.get(pendingFocus.current.id)
      : undefined
    ;(target ?? emptyFocusRef.current)?.focus()
    pendingFocus.current = null
  })
  if (!items.length) return null
  return (
    <div className={`bbb-filter-chips ${className}`} role="group" aria-label={label}>
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            <Button
              ref={node => {
                if (node) buttons.current.set(item.id, node)
                else buttons.current.delete(item.id)
              }}
              variant="ghost"
              className="bbb-filter-chip"
              disabled={disabled || item.disabled}
              aria-label={t('remove', { name: item.label })}
              onPress={() => {
                const next =
                  items.slice(index + 1).find(option => !option.disabled) ??
                  items
                    .slice(0, index)
                    .reverse()
                    .find(option => !option.disabled)
                pendingFocus.current = { id: next?.id }
                onRemove(item.id)
              }}
            >
              <span>{item.label}</span>
              <Icon name="x" />
            </Button>
          </li>
        ))}
      </ul>
      {onClear && (
        <Button
          variant="ghost"
          className="bbb-filter-chips__clear"
          disabled={disabled || items.every(item => item.disabled)}
          onPress={() => {
            pendingFocus.current = {}
            onClear(items.filter(item => !item.disabled).map(item => item.id))
          }}
        >
          {t('clearFilters')}
        </Button>
      )}
    </div>
  )
}
