import '../../src/index.css'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '../../src/components/ThemeProvider/ThemeProvider'
import { ThemeSwitcher } from '../../src/components/ThemeSwitcher/ThemeSwitcher'
import { AppearanceSettings } from '../../src/components/AppearanceSettings/AppearanceSettings'
import { SplitPane } from '../../src/components/SplitPane/SplitPane'
import { TreeView } from '../../src/components/TreeView/TreeView'
import { LoadingIndicator } from '../../src/components/LoadingIndicator/LoadingIndicator'
import { Button } from '../../src/components/Button/Button'
import type { ThemeMode } from '../../src/components/ThemeProvider/theme'
export function Fixture() {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [selected, setSelected] = useState('draft')
  const locale = new URLSearchParams(location.search).get('locale') ?? 'ar'
  return <ThemeProvider mode={mode} locale={locale} tokens={{ '--bbb-split-default': '50', '--bbb-split-step': '10' }}>
    <main><h1>Product utilities</h1>
      <ThemeSwitcher value={mode} onChange={setMode} />
      <AppearanceSettings mode={mode} onModeChange={setMode} />
      <ThemeSwitcher value={mode} onChange={setMode} disabled label="Disabled appearance" />
      <SplitPane label="Resize library" primary={<TreeView label="Documents" selectedId={selected} onSelectionChange={setSelected}
        items={[{ id: 'folder', label: 'Documents', children: [{ id: 'draft', label: 'Draft' }] }]} defaultExpandedIds={['folder']} />}>
        <Button>Open document</Button>
      </SplitPane>
      <LoadingIndicator />
    </main>
  </ThemeProvider>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
