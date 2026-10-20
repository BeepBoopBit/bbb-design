import { useMessages } from '../LocaleProvider/locale'
import { Avatar } from '../Avatar/Avatar'
import type { AvatarProps } from '../Avatar/Avatar'
import { Button } from '../Button/Button'
import { Popover } from '../Popover/Popover'
import './AvatarGroup.css'

export type AvatarMember = Pick<AvatarProps, 'name' | 'src' | 'tone'> & { id: string }
export type AvatarGroupProps = {
  className?: string
  label: string
  members: AvatarMember[]
  maxVisible?: number
  size?: AvatarProps['size']
}

export function AvatarGroup({ label, members, maxVisible = 3, size = 'md', className = '' }: AvatarGroupProps) {
  const { t, formatNumber } = useMessages()
  const limit = Number.isFinite(maxVisible) ? Math.max(1, Math.floor(maxVisible)) : members.length
  const remaining = Math.max(0, members.length - limit)
  return (
    <div className={`bbb-avatar-group ${className}`} role="group" aria-label={label}>
      {members.slice(0, limit).map(member => (
        <Avatar key={member.id} {...member} size={size} />
      ))}
      {remaining > 0 && (
        <Popover
          title={label}
          trigger={
            <Button
              variant="secondary"
              className="bbb-avatar-group__more"
              aria-label={t('showMembers', { count: members.length })}
            >
              +{formatNumber(remaining)}
            </Button>
          }
        >
          <ul className="bbb-avatar-group__members">
            {members.map(member => (
              <li key={member.id}>
                <Avatar {...member} size="sm" decorative />
                <span>{member.name}</span>
              </li>
            ))}
          </ul>
        </Popover>
      )}
      {!members.length && <span className="bbb-avatar-group__empty">{t('noMembers')}</span>}
    </div>
  )
}
