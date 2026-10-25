import { ModalDialog } from '../Dialog/Dialog'
import type { DialogProps } from '../Dialog/Dialog'
import '../Sheet/Sheet.css'
import './Drawer.css'

export type DrawerProps = Omit<DialogProps, 'role'>

/** A bottom sheet using the same focus containment and dismissal as Dialog. */
export function Drawer(props: DrawerProps) {
  return <ModalDialog {...props} placement="bottom" />
}
