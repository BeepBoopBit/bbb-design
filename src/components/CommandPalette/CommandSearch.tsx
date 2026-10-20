import { KeyboardShortcut } from '../KeyboardShortcut/KeyboardShortcut'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Autocomplete, SearchField, Input, Label, Menu, MenuSection, MenuItem, Header, Text, useFilter } from 'react-aria-components'
import { FieldSurface } from '../FormField/FieldSurface'
import type { FieldVariant } from '../FormField/FieldSurface'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'
import '../FormField/FormField.css'
import '../TextField/TextField.css'
import '../DropdownSurface/DropdownSurface.css'
import './CommandPalette.css'

export type CommandItem = {
  id: string
  label: string
  group: string
  description?: string
  keywords?: string[]
  shortcut?: string[]
  href?: string
  target?: string
  leading?: ReactNode
  disabled?: boolean
}
export type CommandSearchProps = {
  label: string
  items: CommandItem[]
  onAction: (id: string) => void
  query?: string
  onQueryChange?: (query: string) => void
  loading?: boolean
  autoFocus?: boolean
  placeholder?: string
  variant?: Exclude<FieldVariant, 'filled'>
  className?: string
}

export function CommandSearch({ label, items, onAction, query, onQueryChange, loading, autoFocus, placeholder, variant = 'subtle', className = '' }: CommandSearchProps) {
  const [local, setLocal] = useState('')
  const value = query ?? local
  const { contains } = useFilter({ sensitivity: 'base' })
  const { t } = useMessages()
  const matches = loading ? [] : items.filter(item => contains([item.label, item.group, ...(item.keywords ?? [])].join(' '), value.trim()))
  const groups = [...new Set(matches.map(item => item.group))]
  return (
    <div className={`bbb-command-search ${className}`}>
      <Autocomplete inputValue={value} onInputChange={next => { setLocal(next); onQueryChange?.(next) }}>
        <SearchField className="bbb-field">
          <FieldSurface variant={variant} label={<Label className="bbb-visually-hidden">{label}</Label>}>
            <div className="bbb-field__control">
              <Icon name="search" />
              <Input autoFocus={autoFocus} placeholder={placeholder} />
              {value && <Button variant="ghost" size="sm" iconOnly aria-label={t('clearSearch')}><Icon name="x" /></Button>}
            </div>
          </FieldSurface>
        </SearchField>
        <div className="bbb-command-search__results" role="region" aria-label={t('searchResults')} tabIndex={0}>
        <Menu
          aria-label={t('searchResults')} aria-busy={loading || undefined}
          className="bbb-option-list"
          disabledKeys={items.filter(item => item.disabled).map(item => item.id)}
          onAction={id => { if (!loading) onAction(String(id)) }}
          renderEmptyState={() => <div className="bbb-command-search__empty">
            <strong>{loading ? t('searchLoading') : t('noResults')}</strong>
            {!loading && <p>{t('noResultsHint')}</p>}
          </div>}
        >
          {groups.map(group => <MenuSection key={group} id={group}>
            <Header className="bbb-command-search__group">{group}</Header>
            {matches.filter(item => item.group === group).map(item => <MenuItem
              key={item.id} id={item.id} textValue={item.label} href={item.href} target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined} className="bbb-option bbb-command-search__item"
            >
              {item.leading}
              <span className="bbb-command-search__copy">
                <Text slot="label">{item.label}</Text>
                {item.description && <Text slot="description" className="bbb-option__description">{item.description}</Text>}
              </span>
              {item.shortcut ? <KeyboardShortcut keys={item.shortcut} /> : <Icon name="arrow-right" />}
            </MenuItem>)}
          </MenuSection>)}
        </Menu>
        </div>
      </Autocomplete>
      <p className="bbb-command-search__status" role="status">{loading ? t('searchLoading') : t(matches.length === 1 ? 'resultCountOne' : 'resultCount', { count: matches.length })}</p>
    </div>
  )
}
