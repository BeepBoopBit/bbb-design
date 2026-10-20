import { useMessages } from '../LocaleProvider/locale'
import { useThemeAttributes } from '../ThemeProvider/theme'
import { Dialog, DialogTrigger, Heading, Popover as AriaPopover } from 'react-aria-components'
import type { ReactElement, ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './Popover.css'

export type PopoverProps = {
  className?: string
  trigger: ReactElement
  title: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Popover({ trigger, title, children, open, onOpenChange, className = '' }: PopoverProps) {
  const { t } = useMessages()
  const theme = useThemeAttributes()
  return (
    <DialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      {trigger}
      <AriaPopover {...theme} className={`bbb-theme bbb-floating-surface bbb-popover ${className}`} placement="bottom start">
        <Dialog className="bbb-popover__content">
          {({ close }) => (
            <>
              <div className="bbb-popover__heading">
                <Heading slot="title">{title}</Heading>
                <Button
                  iconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={t('closePopover')}
                  onPress={close}
                >
                  <Icon name="x" />
                </Button>
              </div>
              {children}
            </>
          )}
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  )
}
