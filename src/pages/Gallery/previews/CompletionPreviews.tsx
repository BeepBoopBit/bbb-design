import { useState } from 'react'
import { CalendarDate } from '@internationalized/date'
import { Button } from '../../../components/Button/Button'
import { Badge } from '../../../components/Badge/Badge'
import { TextField } from '../../../components/TextField/TextField'
import { PasswordField } from '../../../components/PasswordField/PasswordField'
import { VerificationCode } from '../../../components/VerificationCode/VerificationCode'
import { DescriptionList } from '../../../components/DescriptionList/DescriptionList'
import { Toolbar } from '../../../components/Toolbar/Toolbar'
import { InlineEdit } from '../../../components/InlineEdit/InlineEdit'
import { CommandPalette } from '../../../components/CommandPalette/CommandPalette'
import { Select } from '../../../components/Select/Select'
import { ThemeProvider } from '../../../components/ThemeProvider/ThemeProvider'
import { DatePicker } from '../../../components/DatePicker/DatePicker'
import { NumberField } from '../../../components/NumberField/NumberField'
import { Pagination } from '../../../components/Pagination/Pagination'
import { Dialog } from '../../../components/Dialog/Dialog'
import { Icon } from '../../../components/Icon/Icon'
import { useMessages } from '../../../components/LocaleProvider/locale'
import './CompletionPreviews.css'

export function PasswordFieldPreview() {
  const [state, setState] = useState('default')
  return <div className="field-preview">
    <PasswordField label="Workspace password" defaultValue="A quiet little secret" disabled={state === 'disabled'}
      error={state === 'error' ? 'Enter the password for this workspace.' : undefined} hint="Reveal your entry without losing your place." />
    <Select label="Password example state" value={state} onChange={setState} options={[
      { id: 'default', label: 'Default' }, { id: 'error', label: 'Error' }, { id: 'disabled', label: 'Disabled' },
    ]} />
  </div>
}

export function VerificationCodePreview() {
  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [state, setState] = useState('default')
  return <form className="field-preview" noValidate onSubmit={event => { event.preventDefault(); setSubmitted(true) }}>
    <VerificationCode label="Sign-in code" value={code} onChange={value => { setCode(value); setSubmitted(false) }} required disabled={state === 'disabled'}
      error={submitted && code.length !== 6 ? 'Enter all six digits.' : undefined} hint="Paste a six-digit code, including one with spaces." />
    <Button type="submit" disabled={state === 'disabled'}>Verify sign-in code</Button>
    <Select label="Verification code example state" value={state} onChange={setState} options={[{ id: 'default', label: 'Default' }, { id: 'disabled', label: 'Disabled' }]} />
    <p role="status" className="preview-note">{submitted && code.length === 6 ? 'Code accepted for this preview.' : 'One field. Autofill and paste stay familiar.'}</p>
  </form>
}

export function DescriptionListPreview() {
  const [layout, setLayout] = useState('rows')
  return <div className="system-preview">
    <DescriptionList layout={layout as 'rows' | 'stacked'} aria-label="Workspace details" items={[
      { id: 'name', label: 'Workspace', value: 'The creative team' },
      { id: 'owner', label: 'Owner', value: 'Alex Morgan' },
      { id: 'status', label: 'Status', value: <Badge tone="success" dot>Active</Badge> },
      { id: 'access', label: 'Access', value: 'By invitation, with workspace administrator approval' },
    ]} />
    <Select label="Details layout" value={layout} onChange={setLayout} options={[{ id: 'rows', label: 'Rows' }, { id: 'stacked', label: 'Stacked' }]} />
  </div>
}

export function ToolbarPreview() {
  const [message, setMessage] = useState('Use arrow keys to move between actions.')
  return <div className="system-preview">
    <Toolbar label="Document actions" overflowActions={[{ id: 'duplicate', label: 'Duplicate' }, { id: 'archive', label: 'Archive' }]}
      onOverflowAction={id => setMessage(id === 'duplicate' ? 'Document duplicated in this preview.' : 'Document archived in this preview.')}>
      <Button size="sm" onPress={() => setMessage('Changes saved in this preview.')}><Icon name="check" />Save</Button>
      <Button size="sm" variant="secondary" onPress={() => setMessage('Sharing options selected.')}><Icon name="user-round" />Share</Button>
      <Button size="sm" variant="ghost" disabled>Publish</Button>
    </Toolbar>
    <p role="status">{message}</p>
  </div>
}

export function InlineEditPreview() {
  const [name, setName] = useState('Design library')
  return <div className="system-preview">
    <InlineEdit label="Project name" value={name} onSave={setName} validate={value => value.trim() ? undefined : 'Enter a project name.'} />
    <p>Choose the name to edit it. Enter saves; Escape cancels.</p>
  </div>
}

export function CommandPalettePreview() {
  const [action, setAction] = useState('Find a destination or start something new.')
  return <div className="system-preview">
    <CommandPalette title="Quick actions" shortcut="k"
      trigger={<Button variant="secondary" aria-keyshortcuts="Control+k Meta+k"><Icon name="search" />Open commands</Button>}
      items={[
        { id: 'projects', label: 'Go to projects', group: 'Navigate', leading: <Icon name="box" />, keywords: ['workspace'] },
        { id: 'settings', label: 'Open settings', group: 'Navigate', leading: <Icon name="layers" /> },
        { id: 'create', label: 'Create a project', group: 'Create', description: 'Start with a blank workspace.', leading: <Icon name="plus" /> },
        { id: 'invite', label: 'Invite a teammate', group: 'Create', disabled: true, description: 'Available to workspace administrators.', leading: <Icon name="user-round" /> },
      ]} onAction={id => setAction(`Selected ${id} in this preview.`)} />
    <p>⌘ K or Ctrl K opens commands when you’re outside a text field.</p>
    <p role="status">{action}</p>
  </div>
}

export function ContentPreview() {
  const [expanded, setExpanded] = useState(false)
  return <div className="system-preview">
    <header><span className="system-eyebrow">A familiar voice</span><h4>Clear words. Useful feedback.</h4><p>Make the next action understandable, and explain what happens afterward.</p></header>
    <DescriptionList items={[
      { id: 'actions', label: 'Name the action', value: '“Save changes”, “Invite teammate”, “Delete project”. Use specific verbs.' },
      { id: 'errors', label: 'Help people recover', value: '“Enter an email address, such as alex@example.com.” Keep the error beside its field.' },
      { id: 'confirmation', label: 'Explain the consequence', value: '“Delete Design library? Its files will be removed for everyone.” Match the final button to that action.' },
      { id: 'terminology', label: 'Stay consistent', value: 'Use the same name for an object in navigation, fields, feedback, and help.' },
    ]} />
    <div className="content-preview__example">
      <p className={expanded ? '' : 'content-preview__truncated'}>Planning accessibility and notifications across every workspace in your organization</p>
      <Button variant="ghost" size="sm" aria-expanded={expanded} onPress={() => setExpanded(!expanded)}>{expanded ? 'Show less' : 'Read full title'}</Button>
    </div>
    <p>Wrap essential labels and errors. If secondary text is shortened, provide a way to read it in full.</p>
  </div>
}

function LocalizedExample() {
  const { locale, t } = useMessages()
  const arabic = locale.startsWith('ar')
  const [page, setPage] = useState(1)
  const [date, setDate] = useState<CalendarDate | null>(new CalendarDate(2026, 9, 22))
  return <section className="locale-preview" aria-label="Localized workspace example">
    <header><h4>{arabic ? 'مساحة عمل تناسبك' : 'A workspace that fits you'}</h4><p>{arabic ? 'التفاصيل والتنسيقات تتبع اللغة المختارة.' : 'Details and formatting follow the selected language.'}</p></header>
    <TextField label={arabic ? 'الاسم الكامل لمساحة العمل والإشعارات الخاصة بالفريق' : 'Full workspace name and team notification preferences'} defaultValue={arabic ? 'فريق التصميم' : 'Design team'} />
    <Select label={arabic ? 'مستوى الوصول' : 'Access level'} options={arabic ? [{ id: 'team', label: 'الفريق' }, { id: 'private', label: 'خاص' }] : [{ id: 'team', label: 'Team' }, { id: 'private', label: 'Private' }]} />
    <DatePicker label={arabic ? 'تاريخ البدء' : 'Start date'} value={date} onChange={setDate} />
    <NumberField label={arabic ? 'الميزانية الشهرية' : 'Monthly budget'} defaultValue={1250} formatOptions={{ style: 'currency', currency: arabic ? 'EGP' : 'USD' }} />
    <DescriptionList items={[{ id: 'date', label: arabic ? 'آخر تحديث' : 'Last updated', value: new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date('2026-09-22T12:00:00Z')) }]} />
    <Pagination page={page} pageSize={5} totalItems={20} onPageChange={setPage} />
    <Dialog title={arabic ? 'تفاصيل مساحة العمل' : 'Workspace details'} trigger={<Button variant="secondary">{arabic ? 'عرض التفاصيل' : 'Show details'}</Button>}
      footer={close => <Button onPress={close}>{t('save')}</Button>}>
      <p>{arabic ? 'تحتفظ هذه النافذة باللغة واتجاه القراءة.' : 'This overlay retains the language and reading direction.'}</p>
    </Dialog>
  </section>
}

export function InternationalizationPreview() {
  const [locale, setLocale] = useState('en-US')
  return <div className="system-preview internationalization-preview">
    <Select label="Preview language" value={locale} onChange={setLocale} options={[{ id: 'en-US', label: 'English · United States' }, { id: 'ar-EG', label: 'العربية · مصر' }]} />
    <ThemeProvider locale={locale} key={locale}><LocalizedExample /></ThemeProvider>
    <p>Language, reading direction, date conventions, numbers, and shared control labels travel together—even into overlays.</p>
  </div>
}
