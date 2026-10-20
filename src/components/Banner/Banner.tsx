import type { ReactNode } from 'react'
import { Alert } from '../Alert/Alert'
import type { AlertProps } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'
import './Banner.css'
export type BannerProps = AlertProps & { actions?: ReactNode; onDismiss?: () => void; dismissLabel?: string }
export function Banner({ children, actions, onDismiss, dismissLabel, className = '', ...props }: BannerProps) {
  const { t } = useMessages()
  return <Alert {...props} className={`bbb-banner ${className}`}>
    {children}
    {(actions || onDismiss) && <div className="bbb-banner__actions">{actions}{onDismiss &&
      <Button variant="ghost" size="sm" onPress={onDismiss}><Icon name="x" />{dismissLabel ?? t('dismissBanner')}</Button>}
    </div>}
  </Alert>
}
