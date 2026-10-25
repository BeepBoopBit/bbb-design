import { useState } from 'react'
import { CalendarDate } from '@internationalized/date'
import { Button } from '../../components/Button/Button'
import { Link } from '../../components/Link/Link'
import { HoverCard } from '../../components/HoverCard/HoverCard'
import { NavigationMenu } from '../../components/NavigationMenu/NavigationMenu'
import { NativeSelect } from '../../components/NativeSelect/NativeSelect'
import { Separator } from '../../components/Separator/Separator'
import { Select } from '../../components/Select/Select'
import { Dialog } from '../../components/Dialog/Dialog'
import { TextField } from '../../components/TextField/TextField'
import { Table } from '../../components/Table/Table'
import { Calendar, RangeCalendar } from '../../components/Calendar/Calendar'
import { FileUpload } from '../../components/FileUpload/FileUpload'
import type { UploadFile } from '../../components/FileUpload/FileUpload'
import { ComponentDocPage } from './ComponentDocPage'
import type { ComponentGuidance } from './ComponentDocPage'
import type { ComponentPage, CompositionPage } from './componentRoutes'

type LibraryPage = Exclude<ComponentPage, CompositionPage | 'button'>
const guidance: Record<LibraryPage, ComponentGuidance> = {
  'hover-card': {
    use: 'Preview a person, project, or destination before someone follows a link. The card can contain links and buttons. Keep essential information available at the destination, and use Popover when opening the content is the main action.',
    states: 'The preview opens on hover, keyboard focus, or a touch long press. It stays available while the pointer is over the card. Set delay and closeDelay to adjust the timing, placement to choose an edge, or open and onOpenChange for controlled state. Disabled suppresses the preview while leaving its link usable.',
    keyboard: ['Use a focusable link or button that forwards DOM props and its ref. BBB Link and Button work as triggers.', 'Tab focuses the trigger and opens the preview; another Tab enters its interactive content. Escape dismisses it and returns focus to the trigger.', 'Keep the destination link useful on its own. Touch users can hold it for a preview or tap to follow it. Give the card a descriptive title.'],
    api: [['trigger / title', 'Focusable element / string', 'Required'], ['children', 'ReactNode', 'Preview content and optional actions'], ['open / defaultOpen / onOpenChange', 'boolean / boolean / (open) => void', 'Controlled / initial state / callback'], ['disabled', 'boolean', 'false; disables only the preview'], ['delay / closeDelay', 'number (milliseconds)', '600 / 200'], ['placement', 'React Aria Popover placement', 'bottom start'], ['className', 'string', 'Applied to the floating surface']],
  },
  'navigation-menu': {
    use: 'Organize a website’s destinations with direct links and expandable sections. Each section contains labeled groups of links, with optional descriptions. Supply real URLs so visitors can follow links, copy them, or open another tab.',
    states: 'One section is open at a time. currentId marks the current destination, disabled makes a section unavailable, and openId with onOpenChange controls expansion. The panel fits the navigation’s width, stacks its groups in narrow layouts, and scrolls long content. Place the navigation in a container that allows overflow.',
    keyboard: ['Give the nav a label that distinguishes it from other navigation landmarks. Every item and nested link needs a stable, unique id.', 'Tab visits the normal sequence of buttons and links. Enter or Space toggles a section; Arrow Down opens it and focuses its first link.', 'Escape closes a section and returns focus to its button. Moving focus outside or pressing elsewhere closes it. Website links retain native navigation semantics.'],
    api: [['label / items', 'string / (NavigationLink | NavigationSection)[]', 'Required'], ['NavigationLink', '{ id, label, href, description?, target?, rel? }', 'Descriptions appear inside sections'], ['NavigationSection', '{ id, label, groups, disabled? }', 'groups: { label, links: NavigationLink[] }[]'], ['currentId', 'string', 'Adds aria-current="page" to a link'], ['openId / defaultOpenId', 'string | null / string', 'Controlled / initial open section'], ['onOpenChange', '(id: string | null) => void', 'null means closed'], ['className', 'string', 'Applied to the nav']],
  },
  separator: {
    use: 'Separate sections of content with a quiet line. A semantic separator marks a thematic break. Set decorative when spacing or surrounding headings already make the grouping clear.',
    states: 'Horizontal separators fill the available width. Vertical separators stretch to the height of a flex or grid row, with a minimum height of one em. Add spacing through the parent layout or className.',
    keyboard: ['Separators are static and do not need keyboard focus.', 'A semantic separator exposes its orientation to assistive technology. Decorative separators are hidden from the accessibility tree.', 'Use headings for named sections; a line alone does not label a group.'],
    api: [['orientation', "'horizontal' | 'vertical'", 'horizontal'], ['decorative', 'boolean', 'false'], ['className / style / ref', 'Native div attributes', 'Forwarded to the separator']],
  },
  'native-select': {
    use: 'Choose NativeSelect for a straightforward form choice using the browser’s own picker. Pass option and optgroup children, including disabled options. Use Select when you need custom option descriptions, icons, or a consistent styled popup.',
    states: 'All four field styles support labels, hints, errors, and disabled states. value and onChange control the native select; defaultValue initializes it. name, required, form, multiple, size, and ref retain native behavior. onChange receives a DOM event, so read event.target.value for a single selection.',
    keyboard: ['Associate every field with a label. hideLabel keeps that name available to assistive technology.', 'The browser handles keyboard navigation, typeahead, selection, and the mobile picker. Multiple selection follows platform conventions.', 'Hint and error text are associated with the field. Native required validation and form reset work without extra state. Disabled fields are excluded from submission.'],
    api: [['label / hideLabel / hint / error', 'FieldProps', 'Label required'], ['variant', "'filled' | 'outlined' | 'subtle' | 'plain'", 'filled'], ['children', 'option and optgroup elements', 'Native options'], ['value / defaultValue', 'Native select values', 'Controlled / initial selection'], ['onChange', 'ChangeEventHandler<HTMLSelectElement>', 'Native event'], ['multiple / size', 'boolean / number', 'Optional browser listbox'], ['name / required / disabled / ref', 'Native select attributes', 'Forwarded to the select']],
  },
  select: {
    use: 'Choose one option from a styled list. Options have stable string ids and labels, and can include descriptions, leading icons, or a custom renderOption. For browser-owned options and a mobile picker, use NativeSelect. Use Combobox when people need to filter a longer list.',
    states: 'Use defaultValue for an initial choice or value with onChange for controlled selection. Each field style supports a visible or hidden label, hint, error, disabled state, and disabled options. A name makes the choice available to form submission.',
    keyboard: ['Tab focuses the trigger. Enter, Space, or an arrow key opens the list. Arrows move through enabled options; typing finds matching labels.', 'Enter selects an option. Escape closes without changing the current choice and returns focus to the trigger.', 'Keep option labels meaningful even when supplying renderOption; the label supports typeahead and accessible naming. Use required for mandatory choices.'],
    api: [['label / hint / error / hideLabel', 'FieldProps', 'Label required'], ['options', 'SelectOption[]', '{ id, label, description?, leading?, disabled? }'], ['value / defaultValue', 'string | null / string', 'Controlled / initial selection'], ['onChange', '(value: string) => void', 'Selected option id'], ['variant', "'filled' | 'outlined' | 'subtle' | 'plain'", 'filled'], ['disabled / required / name', 'boolean / boolean / string', 'Form behavior'], ['renderOption / placeholder', '(option) => ReactNode / string', 'Custom content / empty value text'], ['ref', 'Ref<HTMLButtonElement>', 'Focuses the trigger']],
  },
  dialog: {
    use: 'Bring a focused task into a modal surface: editing details, reviewing information, or completing a short form. Supply a descriptive title, a Button trigger, and a visible way to finish or cancel. Use ConfirmationDialog for a destructive decision.',
    states: 'Use open with onOpenChange when the application controls visibility. children and footer accept a function receiving close. A footer button can submit a body form with matching form and id attributes. Dialog follows the active theme and density, and scrolls long content.',
    keyboard: ['Opening moves focus inside and makes the background inert. Tab and Shift+Tab stay within the dialog.', 'Escape, the close button, and the backdrop dismiss a normal dialog; closing restores focus to its trigger.', 'Choose initial focus deliberately, for example autoFocus on the first field. For an alertdialog, use ConfirmationDialog and make the decision explicit.'],
    api: [['trigger / title', 'ReactElement / string', 'Required; use BBB Button'], ['description', 'string', 'Optional accessible description'], ['children / footer', 'ReactNode or (close) => ReactNode', 'Body / action area'], ['open / onOpenChange', 'boolean / (open) => void', 'Optional controlled visibility'], ['role', "'dialog' | 'alertdialog'", 'dialog'], ['closeLabel', 'string', 'Localized close button label'], ['className / bodyClassName', 'string', 'Dialog / body styles']],
  },
  table: {
    use: 'Present comparable records with native table semantics. Define columns with renderCell and provide stable row ids and readable row labels. The application owns data loading, sorting, filtering, and pagination; onSortChange reports the requested sort without rearranging your rows.',
    states: 'Show loading skeletons while fetching, an emptyState when no rows match, and selection for bulk actions. Optional hiddenColumnIds, columnWidths, and resize callbacks let the application persist a column layout. Expanded rows are controlled through expandedRowIds and onExpandedRowsChange.',
    keyboard: ['Give the table a clear label and mark a meaningful column as rowHeader. getRowLabel names row controls.', 'Sortable headings are buttons and expose aria-sort. Checkboxes follow normal keyboard behavior, and disabled rows remain unavailable for selection.', 'The table scrolls horizontally when needed; its scroll region is keyboard focusable. Header selection changes selectable rows on the current page while preserving selected ids from other pages.'],
    api: [['label / rows / columns', 'string / Row[] / TableColumn<Row>[]', 'Required'], ['getRowId / getRowLabel', '(row: Row) => string', 'Stable identity / accessible name'], ['TableColumn', '{ id, label, renderCell, rowHeader?, sortable?, align? }', 'align: start or end'], ['sort / onSortChange', 'TableSort / (sort) => void', '{ column, direction: ascending | descending }'], ['selection', '{ selectedIds, onChange, isDisabled? }', 'ReadonlySet<string> / Set<string> callback'], ['loading / emptyState', 'boolean / ReactNode', 'false / default empty state'], ['hiddenColumnIds / columnWidths', 'ReadonlySet<string> / Record<string, number>', 'Visibility / pixel widths'], ['onColumnResize', '(id: string, width: number) => void', 'Controlled widths'], ['expandedRowIds / onExpandedRowsChange / renderExpandedRow', 'ReadonlySet<string> / (ids) => void / (row) => ReactNode', 'Controlled row details']],
  },
  calendar: {
    use: 'Let someone choose a date in an inline month view. Calendar and RangeCalendar use date values from @internationalized/date. Use DatePicker or DateRangePicker when you also need an editable field and a popover.',
    states: 'Control value with onChange or provide defaultValue. Use minValue, maxValue, and isDateUnavailable to constrain dates. React Aria’s isDisabled and isReadOnly props retain the calendar’s presentation. The surrounding LocaleProvider controls language, date ordering, and writing direction.',
    keyboard: ['Give each calendar an aria-label or aria-labelledby. A focused date is separate from the selected date.', 'Arrow keys move between days, Page Up and Page Down move between months, and Enter or Space selects a date. RangeCalendar supports choosing a start and end.', 'Unavailable and out-of-range dates are announced and cannot be selected. Month controls, focus rings, and the date grid remain usable in compact and right-to-left layouts.'],
    api: [['aria-label / aria-labelledby', 'string', 'Accessible calendar name'], ['value / defaultValue / onChange', 'DateValue / DateValue / (value) => void', 'RangeCalendar uses { start, end }'], ['minValue / maxValue', 'DateValue', 'Inclusive date bounds'], ['isDateUnavailable', '(date: DateValue) => boolean', 'Marks unavailable days'], ['isDisabled / isReadOnly', 'boolean', 'false'], ['className', 'string', 'Applied to the calendar'], ['Other calendar props', 'React Aria CalendarProps / RangeCalendarProps', 'Forwarded except children']],
    extraCode: `import { CalendarDate } from '@internationalized/date'
import { RangeCalendar } from './bbb/components/Calendar/Calendar'

<RangeCalendar aria-label="Trip dates" defaultValue={{
  start: new CalendarDate(2026, 9, 22),
  end: new CalendarDate(2026, 9, 25),
}} />`,
  },
  'file-upload': {
    use: 'Collect files through a picker or drag and drop, then show their progress and results. The component validates accepted types and file sizes, and reports accepted files through onAdd. Your application owns the file list and the upload request; this component does not send files anywhere.',
    states: 'Each UploadFile has a stable id, a File, and a ready, uploading, complete, or error status. Uploading items may include progress from 0 to 100. Failed items can include an error and expose a retry action when onRetry is supplied. Use maxSize in bytes and multiple=false for a single file per addition.',
    keyboard: ['The visible choose-files button opens the native picker; dropping files is an alternative, not the only way to add them.', 'Rejections are announced. Remove and retry controls include the filename in their accessible names. Hints and errors explain the input requirements.', 'Validate files again on your server. accept and maxSize provide client feedback; they are not security checks. A single-file product should replace its existing list in onAdd.'],
    api: [['label / files', 'string / UploadFile[]', 'Required; consumer-owned list'], ['UploadFile', '{ id, file, status, progress?, error? }', 'status: ready | uploading | complete | error'], ['onAdd / onRemove', '(files: File[]) => void / (id: string) => void', 'Required; update the controlled list'], ['onRetry', '(id: string) => void', 'Optional retry action'], ['accept / maxSize', 'string / number (bytes)', 'MIME types or extensions / optional limit'], ['multiple / disabled', 'boolean', 'true / false'], ['hint / error / className', 'string', 'Feedback / wrapper styles']],
  },
}

function FileStates() {
  const [files, setFiles] = useState<UploadFile[]>(() => [
    { id: 'ready', file: new File(['Draft'], 'brief.txt', { type: 'text/plain' }), status: 'ready' },
    { id: 'error', file: new File(['Review'], 'review.txt', { type: 'text/plain' }), status: 'error', error: 'This example is ready to retry.' },
  ])
  return <FileUpload label="Upload states" files={files} accept=".txt" hint="Local examples only. Retrying returns a file to the ready state."
    onAdd={incoming => setFiles(previous => [...previous, ...incoming.map(file => ({ id: crypto.randomUUID(), file, status: 'ready' as const }))])}
    onRemove={id => setFiles(previous => previous.filter(file => file.id !== id))}
    onRetry={id => setFiles(previous => previous.map(file => file.id === id ? { ...file, status: 'ready', error: undefined } : file))} />
}

function TableStates() {
  const [loading, setLoading] = useState(false)
  return <div className="library-preview"><Button size="sm" variant="secondary" onPress={() => setLoading(value => !value)}>{loading ? 'Show empty table' : 'Show loading table'}</Button>
    <Table label="Project results" rows={[] as { id: string; name: string }[]} columns={[{ id: 'name', label: 'Project', rowHeader: true, renderCell: row => row.name }]}
      getRowId={row => row.id} getRowLabel={row => row.name} loading={loading} emptyState={<p>No projects match these filters.</p>} />
  </div>
}

function StateExamples({ id }: { id: LibraryPage }) {
  switch (id) {
    case 'hover-card': return <HoverCard placement="top" delay={0} title="A quick introduction" trigger={<Button variant="secondary">Preview on focus</Button>}><p>This preview opens without a hover delay.</p><Link href="/getting-started">Read the introduction</Link></HoverCard>
    case 'navigation-menu': return <NavigationMenu label="Project navigation" currentId="overview" items={[
      { id: 'overview', label: 'Overview', href: '/components/navigation-menu#states' },
      { id: 'resources', label: 'Resources', groups: [{ label: 'Reference', links: [{ id: 'api', label: 'API reference', href: '#api', description: 'Props and defaults for this component.' }] }] },
      { id: 'soon', label: 'Coming soon', groups: [], disabled: true },
    ]} />
    case 'separator': return <div className="library-preview"><p>A semantic break</p><Separator /><div className="library-preview__row"><span>Details</span><Separator decorative orientation="vertical" /><span>Activity</span><Separator decorative orientation="vertical" /><span>History</span></div></div>
    case 'native-select': return <div className="library-preview"><NativeSelect variant="outlined" label="Required workspace" defaultValue="" required error="Choose a workspace."><option value="" disabled>Choose a workspace</option><option>Personal</option><option>Team</option></NativeSelect><NativeSelect label="Managed region" disabled defaultValue="Manila"><option>Manila</option></NativeSelect><NativeSelect label="Available days" multiple size={3} defaultValue={['Monday']} hint="Use your platform’s modifier keys to select more than one."><option>Monday</option><option>Tuesday</option><option>Wednesday</option></NativeSelect></div>
    case 'select': return <div className="library-preview"><Select variant="outlined" label="Workspace" placeholder="Choose a workspace" error="Choose where to save this project." options={[{ id: 'personal', label: 'Personal', description: 'Only you can access these projects.' }, { id: 'team', label: 'Team', description: 'Share with everyone in your workspace.' }]} /><Select variant="subtle" label="Managed plan" disabled defaultValue="team" options={[{ id: 'team', label: 'Team plan' }]} /></div>
    case 'dialog': return <Dialog title="Name your project" description="You can change this later." trigger={<Button variant="secondary">Open form dialog</Button>}
      footer={close => <><Button variant="secondary" onPress={close}>Cancel</Button><Button type="submit" form="docs-project-form">Save project</Button></>}>
      {close => <form id="docs-project-form" onSubmit={event => { event.preventDefault(); close() }}><TextField autoFocus label="Project name" name="name" required defaultValue="A new idea" /></form>}
    </Dialog>
    case 'table': return <TableStates />
    case 'calendar': return <div className="library-preview"><Calendar aria-label="Available appointment dates" defaultValue={new CalendarDate(2026, 9, 22)} minValue={new CalendarDate(2026, 9, 20)} maxValue={new CalendarDate(2026, 10, 10)} isDateUnavailable={date => date.day === 24} /><RangeCalendar aria-label="Trip dates" defaultValue={{ start: new CalendarDate(2026, 9, 22), end: new CalendarDate(2026, 9, 25) }} /></div>
    case 'file-upload': return <FileStates />
  }
}

export default function LibraryDocs({ id }: { id: LibraryPage }) {
  return <ComponentDocPage id={id} info={guidance[id]}><StateExamples id={id} /></ComponentDocPage>
}
