import { useMessages } from '../LocaleProvider/locale'
import { useId, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Progress } from '../Progress/Progress'
import './FileUpload.css'
export type UploadFile = {
  id: string
  file: File
  status: 'ready' | 'uploading' | 'complete' | 'error'
  progress?: number
  error?: string
}
export type FileUploadProps = {
  label: string
  files: UploadFile[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  onRetry?: (id: string) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  disabled?: boolean
  hint?: string
  error?: string
  className?: string
}
function accepts(file: File, accept?: string) {
  return (
    !accept ||
    accept.split(',').some((raw) => {
      const rule = raw.trim().toLowerCase()
      return rule.startsWith('.')
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith('/*')
          ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
          : file.type.toLowerCase() === rule
    })
  )
}
export function FileUpload({
  label,
  files,
  onAdd,
  onRemove,
  onRetry,
  accept,
  multiple = true,
  maxSize,
  disabled,
  hint,
  error,
  className = '',
}: FileUploadProps) {
  const { t, locale } = useMessages()
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const browse = useRef<HTMLButtonElement>(null)
  const [rejection, setRejection] = useState('')
  const [dragging, setDragging] = useState(false)
  function add(incoming: File[]) {
    if (disabled) return
    const problems: string[] = []
    const accepted = incoming.filter((file) => {
      if (!accepts(file, accept)) {
        problems.push(t('unsupportedFile', { name: file.name }))
        return false
      }
      if (maxSize !== undefined && file.size > maxSize) {
        problems.push(t('largeFile', { name: file.name }))
        return false
      }
      return true
    })
    if (!multiple && accepted.length > 1) {
      setRejection(t('singleFile'))
      return
    }
    setRejection(problems.join(' '))
    if (accepted.length) onAdd(accepted)
  }
  return (
    <section
      aria-labelledby={id}
      className={`bbb-upload ${className}`}
      data-disabled={disabled || undefined}
    >
      <div id={id} className="bbb-upload__label">
        {label}
      </div>
      <div
        className="bbb-upload__dropzone"
        data-dragging={dragging || undefined}
        data-invalid={!!(error || rejection) || undefined}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          add(Array.from(e.dataTransfer.files))
        }}
      >
        <Icon name="arrow-up" />
        <p id={`${id}-hint`}>{hint ?? t('uploadHint')}</p>
        <input
          ref={input}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            add(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />
        <Button
          ref={browse}
          variant="secondary"
          disabled={disabled}
          aria-describedby={`${id}-hint${error || rejection ? ` ${id}-error` : ''}`}
          onPress={() => input.current?.click()}
        >
          {t('chooseFiles')}
        </Button>
      </div>
      {(error || rejection) && (
        <p id={`${id}-error`} className="bbb-field__message bbb-field__message--error" role="alert">
          {error || rejection}
        </p>
      )}
      {!!files.length && (
        <ul className="bbb-upload__files">
          {files.map((item) => (
            <li key={item.id}>
              <div className="bbb-upload__file">
                <span>
                  {item.file.name}
                  <small>
                    {new Intl.NumberFormat(locale, {
                      style: 'unit',
                      unit: 'kilobyte',
                      maximumFractionDigits: 1,
                    }).format(item.file.size / 1000)}{' '}
                    ·{' '}
                    {item.status === 'complete'
                      ? t('uploadComplete')
                      : item.status === 'error'
                        ? t('uploadFailed')
                        : item.status === 'uploading'
                          ? t('uploading')
                          : t('uploadReady')}
                  </small>
                </span>
                <div className="bbb-upload__actions">
                  {item.status === 'error' && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      aria-label={`${t('retry')} ${item.file.name}`}
                      onPress={() => onRetry(item.id)}
                    >
                      {t('retry')}
                    </Button>
                  )}
                  <Button
                    iconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={t('remove', { name: item.file.name })}
                    disabled={disabled}
                    onPress={() => {
                      onRemove(item.id)
                      browse.current?.focus()
                    }}
                  >
                    <Icon name="x" />
                  </Button>
                </div>
              </div>
              {item.status === 'uploading' && (
                <Progress label={t('uploadingFile', { name: item.file.name })} value={item.progress} />
              )}
              {item.error && (
                <p className="bbb-field__message bbb-field__message--error">{item.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <span className="bbb-visually-hidden" role="status">
        {t('uploadSummary', { count: files.length, complete: files.filter(file => file.status === 'complete').length, failed: files.filter(file => file.status === 'error').length })}
      </span>
    </section>
  )
}
