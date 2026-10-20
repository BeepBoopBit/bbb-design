import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from '../Card/Card'
import './SettingsSection.css'

export type SettingsSectionProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: string
  description?: string
  headingLevel?: 2 | 3 | 4
  children: ReactNode
}

export function SettingsSection({
  title,
  description,
  headingLevel,
  children,
  className = '',
  ...props
}: SettingsSectionProps) {
  return (
    <Card
      {...props}
      as="section"
      title={title}
      description={description}
      headingLevel={headingLevel}
      className={`bbb-settings-section ${className}`}
    >
      {children}
    </Card>
  )
}
