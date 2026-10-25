import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { Focusable, Popover, PreviewTrigger } from 'react-aria-components'
import type { PopoverProps } from 'react-aria-components'
import { useThemeAttributes } from '../ThemeProvider/theme'
import '../Popover/Popover.css'
import './HoverCard.css'

export type HoverCardProps = {
  /** A focusable link or button that forwards its DOM props and ref. */
  trigger: ComponentProps<typeof Focusable>['children']
  title: string
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  delay?: number
  closeDelay?: number
  placement?: PopoverProps['placement']
  className?: string
}

/** Supplemental previews: keep essential information available at the link destination. */
export function HoverCard({ trigger, title, children, open, defaultOpen, onOpenChange, disabled,
  delay = 600, closeDelay = 200, placement = 'bottom start', className = '' }: HoverCardProps) {
  const theme = useThemeAttributes()
  const titleId = useId()
  if (disabled) return trigger
  return <PreviewTrigger isOpen={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}
    delay={delay} closeDelay={closeDelay}>
    <Focusable>{trigger}</Focusable>
    <Popover {...theme} className={`bbb-theme bbb-floating-surface bbb-hover-card ${className}`}
      placement={placement} offset={8} aria-labelledby={titleId}>
      <h2 id={titleId} className="bbb-hover-card__title">{title}</h2>
      <div className="bbb-hover-card__content">{children}</div>
    </Popover>
  </PreviewTrigger>
}
