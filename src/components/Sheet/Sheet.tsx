import { ModalDialog } from '../Dialog/Dialog'
import type { DialogProps } from '../Dialog/Dialog'
import './Sheet.css'

export type SheetProps = Omit<DialogProps, 'role'> & {
  side?: 'start' | 'end'
}

export function Sheet({ side = 'end', ...props }: SheetProps) {
  return <ModalDialog {...props} placement={side} />
}
