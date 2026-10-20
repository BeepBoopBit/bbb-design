import { useRef, useState } from 'react'
import { Dialog } from '../Dialog/Dialog'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator'
import { useMessages } from '../LocaleProvider/locale'
import './MediaPreview.css'
export type MediaPreviewProps = { src: string; alt: string; caption?: string; className?: string }
function ImageAsset({ src, alt }: { src: string; alt: string }) {
  const { t } = useMessages()
  const root = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  return <div ref={root} tabIndex={-1} className="bbb-media-preview__asset">
    {state === 'loading' && <LoadingIndicator label={t('loading', { name: alt })} />}
    {state === 'error' ? <div role="status"><p>{t('imageFailed')}</p><Button variant="secondary" onPress={() => { setAttempt(value => value + 1); setState('loading'); requestAnimationFrame(() => root.current?.focus()) }}>{t('retry')}</Button></div> :
      <img key={attempt} src={src} alt={alt} onLoad={() => setState('ready')} onError={() => setState('error')} />}
  </div>
}
export function MediaPreview({ src, alt, caption, className = '' }: MediaPreviewProps) {
  const { t } = useMessages()
  return <figure className={`bbb-media-preview ${className}`}>
    <ImageAsset key={src} src={src} alt={alt} />
    {caption && <figcaption>{caption}</figcaption>}
    <Dialog title={alt} className="bbb-media-preview__dialog" trigger={<Button variant="secondary" size="sm"><Icon name="external-link" />{t('enlargeImage')}</Button>}>
      <ImageAsset key={src} src={src} alt={alt} />{caption && <p>{caption}</p>}
    </Dialog>
  </figure>
}
