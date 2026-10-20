import {
  SelectionIndicator,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs as AriaTabs,
} from 'react-aria-components'
import type { TabsProps as AriaTabsProps } from 'react-aria-components'
import type { ReactNode } from 'react'
import './Tabs.css'

export type TabsProps = Omit<AriaTabsProps, 'children' | 'className'> & {
  label: string
  items: { id: string; label: string; content: ReactNode; disabled?: boolean }[]
  className?: string
}

export function Tabs({ label, items, className = '', ...props }: TabsProps) {
  return (
    <AriaTabs {...props} className={`bbb-tabs ${className}`}>
      <TabList aria-label={label} className="bbb-tabs__list">
        {items.map(item => (
          <Tab key={item.id} id={item.id} isDisabled={item.disabled} className="bbb-tabs__tab">
            <SelectionIndicator className="bbb-tabs__indicator" />
            <span className="bbb-tabs__label">{item.label}</span>
          </Tab>
        ))}
      </TabList>
      <TabPanels className="bbb-tabs__panels">
        {items.map(item => (
          <TabPanel key={item.id} id={item.id} className="bbb-tabs__panel">
            {item.content}
          </TabPanel>
        ))}
      </TabPanels>
    </AriaTabs>
  )
}
