import { useMessages } from '../LocaleProvider/locale'
import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import './Avatar.css'

export type AvatarProps = {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'neutral' | 'teal' | 'ember'
  decorative?: boolean
  className?: string
}

export function Avatar({
  name,
  src,
  size = 'md',
  tone = 'neutral',
  decorative = false,
  className = '',
}: AvatarProps) {
  const { t, locale } = useMessages()
  const [failedSource, setFailedSource] = useState<string>()
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = (parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts)
    .map(part => Array.from(part)[0])
    .join('')
    .toLocaleUpperCase(locale)
  return (
    <span
      className={`bbb-avatar bbb-avatar--${size} bbb-avatar--${tone} ${className}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name.trim() || t('unknownPerson')}
      aria-hidden={decorative || undefined}
    >
      <span className="bbb-avatar__fallback">{initials || <Icon name="user-round" />}</span>
      {src && failedSource !== src && (
        <img key={src} src={src} alt="" onError={() => setFailedSource(src)} />
      )}
    </span>
  )
}
