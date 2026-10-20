import { useThemeAttributes } from '../ThemeProvider/theme'
import { Tooltip as AriaTooltip, TooltipTrigger } from 'react-aria-components'
import type { ReactElement } from 'react'
import type { TooltipProps as AriaTooltipProps } from 'react-aria-components'
import './Tooltip.css'

export type TooltipProps = {
  children: ReactElement
  content: string
  className?: string
  placement?: AriaTooltipProps['placement']
  disabled?: boolean
}

export function Tooltip({ children, content, placement, disabled = false, className = '' }: TooltipProps) {
  const theme = useThemeAttributes()
  return (
    <TooltipTrigger isDisabled={disabled}>
      {children}
      <AriaTooltip {...theme} className={`bbb-theme bbb-tooltip ${className}`} placement={placement}>{content}</AriaTooltip>
    </TooltipTrigger>
  )
}
