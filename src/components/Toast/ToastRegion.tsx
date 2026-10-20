import { useMessages } from '../LocaleProvider/locale'
import { useThemeAttributes } from '../ThemeProvider/theme'
import { useCallback, useSyncExternalStore } from 'react'
import {
  Text,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent,
  UNSTABLE_ToastRegion,
} from 'react-aria-components'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import type { createToastQueue } from './toastQueue'
import './Toast.css'

export function ToastRegion({ queue }: { queue: ReturnType<typeof createToastQueue> }) {
  const { t } = useMessages()
  const theme = useThemeAttributes()
  const subscribe = useCallback((notify: () => void) => queue.subscribe(notify), [queue])
  const hasToasts = useSyncExternalStore(
    subscribe,
    () => queue.visibleToasts.length > 0,
    () => false,
  )

  // Mount with a DOM node so React Aria can register the F6 notification landmark.
  if (!hasToasts) return null

  return (
    <UNSTABLE_ToastRegion {...theme} queue={queue} className="bbb-theme bbb-toast-region" aria-label={t('notifications')}>
      {({ toast }) => (
        <AriaToast toast={toast} className="bbb-toast">
          <Icon name="info" />
          <UNSTABLE_ToastContent className="bbb-toast__content">
            <Text slot="title" className="bbb-toast__title">
              {toast.content.title}
            </Text>
            {toast.content.description && (
              <Text slot="description" className="bbb-toast__description">
                {toast.content.description}
              </Text>
            )}
          </UNSTABLE_ToastContent>
          {toast.content.action && (
            <Button
              size="sm"
              variant="secondary"
              aria-label={toast.content.action.ariaLabel}
              onPress={toast.content.action.onPress}
            >
              {toast.content.action.label}
            </Button>
          )}
          <Button slot="close" iconOnly size="sm" variant="ghost" aria-label={t('dismissNotification')}>
            <Icon name="x" />
          </Button>
        </AriaToast>
      )}
    </UNSTABLE_ToastRegion>
  )
}
