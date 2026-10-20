import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Dialog } from '../Dialog/Dialog'
import { CommandSearch } from './CommandSearch'
import type { CommandSearchProps } from './CommandSearch'
import { useMessages } from '../LocaleProvider/locale'
export type { CommandItem, CommandSearchProps } from './CommandSearch'

export type CommandPaletteProps = Omit<CommandSearchProps, 'autoFocus' | 'label'> & {
  trigger: ReactElement
  title: string
  searchLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Opt in on one app-level palette. Ignored while typing or another dialog is open. */
  shortcut?: string
}

export function CommandPalette({ trigger, title, searchLabel, open, onOpenChange, shortcut, onAction, ...props }: CommandPaletteProps) {
  const [local, setLocal] = useState(false)
  const visible = open ?? local
  const { t } = useMessages()
  function change(next: boolean) { setLocal(next); onOpenChange?.(next) }
  useEffect(() => {
    if (!shortcut) return
    const keydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.altKey || !((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === shortcut.toLowerCase())) return
      if (event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]')) return
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return
      event.preventDefault()
      setLocal(true)
      onOpenChange?.(true)
    }
    document.addEventListener('keydown', keydown)
    return () => document.removeEventListener('keydown', keydown)
  }, [shortcut, onOpenChange])
  return <Dialog trigger={trigger} title={title} open={visible} onOpenChange={change}>
    <CommandSearch {...props} label={searchLabel ?? t('commandSearch')} autoFocus onAction={id => { change(false); onAction(id) }} />
  </Dialog>
}
