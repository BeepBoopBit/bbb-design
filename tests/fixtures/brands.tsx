import '../../src/index.css'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '../../src/components/ThemeProvider/ThemeProvider'
import { BrandLogo } from '../../src/components/BrandLogo/BrandLogo'
import { Button } from '../../src/components/Button/Button'
import { Dialog } from '../../src/components/Dialog/Dialog'
import { createBrand, studioBrand } from '../../src/foundations/brands'

const brand = createBrand({ id: 'consumer', name: 'Consumer', extends: studioBrand,
  tokens: { '--bbb-duration-fast': 'var(--bbb-duration-spin)' } })
createRoot(document.getElementById('root')!).render(
  <ThemeProvider brand={brand} mode="system" tokens={{ '--bbb-button-radius': 'var(--bbb-radius-full)' }} data-testid="parent">
    <BrandLogo />
    <ThemeProvider mode="light" data-testid="light-child">
      <Button>Inherited shape</Button>
      <Dialog title="Nested dialog" trigger={<Button>Open nested dialog</Button>}><BrandLogo /></Dialog>
    </ThemeProvider>
    <ThemeProvider brand="bbb" data-testid="other-brand"><Button>Independent shape</Button></ThemeProvider>
  </ThemeProvider>,
)
