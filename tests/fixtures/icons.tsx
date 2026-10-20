import { createRoot } from 'react-dom/client'
import { Button } from '../../src/components/Button/Button'
import { Icon, IconProvider } from '../../src/components/Icon/Icon'
import { ThemeProvider } from '../../src/components/ThemeProvider/ThemeProvider'
import '../../src/index.css'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider mode="light" tokens={{
    '--bbb-icon-size': 'var(--bbb-space-6)',
    '--bbb-icon-stroke': '3',
  }}>
    <Button aria-label="Close"><Icon name="x" /></Button>
    <Button aria-label="Close with legacy name"><Icon name="close" /></Button>
    <IconProvider icons={{
      close: <circle cx="12" cy="12" r="6" />,
      sparkles: <rect x="4" y="4" width="16" height="16" />,
    }}>
      <div data-testid="parent-canonical"><Icon name="x" /></div>
      <div data-testid="parent-alias"><Icon name="close" /></div>
      <IconProvider icons={{ x: <path d="M4 12h16" /> }}>
        <div data-testid="child-canonical"><Icon name="x" /></div>
        <div data-testid="child-alias"><Icon name="close" /></div>
        <div data-testid="inherited-canonical"><Icon name="sparkles" /></div>
        <div data-testid="inherited-alias"><Icon name="sparkle" /></div>
      </IconProvider>
    </IconProvider>
    <ThemeProvider mode="dark" dir="rtl">
      <div data-testid="rtl-canonical"><Icon name="arrow-right" /></div>
      <div data-testid="rtl-alias"><Icon name="arrow" /></div>
      <div data-testid="rtl-neutral"><Icon name="sun" /></div>
    </ThemeProvider>
  </ThemeProvider>,
)
