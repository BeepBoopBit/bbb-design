import type { HTMLAttributes, ReactNode } from 'react'
import './DescriptionList.css'

export type DescriptionItem = { id: string; label: ReactNode; value: ReactNode }
export type DescriptionListProps = HTMLAttributes<HTMLDListElement> & {
  items: DescriptionItem[]
  layout?: 'rows' | 'stacked'
}

export function DescriptionList({ items, layout = 'rows', className = '', ...props }: DescriptionListProps) {
  return (
    <dl {...props} className={`bbb-description-list bbb-description-list--${layout} ${className}`}>
      {items.map(item => (
        <div className="bbb-description-list__item" key={item.id}>
          <dt>{item.label}</dt><dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
