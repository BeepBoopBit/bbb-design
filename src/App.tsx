import { lazy, Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider'
import { Gallery } from './pages/Gallery/Gallery'
import { GalleryAppearance } from './pages/Gallery/components/GalleryAppearance'
import type { Appearance } from './pages/Gallery/components/GalleryAppearance'
import { GalleryShell } from './pages/Gallery/components/GalleryShell'
import { useGalleryLocation } from './pages/Gallery/useGalleryLocation'
import { LoadingIndicator } from './components/LoadingIndicator/LoadingIndicator'
import { Home } from './pages/Home/Home'
import './pages/Site/Site.css'

const GetStarted = lazy(() => import('./pages/GetStarted/GetStarted'))
const ButtonDocs = lazy(() => import('./pages/ComponentDocs/ButtonDocs'))
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
    const title = page === 'home' ? 'Thoughtful interfaces, built with BBB' : page === 'getting-started' ? 'Get started'
      : page === 'button' ? 'Button' : category === 'all' ? 'Gallery' : category[0].toUpperCase() + category.slice(1)
    document.title = `${title} · BBB design system`
    document.querySelector('meta[name="description"]')?.setAttribute('content', page === 'home'
      ? 'Editable React components, design foundations, and patterns. Copy the source into your app, customize it, and make it your own.'
      : page === 'getting-started'
      ? 'Copy BBB components into your React app. Set up the CLI, add components, and make the source your own.'
      : page === 'button' ? 'Use the BBB Button component: interactive examples, installation, variants, accessibility, and API reference.'
      : 'Shared design foundations and reusable components for BBB products.')
  }, [page, category])
  return (
    <ThemeProvider {...appearance} locale="en-US">
      <GalleryShell
        page={page}
        onPageNavigate={page => navigate({ page })}
        category={category}
        isolated={Boolean(item) && page === 'gallery'}
        onCategoryChange={(category, clearSearch) => navigate({ page: 'gallery', category, item: undefined, ...(clearSearch ? { query: '' } : {}) })}
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
        {page === 'home' ? <Home /> : page === 'button'
          ? <Suspense fallback={<LoadingIndicator label="Loading Button documentation…" />}><ButtonDocs /></Suspense>
          : page === 'getting-started'
          ? <Suspense fallback={<LoadingIndicator label="Loading getting started…" />}><GetStarted /></Suspense>
          : <Gallery location={location} />}
      </GalleryShell>
    </ThemeProvider>
  )
}
export default App
