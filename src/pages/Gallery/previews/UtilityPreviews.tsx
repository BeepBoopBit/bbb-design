import { useThemeAttributes } from '../../../components/ThemeProvider/theme'
import { useLayoutEffect, useRef, useState } from 'react'
import { ThemeProvider } from '../../../components/ThemeProvider/ThemeProvider'
import type { ThemeMode, Density } from '../../../components/ThemeProvider/ThemeProvider'
import { ThemeSwitcher } from '../../../components/ThemeSwitcher/ThemeSwitcher'
import { AppearanceSettings } from '../../../components/AppearanceSettings/AppearanceSettings'
import { AccountMenu } from '../../../components/AccountMenu/AccountMenu'
import { WorkspaceSwitcher } from '../../../components/WorkspaceSwitcher/WorkspaceSwitcher'
import { CopyButton } from '../../../components/CopyButton/CopyButton'
import { CodeBlock } from '../../../components/CodeBlock/CodeBlock'
import { KeyboardShortcut } from '../../../components/KeyboardShortcut/KeyboardShortcut'
import { LoadingIndicator } from '../../../components/LoadingIndicator/LoadingIndicator'
import { StatusIndicator } from '../../../components/StatusIndicator/StatusIndicator'
import { Banner } from '../../../components/Banner/Banner'
import { BulkActionBar } from '../../../components/BulkActionBar/BulkActionBar'
import { NotificationCenter } from '../../../components/NotificationCenter/NotificationCenter'
import type { NotificationItem } from '../../../components/NotificationCenter/NotificationCenter'
import { SplitPane } from '../../../components/SplitPane/SplitPane'
import { TreeView } from '../../../components/TreeView/TreeView'
import { ContextMenu } from '../../../components/ContextMenu/ContextMenu'
import { MediaPreview } from '../../../components/MediaPreview/MediaPreview'
import { Button } from '../../../components/Button/Button'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { TextField } from '../../../components/TextField/TextField'
import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl'
import { CommandPalette } from '../../../components/CommandPalette/CommandPalette'
import { Link } from '../../../components/Link/Link'
import './UtilityPreviews.css'

function usePreviewMode() {
  const theme = useThemeAttributes()
  const [mode, setMode] = useState<ThemeMode>()
  return [mode ?? theme['data-bbb-mode'], setMode] as const
}

export function ThemeSwitcherPreview() {
  const [mode, setMode] = usePreviewMode()
  return <ThemeProvider mode={mode} className="utility-preview utility-preview--surface">
    <div className="utility-preview__row"><span>Make yourself at home.</span><ThemeSwitcher value={mode} onChange={setMode} /></div>
    <div className="utility-preview__row"><span className="preview-note">Unavailable</span><ThemeSwitcher value={mode} onChange={setMode} disabled label="Unavailable color mode" /></div>
  </ThemeProvider>
}
export function AppearanceSettingsPreview() {
  const [mode, setMode] = usePreviewMode()
  const [density, setDensity] = useState<Density>('comfortable')
  return <ThemeProvider mode={mode} density={density} className="utility-preview utility-preview--surface">
    <AppearanceSettings mode={mode} onModeChange={setMode} density={density} onDensityChange={setDensity} />
    <Button>Preview action</Button>
  </ThemeProvider>
}
export function AccountMenuPreview() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('Alex Morgan')
  const [editing, setEditing] = useState(false)
  const [signedOut, setSignedOut] = useState(false)
  return <div className="utility-preview utility-preview--surface">
    <AccountMenu open={open} onOpenChange={setOpen} name={signedOut ? 'Guest' : name} email={signedOut ? undefined : 'alex@example.com'}
      actions={signedOut ? [{ id: 'signin', label: 'Sign in to preview' }] : [{ id: 'settings', label: 'Profile settings' }, { id: 'signout', label: 'Sign out' }]}
      onAction={id => { if (id === 'settings') setEditing(value => !value); else { setSignedOut(id === 'signout'); setEditing(false); setOpen(false) } }}>
      {!signedOut && editing && <TextField label="Display name" value={name} onChange={event => setName(event.target.value)} />}
    </AccountMenu>
    <p className="preview-note">Profile and session changes stay in this example.</p>
  </div>
}
export function WorkspaceSwitcherPreview() {
  const root = useRef<HTMLDivElement>(null)
  const [workspaces, setWorkspaces] = useState([{ id: 'personal', label: 'Personal' }, { id: 'studio', label: 'Studio' }, { id: 'archive', label: 'Archive', disabled: true }])
  const [value, setValue] = useState('personal')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  return <div ref={root} className="utility-preview">
    <WorkspaceSwitcher workspaces={workspaces} value={value} onChange={setValue}
      actions={<Button variant="ghost" size="sm" onPress={() => setCreating(!creating)} aria-expanded={creating}>Create workspace</Button>} />
    {creating && <form className="utility-preview" onSubmit={event => {
      event.preventDefault(); if (!name.trim()) return
      const id = `workspace-${workspaces.length}`; setWorkspaces(items => [...items, { id, label: name.trim() }]); setValue(id); setName(''); setCreating(false); requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('button')?.focus())
    }}><TextField label="Workspace name" required value={name} onChange={event => setName(event.target.value)} autoFocus /><Button type="submit" disabled={!name.trim()}>Create</Button></form>}
  </div>
}
export function CopyButtonPreview() {
  return <div className="utility-preview"><span>Good ideas start here.</span><div className="utility-preview__row">
    <CopyButton text="Good ideas start here." /><CopyButton text="Good ideas start here." iconOnly label="Copy invitation" /><CopyButton text="" disabled />
  </div></div>
}
export function CodeBlockPreview() {
  return <CodeBlock language="tsx" code={`import { Button } from './bbb/components/Button/Button'\n\n<Button onPress={() => save()}>Save changes</Button>`} />
}
export function KeyboardShortcutPreview() {
  return <div className="utility-preview"><div className="utility-preview__row">Search <KeyboardShortcut keys={['⌘', 'K']} label="Command K" /></div>
    <div className="utility-preview__row">Save <KeyboardShortcut keys={['Ctrl', 'S']} label="Control S" /></div></div>
}
export function LoadingIndicatorPreview() {
  return <div className="utility-preview"><LoadingIndicator label="Saving changes…" /><LoadingIndicator label="Loading preview" hideLabel /></div>
}
export function StatusIndicatorPreview() {
  return <div className="utility-preview"><StatusIndicator label="Online" tone="success" /><StatusIndicator label="Offline" />
    <StatusIndicator label="Syncing" icon="refresh-cw" /><StatusIndicator label="Needs attention" tone="warning" icon="triangle-alert" /><StatusIndicator label="Connection lost" tone="danger" icon="x" /></div>
}
export function BannerPreview() {
  const [visible, setVisible] = useState(true)
  const restore = useRef<HTMLButtonElement>(null)
  return <div className="utility-preview">
    {visible && <Banner title="You’re working offline" tone="warning" onDismiss={() => { setVisible(false); requestAnimationFrame(() => restore.current?.focus()) }}
      actions={<Button variant="secondary" size="sm" onPress={() => { setVisible(false); requestAnimationFrame(() => restore.current?.focus()) }}>Reconnect</Button>}>Your changes stay on this device until you reconnect.</Banner>}
    <Button ref={restore} variant="ghost" disabled={visible} onPress={() => setVisible(true)}>Show notice</Button>
  </div>
}
export function BulkActionBarPreview() {
  const collectionRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState(['Brand direction', 'Launch checklist', 'Meeting notes'])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  return <div ref={collectionRef} tabIndex={-1} className="utility-preview">
    <BulkActionBar count={selected.length} scope="This collection" onClear={() => setSelected([])}>
      <Button size="sm" disabled={!selected.length} onPress={() => { setItems(items.filter(item => !selected.includes(item))); setMessage(`${selected.length} items archived.`); setSelected([]); requestAnimationFrame(() => { (collectionRef.current?.querySelector<HTMLInputElement>('input') ?? collectionRef.current)?.focus() }) }}>Archive</Button>
    </BulkActionBar>
    {items.map(item => <Checkbox key={item} label={item} isSelected={selected.includes(item)} onChange={checked => setSelected(checked ? [...selected, item] : selected.filter(value => value !== item))} />)}
    <p role="status">{message}</p>
    {!items.length && <Button variant="secondary" onPress={() => { setItems(['Brand direction', 'Launch checklist', 'Meeting notes']); setMessage('Collection restored.') }}>Restore collection</Button>}
  </div>
}
export function NotificationCenterPreview() {
  const [items, setItems] = useState<NotificationItem[]>([{ id: 'review', title: 'Ready for review', description: 'Jamie shared a new direction.', time: 'A moment ago', unread: true }, { id: 'invite', title: 'Welcome to your workspace', unread: false }])
  const [state, setState] = useState('ready')
  const [message, setMessage] = useState('')
  return <div className="utility-preview">
    <SegmentedControl label="Notification example state" value={state} onChange={setState} options={['ready', 'empty', 'loading', 'error'].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} />
    <NotificationCenter items={state === 'empty' ? [] : items} loading={state === 'loading'} error={state === 'error' ? 'Couldn’t load notifications. Try again.' : undefined} onRetry={() => setState('ready')}
      onRead={id => setItems(items => items.map(item => item.id === id ? { ...item, unread: false } : item))}
      onReadAll={() => setItems(items => items.map(item => ({ ...item, unread: false })))} onOpenItem={id => setMessage(`Opened ${items.find(item => item.id === id)?.title}.`)} />
    <p role="status">{message}</p>
  </div>
}
const treeItems = [{ id: 'projects', label: 'Projects', children: [{ id: 'brand', label: 'Brand direction' }, { id: 'launch', label: 'Launch checklist' }] }, { id: 'notes', label: 'Meeting notes' }, { id: 'archive', label: 'Archive', disabled: true }]
export function TreeViewPreview() {
  const [selected, setSelected] = useState('brand')
  return <div className="utility-preview"><TreeView label="Project documents" items={treeItems} selectedId={selected} onSelectionChange={setSelected} defaultExpandedIds={['projects']} />
    <p role="status">Selected: {selected}</p></div>
}
export function SplitPanePreview() {
  const [selected, setSelected] = useState('brand')
  return <SplitPane label="Resize document library" primary={<TreeView label="Document library" items={treeItems} selectedId={selected} onSelectionChange={setSelected} defaultExpandedIds={['projects']} />}>
    <div className="utility-preview utility-preview--surface"><h4>{selected === 'brand' ? 'Brand direction' : selected === 'launch' ? 'Launch checklist' : selected === 'projects' ? 'Projects' : 'Meeting notes'}</h4><p>A little space to collect ideas, make decisions, and keep moving.</p></div>
  </SplitPane>
}
export function ContextMenuPreview() {
  const [message, setMessage] = useState('Right-click the item, or use its actions button.')
  return <div className="utility-preview"><ContextMenu label="File actions" items={[{ id: 'open', label: 'Open document' }, { id: 'duplicate', label: 'Duplicate' }, { id: 'share', label: 'Share', disabled: true }]}
    onAction={id => setMessage(id === 'duplicate' ? 'A copy was added to this preview.' : 'Document opened.')}>
    <Button variant="ghost" onPress={() => setMessage('Document opened.')}>Brand direction</Button>
  </ContextMenu><p role="status">{message}</p></div>
}
export function MediaPreviewExample() {
  const { 'data-bbb-mode': mode, 'data-bbb-brand': brand, style: tokens } = useThemeAttributes()
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [artwork, setArtwork] = useState('')
  useLayoutEffect(() => {
    const style = getComputedStyle(ref.current!)
    const color = (token: string) => style.getPropertyValue(token).trim()
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" rx="32" fill="${color('--bbb-color-canvas')}"/><circle cx="220" cy="180" r="108" fill="${color('--bbb-brand-ember')}"/><path d="M330 72h170v216H330z" fill="${color('--bbb-brand-teal')}"/></svg>`
    setArtwork(`data:image/svg+xml,${encodeURIComponent(svg)}`)
  }, [mode, brand, tokens])
  return <div ref={ref} className="utility-preview">{artwork && <MediaPreview src={failed ? '/missing-preview-image.png' : artwork} alt="BBB shapes in ember and teal" caption="A small study in balance." />}
    <Checkbox label="Show unavailable image" isSelected={failed} onChange={setFailed} /></div>
}
export function CommandMenuPreview() {
  const [message, setMessage] = useState('Choose a destination or an action.')
  return <div className="utility-preview"><CommandPalette title="Workspace commands" trigger={<Button variant="secondary">Find a command</Button>}
    items={[{ id: 'gallery', label: 'Open Gallery', group: 'Navigate', href: '/gallery', description: 'Browse the complete library.' }, { id: 'new', label: 'New document', group: 'Actions', shortcut: ['⌘', 'N'] }, { id: 'export', label: 'Export collection', group: 'Actions', disabled: true }]}
    onAction={id => setMessage(id === 'new' ? 'A new document was created in this preview.' : 'Opening Gallery.')} />
    <p role="status">{message}</p><Link href="/gallery?item=command-palette">Explore the command palette</Link></div>
}
