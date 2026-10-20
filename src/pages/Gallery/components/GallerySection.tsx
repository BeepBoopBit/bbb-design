import { Icon } from '../../../components/Icon/Icon'
import type { IconName } from '../../../components/Icon/Icon'
import type { GalleryItem } from '../galleryItems'
import { GalleryCard } from './GalleryCard'

type GallerySectionProps = {
  id: string
  title: string
  description: string
  icon: IconName
  items: GalleryItem[]
}

export function GallerySection({ id, title, description, icon, items }: GallerySectionProps) {
  if (!items.length) return null

  return (
    <section className="gallery-section" aria-labelledby={`${id}-title`}>
      <div className="gallery-section__heading">
        <div>
          <h2 id={`${id}-title`}>
            <Icon name={icon} />
            {title}
            <span>{String(items.length).padStart(2, '0')}</span>
          </h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="gallery-grid">
        {items.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
