import { useThemeAttributes } from '../ThemeProvider/theme'
import { Popover } from 'react-aria-components'
import type { PopoverProps } from 'react-aria-components'
import '../Popover/Popover.css'
import './DropdownSurface.css'

export type DropdownSurfaceProps = Omit<PopoverProps, 'className'> & { className?: string }

/** Shared floating treatment for action menus and field option lists. */
export function DropdownSurface({ className = '', ...props }: DropdownSurfaceProps) {
  const theme = useThemeAttributes()
  return (
    <Popover
      placement="bottom start"
      {...props}
      {...theme} style={{ ...theme.style, ...props.style }}
      className={`bbb-theme bbb-floating-surface bbb-dropdown-surface ${className}`}
    />
  )
}
