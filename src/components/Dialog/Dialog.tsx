import { useMessages } from '../LocaleProvider/locale'
import { useThemeAttributes } from '../ThemeProvider/theme'
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components'
import type { ReactElement, ReactNode } from 'react'
import { useId } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './Dialog.css'

export type DialogProps = {
  className?: string
  bodyClassName?: string
  closeLabel?: string
  trigger: ReactElement
  title: string
  description?: string
  children?: ReactNode | ((close: () => void) => ReactNode)
  open?: boolean
  onOpenChange?: (open: boolean) => void
  role?: 'dialog' | 'alertdialog'
  footer?: ReactNode | ((close: () => void) => ReactNode)
}

export function Dialog(props: DialogProps) {
  return <ModalDialog {...props} />
}

// Shared modal behavior for centered dialogs and edge sheets.
export function ModalDialog({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  role = 'dialog',
  placement = 'center',
  footer,
  className = '',
  bodyClassName = '',
  closeLabel,
}: DialogProps & { placement?: 'center' | 'start' | 'end' | 'bottom' }) {
  const { t } = useMessages()
  const theme = useThemeAttributes()
  const descriptionId = useId()
  const sheet = placement !== 'center'
  return (
    <DialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      {trigger}
      <ModalOverlay
        {...theme}
        className={`bbb-theme bbb-modal-overlay${sheet ? ` bbb-modal-overlay--sheet bbb-modal-overlay--${placement}` : ''}`}
        isDismissable={role !== 'alertdialog'}
      >
        <Modal className={`bbb-modal${sheet ? ' bbb-modal--sheet' : ''}`}>
          <AriaDialog
            role={role}
            aria-describedby={description ? descriptionId : undefined}
            className={`bbb-dialog${sheet ? ' bbb-dialog--sheet' : ''} ${className}`}
          >
            {({ close }) => (
              <>
                <div className="bbb-dialog__header">
                  <div className="bbb-dialog__heading">
                    <Heading slot="title">{title}</Heading>
                    <Button
                      iconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={closeLabel ?? t(sheet ? 'closeSheet' : 'closeDialog')}
                      onPress={close}
                    >
                      <Icon name="x" />
                    </Button>
                  </div>
                  {description && (
                    <p id={descriptionId} className="bbb-dialog__description">
                      {description}
                    </p>
                  )}
                </div>
                <div className={`bbb-dialog__body ${bodyClassName}`}>
                  {typeof children === 'function' ? children(close) : children}
                </div>
                {footer && (
                  <div className="bbb-dialog__footer">
                    {typeof footer === 'function' ? footer(close) : footer}
                  </div>
                )}
              </>
            )}
          </AriaDialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}

export type ConfirmationDialogProps = Omit<DialogProps, 'children' | 'role'> & {
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  danger?: boolean
}

export function ConfirmationDialog({
  confirmLabel,
  cancelLabel,
  onConfirm,
  danger = false,
  ...props
}: ConfirmationDialogProps) {
  const { t } = useMessages()
  return (
    <Dialog {...props} role="alertdialog">
      {close => (
        <div className="bbb-dialog__actions">
          <Button variant="secondary" autoFocus onPress={close}>
            {cancelLabel ?? t('cancel')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onPress={() => {
              onConfirm()
              close()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      )}
    </Dialog>
  )
}
