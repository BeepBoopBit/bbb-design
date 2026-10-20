/** Small adoption examples; full working Gallery source is available alongside them. */
export const usageExamples: Record<string, string> = {
  ButtonPreview: `import { Button } from './bbb/components/Button/Button'

<Button onPress={() => console.log('Saved')}>Save changes</Button>
<Button variant="secondary">Cancel</Button>
<Button loading>Saving…</Button>`,
  TextFieldPreview: `import { TextField } from './bbb/components/TextField/TextField'

<TextField label="Project name" name="project" hint="A name your team will recognize." />
<TextField variant="outlined" label="Project name" error="Enter a project name." />`,
  SelectPreview: `import { Select } from './bbb/components/Select/Select'

<Select label="Priority" defaultValue="normal" options={[
  { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High' },
]} />`,
  DialogPreview: `import { Button } from './bbb/components/Button/Button'
import { Dialog } from './bbb/components/Dialog/Dialog'

<Dialog title="Project details" trigger={<Button>Open details</Button>}>
  <p>Project information goes here.</p>
</Dialog>`,
  FieldVariantsPreview: `import { TextField } from './bbb/components/TextField/TextField'
import { Select } from './bbb/components/Select/Select'
import { Combobox } from './bbb/components/Combobox/Combobox'
import { Textarea } from './bbb/components/Textarea/Textarea'

// filled: inset labels; outlined: everyday forms;
// subtle: supporting controls; plain: toolbars and inline editing.
<TextField variant="outlined" label="Project name" placeholder="A new idea" />
<Select variant="subtle" label="Priority" defaultValue="normal"
  options={[{ id: 'normal', label: 'Normal' }, { id: 'high', label: 'High' }]} />
<Combobox variant="outlined" label="Assignee"
  options={[{ id: 'alex', label: 'Alex Morgan' }]} />
<Textarea variant="outlined" label="Notes" />`,
  SearchFieldPreview: `import { useState } from 'react'
import { SearchField } from './bbb/components/SearchField/SearchField'

export function LibrarySearch() {
  const [query, setQuery] = useState('')
  return <SearchField label="Search documents" placeholder="Search documents"
    value={query} onChange={setQuery} />
}

// For a busy surface, use variant="outlined".
// For an embedded toolbar filter, use variant="plain".`,
  ThemeSwitcherPreview: `import { useState } from 'react'
import { ThemeProvider } from './bbb/components/ThemeProvider/ThemeProvider'
import { ThemeSwitcher } from './bbb/components/ThemeSwitcher/ThemeSwitcher'
import type { ThemeMode } from './bbb/components/ThemeProvider/theme'

export function Appearance() {
  const [mode, setMode] = useState<ThemeMode>('system')
  return <ThemeProvider mode={mode}>
    <ThemeSwitcher value={mode} onChange={setMode} />
  </ThemeProvider>
}`,
  AppearanceSettingsPreview: `import { AppearanceSettings } from './bbb/components/AppearanceSettings/AppearanceSettings'

<AppearanceSettings
  mode={mode} onModeChange={setMode}
  density={density} onDensityChange={setDensity}
/>`,
  AccountMenuPreview: `import { AccountMenu } from './bbb/components/AccountMenu/AccountMenu'

<AccountMenu name={user.name} email={user.email}
  actions={[
    { id: 'profile', label: 'Profile settings' },
    { id: 'signout', label: 'Sign out' },
  ]}
  onAction={handleAccountAction}
/>`,
  WorkspaceSwitcherPreview: `import { WorkspaceSwitcher } from './bbb/components/WorkspaceSwitcher/WorkspaceSwitcher'

<WorkspaceSwitcher
  workspaces={[{ id: 'personal', label: 'Personal' }, { id: 'team', label: 'Team' }]}
  value={workspaceId}
  onChange={setWorkspaceId}
/>`,
  CopyButtonPreview: `import { CopyButton } from './bbb/components/CopyButton/CopyButton'

<CopyButton text={invitationUrl} label="Copy invitation" />`,
  CodeBlockPreview: `import { CodeBlock } from './bbb/components/CodeBlock/CodeBlock'

<CodeBlock language="tsx" code={'<Button>Save changes</Button>'} />`,
  KeyboardShortcutPreview: `import { KeyboardShortcut } from './bbb/components/KeyboardShortcut/KeyboardShortcut'

<KeyboardShortcut keys={['⌘', 'K']} label="Command K" />`,
  LoadingIndicatorPreview: `import { LoadingIndicator } from './bbb/components/LoadingIndicator/LoadingIndicator'

<LoadingIndicator label="Saving changes…" />`,
  StatusIndicatorPreview: `import { StatusIndicator } from './bbb/components/StatusIndicator/StatusIndicator'

<StatusIndicator label="Online" tone="success" live />`,
  BannerPreview: `import { Banner } from './bbb/components/Banner/Banner'
import { Button } from './bbb/components/Button/Button'

<Banner title="You’re working offline" tone="warning"
  actions={<Button onPress={reconnect}>Reconnect</Button>}
  onDismiss={dismissNotice}>
  Your changes stay on this device until you reconnect.
</Banner>`,
  BulkActionBarPreview: `import { BulkActionBar } from './bbb/components/BulkActionBar/BulkActionBar'
import { Button } from './bbb/components/Button/Button'

<BulkActionBar count={selected.length} scope="This collection"
  onClear={() => setSelected([])}>
  <Button disabled={!selected.length} onPress={archiveSelected}>Archive</Button>
</BulkActionBar>`,
  NotificationCenterPreview: `import { NotificationCenter } from './bbb/components/NotificationCenter/NotificationCenter'

<NotificationCenter items={notifications}
  onRead={markRead} onReadAll={markAllRead}
  onOpenItem={openNotification}
  loading={loading} error={error} onRetry={reload}
/>`,
  SplitPanePreview: `import { SplitPane } from './bbb/components/SplitPane/SplitPane'

<SplitPane label="Resize library" primary={<DocumentList />}>
  <DocumentEditor />
</SplitPane>`,
  TreeViewPreview: `import { TreeView } from './bbb/components/TreeView/TreeView'

<TreeView label="Documents"
  items={[{ id: 'folder', label: 'Projects', children: [{ id: 'draft', label: 'Draft' }] }]}
  selectedId={selectedId} onSelectionChange={setSelectedId}
  defaultExpandedIds={['folder']}
/>`,
  ContextMenuPreview: `import { ContextMenu } from './bbb/components/ContextMenu/ContextMenu'
import { Button } from './bbb/components/Button/Button'

<ContextMenu label="File actions"
  items={[{ id: 'open', label: 'Open' }, { id: 'copy', label: 'Duplicate' }]}
  onAction={handleFileAction}>
  <Button variant="ghost" onPress={openFile}>Brand direction</Button>
</ContextMenu>`,
  MediaPreviewExample: `import { MediaPreview } from './bbb/components/MediaPreview/MediaPreview'

<MediaPreview src="/images/study.jpg"
  alt="Ember and teal shapes" caption="A study in balance." />`,
  CommandMenuPreview: `import { CommandPalette } from './bbb/components/CommandPalette/CommandPalette'
import { Button } from './bbb/components/Button/Button'

<CommandPalette title="Workspace commands"
  trigger={<Button>Find a command</Button>}
  items={[
    { id: 'home', label: 'Home', group: 'Navigate', href: '/' },
    { id: 'new', label: 'New document', group: 'Actions', shortcut: ['⌘', 'N'] },
  ]}
  onAction={handleCommand}
/>`,
}
