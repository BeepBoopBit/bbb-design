import { UNSTABLE_ToastQueue } from 'react-aria-components'

export type ToastContent = {
  title: string
  description?: string
  action?: {
    label: string
    ariaLabel?: string
    onPress: () => void
  }
}

export function createToastQueue() {
  return new UNSTABLE_ToastQueue<ToastContent>({ maxVisibleToasts: 3 })
}
