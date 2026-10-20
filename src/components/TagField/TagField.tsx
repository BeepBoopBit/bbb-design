import { useMessages } from '../LocaleProvider/locale'
import { useRef, useState } from 'react'
import { TagGroup, TagList, Tag } from 'react-aria-components'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { TextField } from '../TextField/TextField'
import type { FieldVariant } from '../FormField/FieldSurface'
import './TagField.css'
export type TagFieldProps = {
  label: string
  value?: string[]
  defaultValue?: string[]
  onChange?: (tags: string[]) => void
  name?: string
  hint?: string
  error?: string
  variant?: FieldVariant
  disabled?: boolean
  maxTags?: number
  className?: string
  placeholder?: string
}
export function TagField({
  label,
  value,
  defaultValue = [],
  onChange,
  name,
  hint,
  error,
  variant,
  disabled,
  maxTags,
  className = '',
  placeholder,
}: TagFieldProps) {
  const { t, locale } = useMessages()
  const [local, setLocal] = useState(defaultValue)
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const tags = value ?? local
  function change(next: string[]) {
    if (value === undefined) setLocal(next)
    onChange?.(next)
  }
  function add() {
    const tag = draft.trim()
    if (!tag || disabled) return
    if (tags.some((item) => item.toLocaleLowerCase(locale) === tag.toLocaleLowerCase(locale))) {
      setMessage(t('tagDuplicate', { name: tag }))
      return
    }
    if (maxTags !== undefined && tags.length >= maxTags) {
      setMessage(t('tagLimit', { count: maxTags }))
      return
    }
    change([...tags, tag])
    setDraft('')
    setMessage(t('tagAdded', { name: tag }))
    input.current?.focus()
  }
  return (
    <div className={`bbb-tag-field ${className}`}>
      <TextField
        ref={input}
        label={label}
        variant={variant}
        placeholder={placeholder}
        value={draft}
        disabled={disabled}
        error={error}
        hint={hint ?? t('tagHint')}
        onChange={(e) => {
          setDraft(e.target.value)
          setMessage('')
        }}
        onKeyDown={(e) => {
          if (!e.nativeEvent.isComposing && (e.key === 'Enter' || e.key === ',')) {
            e.preventDefault()
            add()
          }
        }}
        trailingAction={
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            disabled={disabled || !draft.trim()}
            aria-label={t('addTag', { name: label.toLocaleLowerCase(locale) })}
            onPress={add}
          >
            <Icon name="plus" />
          </Button>
        }
      />
      {!!tags.length && (
        <TagGroup
          aria-label={t('tags', { name: label })}
          onRemove={(keys) => {
            const next = tags.filter((tag) => !keys.has(tag))
            change(next)
            setMessage(t('tagRemoved'))
            if (!next.length) input.current?.focus()
          }}
        >
          <TagList className="bbb-tag-field__tags">
            {tags.map((tag) => (
              <Tag
                key={tag}
                id={tag}
                textValue={tag}
                isDisabled={disabled}
                className="bbb-tag-field__tag"
              >
                <span>{tag}</span>
                <Button
                  slot="remove"
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={t('remove', { name: tag })}
                >
                  <Icon name="x" />
                </Button>
              </Tag>
            ))}
          </TagList>
        </TagGroup>
      )}
      {name &&
        !disabled &&
        tags.map((tag) => <input key={tag} type="hidden" name={name} value={tag} />)}
      <span className="bbb-visually-hidden" role="status">
        {message}
      </span>
    </div>
  )
}
