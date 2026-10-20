import { useMessages } from '../LocaleProvider/locale'
import type { Ref } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Tooltip } from '../Tooltip/Tooltip'
import './SidebarNavigation.css'

export function SidebarToggle({
  collapsed,
  controls,
  onToggle,
  buttonRef,
}: {
  collapsed: boolean
  controls: string
  onToggle: () => void
  buttonRef: Ref<HTMLButtonElement>
}) {
  const { t } = useMessages()
  const label = t(collapsed ? 'expandSidebar' : 'collapseSidebar')
  return (
    <Tooltip content={label}>
      <Button
        ref={buttonRef}
        variant="ghost"
        iconOnly
        aria-label={label}
        aria-expanded={!collapsed}
        aria-controls={controls}
        onPress={onToggle}
        className="bbb-sidebar-toggle"
      >
        <Icon name="panel-left" />
      </Button>
    </Tooltip>
  )
}
