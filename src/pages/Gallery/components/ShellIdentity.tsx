import type { ReactNode } from 'react'
import { BrandLogo } from '../../../components/BrandLogo/BrandLogo'
import type { BrandPreset } from '../../../foundations/brands'
import './ShellIdentity.css'

export function ShellIdentity({ collapsed, brand, children }: {
  collapsed: boolean
  brand?: BrandPreset
  children: ReactNode
}) {
  return (
    <div className="shell-identity" data-collapsed={collapsed || undefined}>
      <div className="shell-identity__logo bbb-sidebar-reveal" data-hidden={collapsed || undefined} aria-hidden={collapsed || undefined}>
        <BrandLogo brand={brand} />
      </div>
      {children}
    </div>
  )
}
