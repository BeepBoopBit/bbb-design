import { Disclosure, DisclosureGroup, DisclosurePanel, Heading } from 'react-aria-components'
import type { DisclosureGroupProps } from 'react-aria-components'
import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './Accordion.css'

export type AccordionProps = Omit<DisclosureGroupProps, 'children' | 'className'> & {
  items: { id: string; title: string; content: ReactNode; disabled?: boolean }[]
  className?: string
}

export function Accordion({ items, className = '', ...props }: AccordionProps) {
  return (
    <DisclosureGroup {...props} className={`bbb-accordion ${className}`}>
      {items.map(item => (
        <Disclosure
          key={item.id}
          id={item.id}
          isDisabled={item.disabled}
          className="bbb-accordion__item"
        >
          <Heading level={4} className="bbb-accordion__heading">
            <Button slot="trigger" variant="ghost" className="bbb-accordion__trigger">
              {item.title}
              <Icon name="chevron-down" />
            </Button>
          </Heading>
          <DisclosurePanel className="bbb-accordion__panel">
            <div className="bbb-accordion__content">{item.content}</div>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </DisclosureGroup>
  )
}
