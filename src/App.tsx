import { lazy, Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider'
import { Gallery } from './pages/Gallery/Gallery'
import { GalleryAppearance } from './pages/Gallery/components/GalleryAppearance'
import type { Appearance } from './pages/Gallery/components/GalleryAppearance'
import { GalleryShell } from './pages/Gallery/components/GalleryShell'
import { useGalleryLocation } from './pages/Gallery/useGalleryLocation'
import { LoadingIndicator } from './components/LoadingIndicator/LoadingIndicator'

const GetStarted = lazy(() => import('./pages/GetStarted/GetStarted'))
function readAppearance(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem('bbb-gallery-appearance') ?? '{}')
    return {
      brand: saved.brand === 'studio' ? 'studio' : 'bbb',
      mode: ['light', 'dark', 'system'].includes(saved.mode) ? saved.mode : 'system',
      density: saved.density === 'compact' ? 'compact' : 'comfortable',
    }
  } catch {
    return { brand: 'bbb', mode: 'system', density: 'comfortable' }
  }
}
function App() {
  const [appearance, setAppearance] = useState(readAppearance)
  const location = useGalleryLocation()
  const { page, category, item, navigate } = location
  useEffect(() => {
    document.title = `${page === 'getting-started' ? 'Get started' : 'Gallery'} · BBB design system`
    document.querySelector('meta[name="description"]')?.setAttribute('content', page === 'getting-started'
      ? 'Copy BBB components into your React app. Set up the CLI, add components, and make the source your own.'
      : 'Shared design foundations and reusable components for BBB products.')
  }, [page])
  return (
    <ThemeProvider {...appearance} locale="en-US">
      <GalleryShell
        page={page}
        onPageNavigate={page => navigate({ page })}
        category={category}
        isolated={Boolean(item) && page === 'gallery'}
        onCategoryChange={category => navigate({ page: 'gallery', category, item: undefined })}
        appearance={
          <GalleryAppearance
            value={appearance}
            onChange={(next) => {
              setAppearance(next)
              try {
                localStorage.setItem('bbb-gallery-appearance', JSON.stringify(next))
              } catch {
                /* In-memory preferences still work when storage is unavailable. */
              }
            }}
          />
        }
      >
        {page === 'getting-started'
          ? <Suspense fallback={<LoadingIndicator label="Loading getting started…" />}><GetStarted /></Suspense>
          : <Gallery location={location} />}
      </GalleryShell>
    </ThemeProvider>
  )
}
export default App
