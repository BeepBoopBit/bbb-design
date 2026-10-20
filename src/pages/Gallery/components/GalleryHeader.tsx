export function GalleryHeader({ count }: { count: number }) {
  return (
    <header className="gallery-header">
      <div>
        <h1>Gallery</h1>
        <p>Explore {count} foundations, components, and patterns.</p>
      </div>
    </header>
  )
}
