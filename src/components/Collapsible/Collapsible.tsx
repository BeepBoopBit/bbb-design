import { cloneElement } from 'react'
import type { ReactElement, ReactNode, Ref } from 'react'
import { Disclosure, DisclosurePanel } from 'react-aria-components'
import { Button } from '../Button/Button'
import type { ButtonProps } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './Collapsible.css'

export type CollapsibleProps = {
  label: string
  children: ReactNode
  trigger?: ReactElement<ButtonProps>
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
  ref?: Ref<HTMLDivElement>
}

export function Collapsible({ label, children, trigger, open, defaultOpen, onOpenChange, disabled, className = '', ref }: CollapsibleProps) {
  return <Disclosure ref={ref} isExpanded={open} defaultExpanded={defaultOpen} onExpandedChange={onOpenChange} isDisabled={disabled} className={`bbb-collapsible ${className}`}>
    {trigger ? cloneElement(trigger, { slot: 'trigger' }) : <Button slot="trigger" variant="ghost" className="bbb-collapsible__trigger">
      {label}<Icon name="chevron-down" />
    </Button>}
    <DisclosurePanel aria-label={label} className="bbb-collapsible__panel">
      <div className="bbb-collapsible__content">{children}</div>
    </DisclosurePanel>
  </Disclosure>
}
