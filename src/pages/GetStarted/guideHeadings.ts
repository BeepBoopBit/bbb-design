import { Children, isValidElement } from 'react'
import type { ReactNode } from 'react'

export function guideText(children: ReactNode): string {
  return Children.toArray(children).map(child => isValidElement<{ children?: ReactNode }>(child)
    ? guideText(child.props.children)
    : String(child)).join('')
}

export const guideHeadingId = (children: ReactNode) => guideText(children).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
