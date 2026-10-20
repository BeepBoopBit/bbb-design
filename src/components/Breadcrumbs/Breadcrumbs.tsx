import { useMessages } from '../LocaleProvider/locale'
import { Icon } from '../Icon/Icon'
import { Link } from '../Link/Link'
import './Breadcrumbs.css'

type BreadcrumbItem = { id: string; label: string; href?: string }
export type BreadcrumbsProps = { items: BreadcrumbItem[]; label?: string; className?: string }

export function Breadcrumbs({ items, label, className = '' }: BreadcrumbsProps) {
  const { t } = useMessages()
  if (!items.length) return null
  return (
    <nav className={`bbb-breadcrumbs ${className}`} aria-label={label ?? t('breadcrumbs')}>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            {index > 0 && <Icon name="chevron-right" />}
            {index === items.length - 1 ? (
              <span className="bbb-breadcrumbs__current" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <Link href={item.href} variant="quiet">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
