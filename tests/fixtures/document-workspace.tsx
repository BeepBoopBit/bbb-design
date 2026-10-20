import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { ThemeProvider } from '../../src/components/ThemeProvider/ThemeProvider'
import { DocumentWorkspace } from '../../src/components/DocumentWorkspace/DocumentWorkspace'
import { SidebarNavigation } from '../../src/components/SidebarNavigation/SidebarNavigation'
import { Button } from '../../src/components/Button/Button'
import '../../src/index.css'

export function Fixture() {
  const [selected, setSelected] = useState(false)
  return <ThemeProvider locale="ar" mode="light">
    <main>
      <DocumentWorkspace label="مساحة المستندات" contentLabel="المستند" navigationLabel="المكتبة" openNavigationLabel="فتح المكتبة"
        navigation={({ compact, onNavigate }) => <SidebarNavigation label="المكتبة" compact={compact}
          groups={[{ id: 'documents', items: [{ id: 'intro', label: 'المقدمة', icon: 'note', href: '#intro' }] }]}
          currentId={selected ? 'intro' : undefined} onNavigate={() => { setSelected(true); onNavigate() }} />}
        account={<Button variant="ghost">الحساب</Button>}>
        <h1>{selected ? 'المقدمة' : 'اختر مستندًا'}</h1>
        <p>مساحة هادئة للقراءة والعمل.</p>
      </DocumentWorkspace>
    </main>
  </ThemeProvider>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
