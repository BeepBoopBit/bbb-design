import { useId, useState } from 'react'
import type { GalleryItem } from '../galleryItems'
import { Button } from '../../../components/Button/Button'
import { CopyButton } from '../../../components/CopyButton/CopyButton'
import { Link } from '../../../components/Link/Link'
import { ExampleDetails } from './ExampleDetails'

export function GalleryCard({ item }: { item: GalleryItem }) {
  const { Preview } = item
  const [generation, setGeneration] = useState(0)
  const [showCode, setShowCode] = useState(false)
  const detailsId = useId()
  const href = `/gallery?item=${encodeURIComponent(item.id)}`
  return (
    <article className={`gallery-card ${item.wide ? 'gallery-card--wide' : ''}`} aria-labelledby={`${item.id}-title`}>
      <div className={`gallery-card__preview gallery-card__preview--${item.id}`}>
        <Preview key={generation} />
      </div>
      <div className="gallery-card__info">
        <div className="gallery-card__title-row">
          <h3 id={`${item.id}-title`}>{item.name}</h3>
          <span>{item.detail}</span>
        </div>
        <p>{item.description}</p>
        <div className="gallery-card__example-tools">
          <Button variant="ghost" size="sm" aria-expanded={showCode} aria-controls={detailsId} onPress={() => setShowCode(value => !value)}>{showCode ? 'Hide code' : 'View code'}</Button>
          <Button variant="ghost" size="sm" onPress={() => setGeneration(value => value + 1)}>Reset example</Button>
          <Link href={href}>Open example</Link>
          <CopyButton text={new URL(href, window.location.origin).href} label="Copy example link" iconOnly />
        </div>
        <span className="bbb-visually-hidden" aria-live="polite">{generation ? `${item.name} example reset.` : ''}</span>
        <div id={detailsId}>{showCode && <ExampleDetails name={item.source ?? Preview.name} itemId={item.id} />}</div>
      </div>
    </article>
  )
}
