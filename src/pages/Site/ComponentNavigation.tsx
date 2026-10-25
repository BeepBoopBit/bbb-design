import { galleryItems } from '../Gallery/galleryItems'
import { examplePath, sitePath } from '../Gallery/useGalleryLocation'

export function ComponentNavigation({ currentId }: { currentId: string }) {
  return <nav className="component-navigation" aria-label="Component documentation">
    <a href={sitePath('getting-started')}>Get started</a>
    <p>Components</p>
    {galleryItems.filter(item => item.category === 'components').sort((a, b) => a.name.localeCompare(b.name)).map(item =>
      <a key={item.id} href={examplePath(item.id)} aria-current={item.id === currentId ? 'page' : undefined}>{item.name}</a>)}
  </nav>
}
