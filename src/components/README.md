# BBB component APIs

Import components from their own directories. All styles use the shared BBB tokens.
Gallery contains live examples, including keyboard interaction and relevant
validation, loading, disabled, and empty states.

React Aria supplies the behavior for composite controls and overlays. BBB supplies
the visual treatment. TextField and Textarea use native form elements. Select uses a styled listbox with
a hidden native select for form submission and autofill.
[React Aria documentation](https://react-aria.adobe.com/) describes the underlying
selection and accessibility props exposed by the wrappers.

## Grouped controls and bottom drawers

Added in source 0.3.0. Each component has a dedicated `/components/<name>` page
with working examples, installation, keyboard guidance, and an API reference.
The CLI names are `button-group`, `toggle`, `toggle-group`, `input-group`,
`collapsible`, and `drawer`.

**ButtonGroup** accepts a required `label`, `orientation` (`horizontal` by default,
or `vertical`), and native div attributes/ref. Compose shared Buttons or a
DropdownMenu trigger directly inside it; use matching sizes and variants. Its
children retain ordinary Tab order. Use Toolbar for arrow navigation. Button is
re-exported from ButtonGroup and included in its source bundle. Install
`dropdown-menu` too when composing a split button.

**Toggle** accepts `isSelected` / `defaultSelected`, `onChange(boolean)`, `disabled`,
`variant` (`ghost` or `secondary`), `size` (`sm` or `md`), `iconOnly`, and a button
ref. It exposes pressed state and supports Enter/Space. Keep its label stable and
provide `aria-label` for an icon-only toggle. Use Checkbox for form values; Toggle
does not submit selection as form data.

**ToggleGroup** accepts a required `label`, `selectionMode` (`multiple` by default,
or `single`), `selectedKeys` / `defaultSelectedKeys`, `onSelectionChange(Set<Key>)`,
`disallowEmptySelection`, `orientation`, and `disabled`. Compose Toggle children
with unique `id` values; Toggle is re-exported and bundled. The group owns its
children's selection. Multiple selection uses toolbar semantics; single
selection uses radio semantics. Arrows navigate enabled options, following the
locale and orientation. Optional single selection may clear the last choice.

**InputGroup** shares FormField's `label`, `hideLabel`, `hint`, `error`, and
`variant`. `startAddon` / `endAddon` place text or controls inline; `header` /
`footer` place content inside the same field surface. Set `multiline` to render a
textarea. Native control props and refs are forwarded to the corresponding input
or textarea. Native validation, form submission/reset, and read-only states work
as usual. Addon text does not become part of the accessible description: include
important units in the label or hint. Give addon controls their own labels and
disabled states. Extra buttons should only use `type="submit"` intentionally.

**Collapsible** requires `label` and `children`. It accepts `open` / `defaultOpen`,
`onOpenChange(boolean)`, `disabled`, `className`, and a root div ref. The default
trigger includes a disclosure chevron. Supply a BBB Button as `trigger` for custom
content; Collapsible assigns its trigger slot. Hidden contents stay mounted to
preserve state, while leaving the tab order and accessibility tree. Use Accordion
for a coordinated group of disclosures.

**Drawer** uses Dialog's `trigger`, `title`, `description`, `open`, `onOpenChange`,
`children`, `footer`, `closeLabel`, `className`, and `bodyClassName`. It opens from
the bottom, fits its content, caps height to the viewport, and scrolls the body
with persistent header/footer. Body and footer accept `(close) => ReactNode`.
Focus is contained while open and returns to the trigger after dismissal. Escape,
backdrop, and the visible close button dismiss it. Theme/locale context passes
through the portal; motion preferences and safe-area padding are respected.
This version does not provide swipe dismissal or snap points. Sheet continues to
provide start/end placement.

## Actions and forms

| Component  | Main props                                                                                                                                           | Behavior                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button     | `variant`: primary / secondary / ghost / danger; `size`: sm / md; `iconOnly`; `loading`; `disabled`; `onPress`; `ref`                                | Defaults to `type="button"`; `type="submit"` works in forms. Existing `onClick` handlers remain supported. Loading disables activation and sets `aria-busy`. Supply `aria-label` for an icon-only button. |
| TextField  | `label`, `hideLabel`, `hint`, `error`, `leadingIcon`, `trailingAction`                                                                               | Native input attributes and ref; associated label and feedback.                                                                                                                                           |
| Select     | `label`, `options`, `value` / `defaultValue`, `onChange(value)`, `placeholder`, `hideLabel`, `hint`, `error`, `name`, `required`, `disabled`, `ref`  | Options have string `id`, `label`, and optional `disabled`. Uses the shared dropdown surface, arrow keys, typeahead, Escape, and focus return. `ref` targets the trigger button.                          |
| Textarea   | `label`, `hideLabel`, `hint`, `error`; native textarea attributes and ref                                                                            | Multiline, vertically resizable input; supports `maxLength`, `rows`, required, read-only, and disabled states.                                                                                            |
| Checkbox   | `label`, `description`, `isSelected` / `defaultSelected`, `isIndeterminate`, `onChange(boolean)`, `disabled`                                         | Native checkbox semantics, Space activation, mixed selection, `name` / `value`, and `isRequired`.                                                                                                         |
| RadioGroup | `label`, `options`, `value` / `defaultValue`, `onChange(value)`, `hint`, `error`, `disabled`                                                         | Options have `value`, `label`, optional `description`, and `disabled`. Arrow keys choose among enabled options. Supports `name` and `isRequired`.                                                         |
| Switch     | `label`, `description`, `checked` / `defaultChecked`, `onChange(event)`, `disabled`                                                                  | Native checkbox with switch semantics; supports form attributes and input ref.                                                                                                                            |
| Combobox   | `label`, `options`, `selectedKey` / `defaultSelectedKey`, `onSelectionChange`, `placeholder`, `hint`, `error`, `disabled`, `loading`, `emptyMessage` | Options have string `id`, `label`, and optional `disabled`. Filters by text; arrows and Enter select; Escape dismisses. Supports `name` and `isRequired`. Uses `null` for no selection.                   |

Checkbox also accepts `hideLabel` for selection columns. It preserves the required
accessible `label`; use a distinct row name such as “Select Alex Morgan.”

Use `required` on TextField, Select, and Textarea. Checkbox,
RadioGroup, and Combobox expose React Aria's `isRequired` naming. `error` provides
associated custom feedback and invalid semantics; it does not replace application
validation. Combobox accepts only listed values by default. Provide an empty
`options` array with `loading` to display its loading message; the parent owns data
fetching and selection. Disabled options remain visible and cannot be selected.

```tsx
<Select
  label="Priority"
  name="priority"
  defaultValue="normal"
  options={[
    { id: 'low', label: 'Low' },
    { id: 'normal', label: 'Normal' },
    { id: 'high', label: 'High' },
  ]}
/>

<Combobox
  label="Owner"
  options={[{ id: 'alex', label: 'Alex Morgan' }]}
  selectedKey={owner}
  onSelectionChange={key => setOwner(key === null ? null : String(key))}
/>
```

Select now accepts `options` instead of native `option` children. Its `onChange`
receives the selected string ID, not a DOM event; use `null` as the controlled
`value` to clear selection. Existing Gallery consumers have been migrated.

TextField, Textarea, Select, Combobox, NumberField, MultiSelect, DatePicker,
DateRangePicker, TimePicker, and TagField accept `variant?: FieldVariant`.
PasswordField and VerificationCode inherit it from TextField. Choose a treatment
for the task, independently of the theme's comfortable/compact density:

| Variant | Labels and surface | Use case |
| --- | --- | --- |
| `filled` (default) | Persistent inset label and a quiet fill | Prominent forms and settings |
| `outlined` | Label above a slim surface with a visible edge | Everyday forms |
| `subtle` | Label above a slim, softly filled surface | Supporting controls and filters |
| `plain` | Label above a transparent surface with focus/error feedback | Embedded toolbars and inline editing |

Labels stay in normal flow and wrap without covering content. Surface padding is
part of the hit area; clicking it focuses the input or opens Select. `hideLabel`
keeps the accessible label for utility controls; use it on a Select when its
selected value gives a filter enough visible context. Field styles in Foundations
demonstrates the whole family; the individual field previews and Profile form
also let you change styles without resetting values.

Use **SearchField** for search bars rather than a labeled form input. It accepts
`label`, `value` / `defaultValue`, `onChange(value: string)`, `placeholder`,
`variant?: 'subtle' | 'outlined' | 'plain'` (default `subtle`), `clearLabel`, and
native input props/ref, including `name`, `disabled`, `readOnly`, `hint`, and
`error`. The label stays accessible while the compact rounded surface shows a
search icon, value, and clear action. Clearing returns focus to the input;
Escape clears a nonempty editable search before an enclosing dialog dismisses.
Uncontrolled fields support native form reset. Filtering, result announcements,
and submission belong to the consumer. `--bbb-search-radius` defaults to the
shared full radius; override it through ThemeProvider for another shape.

```tsx
<TextField variant="outlined" label="Project name" />
<Select variant="subtle" hideLabel label="Status" options={statuses} />
<SearchField label="Search documents" placeholder="Search documents"
  value={query} onChange={setQuery} />
```

CommandSearch uses the same compact surface with an accessible hidden label and
accepts `variant?: 'subtle' | 'outlined' | 'plain'`. InlineEdit uses a plain field
with a hidden label while editing.
When composing with FieldSurface directly, pass its label through the `label`
slot so it follows the selected variant; its default remains filled.

Hover, focus, and validation use one continuous edge. Focus strengthens that edge
inward without shifting layout; an invalid field retains its error color while
focused. Increased-contrast preferences add a stronger resting edge. The Profile
form preview demonstrates composition, local saving, discarding, and validation
with the actual shared controls. Checkboxes animate their mark, and radios use grouped rows
with a raised selected surface. Radio hover uses the supporting Teal tint and a
subtle edge on both selected and unselected rows; the selected dot stays visible.
Keyboard focus keeps its stronger Teal edge, including while hovered. Disabled
rows do not gain hover styling.

## Identity, content, and settings

| Component | Main props | Behavior |
| --- | --- | --- |
| Avatar | `name`, `src`, `size`: sm / md / lg, `tone`: neutral / teal / ember, `decorative` | 32/40/48px sizes. First and last initials stay beneath the image while it loads; failed images fall back to initials. An empty name uses a person icon. Changing `src` attempts the new image. |
| AvatarGroup | `label`, `members`, `maxVisible` (default 3), `size` | Members have stable `id`, `name`, optional `src` and `tone`. Overflow opens the full named member list with keyboard dismissal and focus return. No members displays a text empty state. |
| Card | `title`, `description`, `action`, `footer`, `children`, `headingLevel`, `variant`: default / quiet, `as`: div / section | A surface with optional header, body, and footer. Native div attributes are supported. A titled section is a named region. Header actions wrap when space is limited. |
| ListRow | `label`, `description`, `leading`; either `trailing`, `onAction` + optional `disabled`, or `href` | A content row, native button action, or native link. Action/link rows have a chevron. Independent trailing controls belong only in static rows, avoiding nested interactive targets. |
| SettingsSection | `title`, `description`, `headingLevel`, `children` | Composes Card as a named section. Direct children become padded rows with separators; use ListRow or existing labeled controls such as Switch. |
| EmptyState | `title`, `description`, `icon`, `action`, `tone`: neutral / error, `headingLevel` | A centered message and next action. Accepts native div attributes. The parent owns recovery, status announcements, and focus after replacing content. |

Heading levels default to 3; use 2–4 to suit the surrounding document. Cards are
static surfaces: put real buttons and links in their action slots. For semantic
lists, place ListRow inside a `li` owned by the surrounding `ul` or `ol`. The row
itself does not impose list semantics on settings or account summaries.

Avatar exposes one accessible image name; set `decorative` when the same name is
already adjacent. AvatarGroup's member list remains available when faces overflow.
Images are supplied by the consuming product. Gallery's Avatar preview supports
local photo selection and releases its object URL when replaced or unmounted.

```tsx
<Card title="Team" action={<Button onPress={openInvite}>Invite</Button>}>
  <ListRow
    leading={<Avatar name="Alex Morgan" tone="teal" decorative />}
    label="Alex Morgan"
    description="alex@example.com"
    trailing={<Badge>Owner</Badge>}
  />
</Card>

<SettingsSection title="Notifications" description="Choose what reaches you.">
  <Switch label="Activity updates" checked={enabled} onChange={toggleUpdates} />
  <ListRow label="Delivery preferences" onAction={openPreferences} />
</SettingsSection>
```

The Profile form, Settings, Collection, and Workspace shell examples live in Gallery's **Patterns** category
and `src/pages/Gallery/patterns/`. They compose these public components with
example-specific state and layout; they are not additional primitive APIs.
Gallery's no-results screen also uses the shared EmptyState.

Identity sizing uses `--bbb-avatar-size-sm`, `--bbb-avatar-size-md`, and
`--bbb-avatar-size-lg`, aliased to the existing spacing scale. ListRow uses
`--bbb-list-row-height` for its minimum target height and
`--bbb-list-row-content-width` for its preferred content width before trailing
metadata wraps. EmptyState copy uses `--bbb-empty-state-width`. Colors, corners,
padding, shadows, and motion consume the established semantic tokens.

## Menus and overlays

Use a BBB Button as the `trigger` (or Tooltip child). It integrates with React
Aria's trigger context. Keep the trigger mounted so focus can return after closing.
For a Tooltip on a native Link, wrap that link with React Aria's `Focusable` to
connect hover, focus, and tooltip descriptions, as SidebarNavigation does.
Tooltip also accepts `placement` (React Aria placement values); it defaults to
above the trigger and flips as needed to stay in the viewport. Set `disabled`
to suppress a tooltip while keeping its trigger mounted (used for expanded
sidebar labels).
Tooltips use `--bbb-color-text` as their background and `--bbb-color-surface`
for text in both modes. These inverse colors take precedence over the theme
root's body-text color, including when shared styles are bundled by a consumer.

**Sheet** accepts `trigger`, `title`, `description`, `children`, `footer`,
`open`, `onOpenChange`, and `side: 'start' | 'end'` (default `end`). It shares the
modal implementation with Dialog: focus stays inside, background content is
isolated, Escape/outside interaction dismisses, and focus returns to the trigger.
The close button is labeled “Close sheet.” Logical sides follow document direction.
The body scrolls independently of the header and footer. Its brief slide and
backdrop transitions become immediate with reduced motion.

Both Dialog and Sheet accept `children` and `footer` as nodes or functions receiving
`close`. Use a form ID and the native button `form` attribute to place a submit
action in the footer; native validation still runs. Use controlled `open` for async
work and close after success. Keep drafts local to the mounted form to discard
them when dismissed; the parent owns saved values and any unsaved-change policy.

```tsx
const formId = useId()

<Sheet
  trigger={<Button variant="secondary">Edit workspace</Button>}
  title="Workspace details"
  footer={close => <>
    <Button variant="secondary" onPress={close}>Cancel</Button>
    <Button type="submit" form={formId}>Save</Button>
  </>}
>
  {close => <form id={formId} onSubmit={event => {
    event.preventDefault()
    save(new FormData(event.currentTarget))
    close()
  }}>
    <TextField label="Name" name="name" defaultValue={name} required autoFocus />
  </form>}
</Sheet>
```

The example above assumes a synchronous save. On narrow screens the sheet fits
the viewport, and its header and footer remain reachable with enlarged text.
`--bbb-sheet-width` defines its preferred width; established spacing, surfaces,
layering, and `--bbb-duration-medium` define the rest of its appearance.

| Component          | Main props                                                             | Behavior                                                                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DropdownMenu       | `trigger`, `label`, `items`, `onAction(id)`                            | Items have `id`, `label`, optional `disabled` / `danger`. Arrows, Home/End, and typeahead navigate; Enter activates. Escape and outside interaction dismiss. Selection restores trigger focus.                |
| Dialog             | `trigger`, `title`, `description`, `children`, `open`, `onOpenChange`  | Modal with contained focus, background isolation, and focus return. Children can be a function receiving `close`. Escape and clicking the backdrop dismiss a regular dialog.                                  |
| ConfirmationDialog | Dialog props plus `confirmLabel`, `cancelLabel`, `onConfirm`, `danger` | Alert dialog. Cancel receives initial focus; outside clicks do not dismiss. Confirm invokes the synchronous callback and closes. For async work, use Dialog with a loading Button and close after completion. |
| Popover            | `trigger`, `title`, `children`, `open`, `onOpenChange`                 | Anchored interactive content; Escape, outside interaction, or its close button dismiss. Placement adjusts to the viewport.                                                                                    |
| Tooltip            | `content` (string), `children` (BBB Button)                            | Hover and keyboard focus reveal the description; Escape dismisses. Keep content brief and noninteractive. Essential information belongs in visible labels or hints.                                           |

```tsx
<Dialog trigger={<Button>Edit details</Button>} title="Your details">
  {close => (
    <form
      onSubmit={event => {
        event.preventDefault()
        save()
        close()
      }}
    >
      <TextField label="Display name" name="name" required autoFocus />
      <Button type="submit">Save changes</Button>
      <Button variant="secondary" onPress={close}>
        Cancel
      </Button>
    </form>
  )}
</Dialog>
```

DropdownMenu, Select, and Combobox share `DropdownSurface`, its option-row styles,
and its opening/closing motion. Dropdown menus perform actions; Select and
Combobox choose field values; their popovers align to the whole field surface.
Use their
separate APIs to preserve the expected form and keyboard behavior. Overlays render
in portals so Gallery cards do not clip them. React Aria measures their position
and available space; authored widths, surfaces, shadows, and layers remain tokens.

## Navigation and disclosure

**NavigationMenu** organizes website destinations with ordinary links and
disclosure buttons. It accepts `label`, `items`, optional `currentId`,
`openId` / `defaultOpenId`, `onOpenChange(id | null)`, and `className`.
Use unique IDs across sections and links. A `NavigationLink` has `id`, `label`,
`href`, and optional `description`, `target`, and `rel`. A `NavigationSection`
has `id`, `label`, `groups: { label, links: NavigationLink[] }[]`, and optional
`disabled`. Descriptions appear within sections; `currentId` marks a link with
`aria-current="page"`. New-tab links get safe relationship attributes.

One section opens at a time. Tab follows the native button/link order; Enter or
Space toggles a section, and Arrow Down opens it and focuses its first link.
Escape closes and restores focus to the trigger. Focus leaving the navigation,
an outside pointer press, or following a link closes the panel. Links preserve
normal URL and modifier-click behavior. Keep the container's overflow visible:
the panel is positioned inside the nav, fits its width, and stacks groups when
narrow. `--bbb-navigation-panel-max-height` caps its scrollable height.

```tsx
<NavigationMenu label="Main navigation" currentId="home" items={[
  { id: 'home', label: 'Home', href: '/' },
  { id: 'learn', label: 'Learn', groups: [
    { label: 'Resources', links: [
      { id: 'guide', label: 'Guide', href: '/guide', description: 'Start here.' },
      { id: 'examples', label: 'Examples', href: '/examples' },
    ] },
  ] },
]} />
```

**Separator** accepts `orientation` (`horizontal` by default or `vertical`),
`decorative` (default false), and native div props/ref. A semantic separator
exposes its orientation; decorative separators are hidden from assistive
technology. Neither is focusable by default. Horizontal lines fill the available
width; vertical lines stretch in a flex/grid row. Let the parent supply spacing.

**HoverCard** accepts a focusable `trigger`, `title`, and `children`, plus optional
`open` / `defaultOpen`, `onOpenChange`, `disabled`, `delay` (600ms), `closeDelay`
(200ms), `placement` (React Aria Popover placement, default `bottom start`), and
`className`. Its React Aria PreviewTrigger opens on hover, keyboard focus, or
touch long press. The trigger must forward DOM props and its ref; native anchors,
BBB Link, and BBB Button work. Tab can enter interactive preview content; Escape
dismisses and returns focus. Pointer travel into the preview keeps it open.
Theme, density, and locale follow the provider through the portal. `disabled`
suppresses the preview while leaving its link usable. Keep essential information
at the destination; use Popover when opening content is the primary action.

```tsx
<HoverCard title="About this project" trigger={<Link href="/project">Project</Link>}>
  <p>A quick introduction before opening the full page.</p>
  <Link href="/project">Open project</Link>
</HoverCard>
```

**NativeSelect** combines `FieldProps` (`label`, `hideLabel`, `hint`, `error`,
`variant`) with native select props and a select ref. Pass native `option` and
`optgroup` children. All four field variants work, as do native disabled options,
`name`, `required`, `multiple`, `size`, and form reset. `onChange` receives a DOM
event: read `event.target.value`, or `selectedOptions` for multiple selection.
Hints/errors are associated with the select; `error` adds `aria-invalid`.
The browser owns the options UI and mobile picker. Use Select for rich option
content and custom popup styling. A controlled value must be reset by the app.

```tsx
<NativeSelect label="Region" name="region" defaultValue="manila" required>
  <optgroup label="Asia Pacific">
    <option value="manila">Manila</option>
    <option value="singapore">Singapore</option>
  </optgroup>
</NativeSelect>
```

**SidebarNavigation** accepts a required navigation `label`, `groups`, optional
`currentId`, `compact` (default false), and optional `onNavigate(id)`. Groups have `id`, optional `label`, and
`items`. Each item has `id`, `label`, `href`, and optional `icon` (IconName), `badge`
(text), and `disabled`. `SidebarNavigationItem` and `SidebarNavigationGroup` are
exported types. Empty groups are omitted. Supply unique item IDs across groups.

Enabled items are native Link anchors. `currentId` adds `aria-current="page"` and
the shared Teal selected surface. Unavailable items remain labeled, expose
`aria-disabled`, and leave the tab order. The component uses ordinary link
keyboard behavior, not arrow-key menu navigation. Tab reaches each enabled link;
Enter follows it. Badges are part of the accessible link name.

Supplying `compact` opts into the collapsible sidebar layout; omit it for a fluid
navigation list such as a mobile Sheet. Compact mode retains labels, group names,
and badges for assistive technology. Link nodes stay mounted, icons stay anchored,
and group heading space is reserved in both states. Copy keeps its expanded width
inside a clipped row, so it can wrap normally without reflowing during a toggle.
In compact mode, short horizontal dividers fade in between groups within the
reserved heading space, keeping section boundaries clear without moving icons.
Labels fade and slide in after the width transition has begun; closing removes
that delay. CSS transitions reverse smoothly on rapid toggles. Hovering or keyboard-focusing an icon shows a right-side
Tooltip with its label and badge; unavailable items also explain that state and
stay outside the tab order. Items without an icon use the box icon as a fallback.
Use distinct destination icons when composing an icon rail. Native link and
current-page behavior remain unchanged.

Without `onNavigate`, links follow `href` normally. When supplied, the callback
intercepts an ordinary click or Enter activation for client-side navigation;
modifier clicks retain native browser behavior. The consumer owns routing and
focus after the destination renders. Keep real destination URLs in `href`.

```tsx
<SidebarNavigation
  label="Workspace"
  currentId="projects"
  groups={[{ id: 'work', label: 'Workspace', items: [
    { id: 'overview', label: 'Overview', href: '/workspace', icon: 'layout-grid' },
    { id: 'projects', label: 'Projects', href: '/projects', icon: 'layers', badge: '3' },
  ] }]}
/>
```

**PageHeader** accepts `title`, optional `description`, `eyebrow`, `breadcrumbs`,
`actions`, `headingLevel` (1–4, default 1), `titleId`, and `titleRef`. Native header
attributes are forwarded. Breadcrumbs and actions are composition slots; use the
actual Breadcrumbs, Button, and Link components. The heading has `tabIndex={-1}`
for fragment navigation or deliberate focus after a route change. Set its level
to suit the surrounding document. Text and actions wrap without reducing type.
`--bbb-page-header-copy-width` sets the text's preferred width before actions wrap.

The Workspace shell pattern uses these pieces with Cards, ListRows, Avatars,
Breadcrumbs, and local editable details. It contains Overview, Projects, and
Members examples. It changes from a sidebar to a start-side Sheet based on the
preview container's available width. Navigation closes the sheet and focuses
the destination heading after its focus scope unmounts; dismissal restores the
menu button, or the heading if a resize has hidden that button. Example navigation
uses local state and fragments, not a product router. The shell's minimum height
uses `--bbb-workspace-preview-height`, and its desktop sidebar reuses
`--bbb-sidebar-width`.

The Workspace sidebar has a collapse toggle beside its title. Collapsing gives
more space to the content while keeping a compact icon rail visible and operable.
Its selected destination stays highlighted, and tooltips identify the icons.
Gallery shares this behavior, with category selection synchronized with filters.
`--bbb-sidebar-width` sets the expanded width (16rem); `--bbb-sidebar-rail-width` sets the
compact width (4.5rem). `--bbb-sidebar-content-width` derives the inner expanded
width from the sidebar padding and border; `--bbb-sidebar-icon-inset` centers icons
in the rail without shifting them during expansion. Branding and account details
share the label reveal treatment and retain their layout space. Collapsed brand
links are inert. Width and reveal transitions respect reduced motion. The separate
mobile Sheet always shows full navigation labels, and desktop collapse state
survives responsive layout changes.

**SidebarToggle**, exported from `SidebarNavigation/SidebarToggle`, composes the
shared icon button and tooltip. It accepts `collapsed`, `controls` (the sidebar's
DOM ID), `onToggle`, and `buttonRef`. Its accessible label and `aria-expanded`
reflect the state. `useSidebarToggle`, exported from the adjacent hook file,
returns `collapsed`, `toggle`, and `buttonRef`. Keep that single toggle mounted
inside the sidebar so focus stays on it when changing state. The consuming layout
controls width, responsive visibility, and mobile navigation independently. Pass
`compact={collapsed}` to desktop SidebarNavigation; the rail remains in the
accessibility tree and tab order. Gallery and Workspace shell demonstrate this
shared behavior.

Link renders a native anchor and accepts native anchor props and a ref. Its
`variant` is `default` (underlined Teal) or `quiet` (secondary text). Supply `href`
for navigation; use Button for actions. `external` opens a new tab. Any
`target="_blank"` adds `noopener noreferrer`, an external icon, and hidden new-tab
text. If supplying a custom `aria-label`, include the new-tab announcement in it.

Breadcrumbs accepts `items: { id, label, href? }[]` and an optional navigation
`label` (default “Breadcrumbs”). Ancestors use Link when `href` is present; the
last item is text with `aria-current="page"`. Long paths wrap, and an empty path
renders nothing. Give multiple breadcrumb regions distinct labels.

```tsx
<Link href="/projects">Browse projects</Link>
<Breadcrumbs
  label="Project location"
  items={[
    { id: 'workspace', label: 'Workspace', href: '/workspace' },
    { id: 'projects', label: 'Projects' },
  ]}
/>
```

| Component   | Main props                                                                                    | Behavior                                                                                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tabs        | `label`, `items`, `selectedKey` / `defaultSelectedKey`, `onSelectionChange`, `orientation`    | Items have `id`, `label`, `content`, optional `disabled`. Selection and panels are associated; arrows skip disabled tabs. Default automatic activation; `keyboardActivation="manual"` is available. |
| Accordion   | `items`, `defaultExpandedKeys` / `expandedKeys`, `onExpandedChange`, `allowsMultipleExpanded` | Items have `id`, `title`, `content`, optional `disabled`. One section expands at a time by default; buttons support Enter and Space.                                                                |
| FilterGroup | `label`, `value`, `options`, `onChange`                                                       | Pressed buttons for filtering one collection; distinct from tabs with associated panels.                                                                                                            |

Tabs use a sliding selection indicator and a short content reveal. The panel
container also transitions height when the content changes size. Outgoing content
is hidden and inert; reduced-motion preferences make all transitions immediate.
The [React Aria Tabs API](https://react-aria.adobe.com/Tabs) supplies the selection
indicator and panel transition behavior.

FilterGroup keeps each short label and count on one line. When space is tight,
whole buttons wrap to another row instead of splitting category names.

## Collections

| Component | Main props | Behavior |
| --- | --- | --- |
| Table | `label`, `rows`, `columns`, `getRowId`, `getRowLabel`, `sort`, `onSortChange`, `selection`, `loading`, `emptyState` | Native table with optional sortable headers and checkbox selection. The parent supplies ordered rows and owns all data changes. |
| Pagination | `page`, `pageSize`, `totalItems`, `onPageChange`, optional `label` and `disabled` | Controlled, one-based pages. Announces the visible range, disables previous/next at boundaries, and uses a compact page count on narrow screens. |
| FilterChips | `label`, `items`, `onRemove(id)`, optional `onClear(removableIds)` and `disabled`, required `emptyFocusRef` | Items have `id`, `label`, optional `disabled`. Removing a chip focuses the next enabled chip, then the previous one, or the supplied fallback. Clear passes only enabled IDs and focuses the fallback. |

Table exports `TableColumn<Row>` and `TableSort`. A column has `id`, `label`, and
`renderCell(row)`; optional `rowHeader`, `sortable`, and `align: 'start' | 'end'`
describe its role. Use a primary row header to identify each record. Sort is
`{ column, direction: 'ascending' | 'descending' }`. A sortable header emits the
next direction through `onSortChange` and exposes the current `aria-sort`; it does
not sort the supplied rows itself. Only columns with a sort callback are interactive.

Selection is optional: pass `{ selectedIds, onChange, isDisabled? }`, using stable
string row IDs. `selectedIds` is a read-only Set; `onChange` receives a new Set.
`isDisabled(row)` prevents changing that row's selection. Select-all adds or
removes enabled rows on the rendered page, keeps IDs from other pages, and shows
a mixed state for a partial page selection. The parent prunes stale selections
when records disappear and decides whether filtering clears selection.

Loading disables the header controls, replaces rows with decorative skeletons,
sets `aria-busy`, and announces loading. Empty rows render `emptyState` (or the
default EmptyState) outside the scroller so recovery stays visible. The table
area is keyboard-focusable for horizontal scrolling. Tab reaches the ordinary
buttons and checkboxes; this component does not impose grid-style arrow navigation.

```tsx
// The parent filters and sorts matchingRows before slicing the current page.
<Table
  label="Members"
  rows={matchingRows.slice((page - 1) * pageSize, page * pageSize)}
  columns={[
    { id: 'name', label: 'Name', rowHeader: true, renderCell: row => row.name },
    { id: 'role', label: 'Role', renderCell: row => row.role },
  ]}
  getRowId={row => row.id}
  getRowLabel={row => row.name}
  selection={{ selectedIds, onChange: setSelectedIds }}
/>
<Pagination
  label="Member pages"
  page={page}
  pageSize={pageSize}
  totalItems={matchingRows.length}
  onPageChange={setPage}
/>
```

Pagination clamps its displayed page to the available range and shows “0 items”
for an empty collection. It does not call `onPageChange` when props are clamped;
keep the parent's data slice in sync and reset or clamp its page when results
change. Give multiple pagination regions distinct labels.

FilterChips is controlled: update `items` from its callbacks and keep it mounted
when the list becomes empty so focus can be restored. `emptyFocusRef` must point
to a mounted, enabled control such as the search input. Disabled chips remain
visible and are excluded from clear-all. Long chip labels wrap within the surface.

The Collection pattern demonstrates these contracts with search, status/owner
filters, cross-page selection, bulk archive, row archive/restore menus, detail
dialogs, and a local refresh/loading state. Filtering and sorting reset its page
and selection. All example data and actions remain in the pattern.

Table sizing uses `--bbb-table-min-width`, `--bbb-table-primary-width`, and
`--bbb-table-row-height` (aliased to the established list-row height). Selected
rows, current pages, and filter chips share the Teal supporting tint, with
`--bbb-color-supporting-subtle-hover` for hover. The complete composition uses
`--bbb-collection-preview-width`; spacing, corners, typography, and motion reuse
the existing foundation values.

## Feedback and supporting pieces

| Component   | Main props                                                             | Behavior                                                                                                                                                               |
| ----------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alert       | `title`, `tone`: info / success / warning / danger; `children`, `role` | Persistent message. Defaults to polite `role="status"`; use `role="alert"` for urgent new feedback.                                                                    |
| ToastRegion | `queue` from `createToastQueue()`                                      | Mount one region per queue. Notifications are portalled, keyboard accessible with F6, and individually dismissible. Up to three are visible.                           |
| Progress    | `label`, optional `value`, `max` (default 100)                         | Clamps finite values to the valid range. Omit `value` for unknown progress. Labels and numeric values are available to assistive technology.                           |
| Skeleton    | `variant`: line / title / avatar; `short`; `className`                 | Decorative placeholder hidden from assistive technology. Set `aria-busy` on the loading content container and provide a separate loading status. Intentionally static. |
| Badge       | `tone`: neutral / accent / success / warning; `dot`                    | Compact label with optional status dot.                                                                                                                                |
| Icon        | `name: IconName`, native SVG props, `className` | Lucide outline SVG. Prefer canonical names; existing BBB aliases remain supported. Size and stroke follow shared tokens. Label the containing control. |

```tsx
const [queue] = useState(createToastQueue)

<ToastRegion queue={queue} />
<Button onPress={() => queue.add({
  title: 'Changes saved',
  description: 'Everything is up to date.',
})}>Show notification</Button>
```

A toast stays until dismissed by default. `queue.add(content, { timeout: 5000 })`
can expire nonessential messages; timeouts pause on hover and focus. Keep important
feedback persistent. `queue.close(key)` and `queue.clear()` support cleanup.
Content can include `action: { label, ariaLabel?, onPress }` for an action such as
Undo. The consumer owns the operation and closes the toast with `queue.close(key)`
after success, so a failed operation can leave the action available for retry.
The Toast adapter isolates React Aria's currently experimental toast API; review
it when upgrading that dependency. Progress percentages and overlay measurements
are data-driven geometry, while fixed visual values come from shared tokens.

## Tokens for the new controls

The shared foundation adds `--bbb-choice-size`, `--bbb-textarea-height`, and
`--bbb-progress-height` for controls. Floating surfaces use `--bbb-overlay-width`,
`--bbb-menu-min-width`, `--bbb-dialog-width`, and `--bbb-tooltip-width`.
`--bbb-layer-overlay` and `--bbb-layer-toast` coordinate stacking, and
`--bbb-color-scrim` defines the modal backdrop. Destructive buttons use the existing
danger role with new `--bbb-color-danger-hover` and `--bbb-color-danger-pressed`
states. Skeleton dimensions use the `--bbb-skeleton-*` family. These values live
in `src/foundations/tokens.css`; the corresponding Gallery examples consume them.

Fields use `--bbb-color-field-surface` and `--bbb-color-field-hover-surface` for
their fill, with `--bbb-color-field-border` (transparent at rest) and
`--bbb-color-field-hover-border` for the edge. `--bbb-field-height` is a 72px
minimum at the default root size; `--bbb-field-value-height` reserves a 24px value
line. The label and padding grow naturally with content. `--bbb-textarea-height`
sets the editable area's minimum height, excluding its inset label and padding.
`--bbb-form-preview-width` caps the complete form example at 44rem.
Checkbox and radio details use `--bbb-shadow-field` for subtle depth and
`--bbb-choice-radius`, `--bbb-choice-mark-scale`, `--bbb-choice-press-scale`, and
`--bbb-radio-dot-size`. Tab motion uses `--bbb-duration-medium` (240ms); all of
these transitions respect the existing reduced-motion token overrides.

## Themes, customization, and copied source

Copy component bundles and import their local files and prop types. Import
`./bbb/foundations/styles.css` once in the consuming app. There is no installed
BBB component package. The optional `baseline` bundle provides whole-app styles.
[Adoption](../../docs/ADOPTION.md) covers installation and release compatibility;
[customization](../../docs/CUSTOMIZATION.md) documents provider tokens, icon
replacement, content slots, CSS overrides, and portal inheritance.

ThemeProvider accepts `brand: bbb | studio | BrandPreset`, `mode: light | dark | system`,
`density: comfortable | compact`, `tokens`, `locale`, `dir`, and native div props.
Nested providers inherit unspecified choices. Pass CSS variable overrides through
`tokens` to propagate them into overlays. IconProvider accepts an `icons` map from
IconName to SVG children; canonical Lucide names and legacy aliases share the same
override. `lucideIconNames` lists canonical names and `iconNames` includes aliases.
Each component's exported props describe available
native attributes and composition points; do not assume every wrapper forwards
attributes to an inner input.

Select and Combobox options additionally support `description`, `leading`, and
`renderOption(option)`. MultiSelect uses the same content contract and shared
DropdownSurface. DropdownMenu supports action `leading`, `renderItem`, and root
className. SidebarNavigation supports `leading` nodes and native nav props.
Dialog/Sheet expose `className`, `bodyClassName`, and `closeLabel` in addition to
body/footer composition. Popover/Tooltip expose root className. Existing APIs are
preserved; rich content retains plain labels for accessible naming and typeahead.

## Additional form and selection controls

| Component | Main props | Contract |
| --- | --- | --- |
| Calendar / RangeCalendar | React Aria calendar props, `value`, `defaultValue`, `onChange`, `minValue`, `maxValue`, `isDateUnavailable`, `className` | Supply an accessible label when standalone. Locale-aware day navigation, month navigation, disabled dates, selection and visible focus. DatePicker supplies context when embedded. |
| DatePicker / DateRangePicker | React Aria date props plus `label`, `hint`, `error`, `required`, `disabled`, `className` | Segmented keyboard input plus the shared calendar surface; Escape dismisses and returns focus. DateRangePicker requires both endpoints. Native validation uses FieldError; explicit error text keeps the invalid edge. |
| TimePicker | React Aria time props plus the same field props | Localized hour/minute segments, optional seconds/hour cycle, min/max, read-only and disabled states. It does not invent a timezone for a plain Time value. |
| NumberField | React Aria number props plus the same field props | Controlled/uncontrolled numeric values, `minValue`, `maxValue`, `step`, `formatOptions`, native name/ref and locale formatting. Empty values use NaN; validate before saving. Increment/decrement buttons honor bounds. |
| MultiSelect | `label`, `options`, `value`/`defaultValue`: string[], `onChange(string[])`, `required`, `disabled`, `hint`, `error`, `name`, `renderOption` | Multiple selection with keyboard toggling, typeahead, disabled options, repeated form values, shared dropdown, and focus return. |
| TagField | `label`, `value`/`defaultValue`: string[], `onChange`, `name`, `maxTags`, `disabled`, `hint`, `error`, `placeholder` | Enter/comma or Add commits a trimmed tag. Empty/case-insensitive duplicates are rejected with a status announcement; IME composition is not interrupted. Arrow/Delete navigation uses TagGroup. Removing the final tag returns focus to input. Hidden inputs submit repeated names. |
| FileUpload | `label`, `files`, `onAdd`, `onRemove`, `onRetry`, `accept`, `multiple`, `maxSize` in bytes, `disabled`, `hint`, `error` | Native file chooser plus drop target; validates type/size, reports rejected files, displays ready/uploading/complete/error state and progress, retries/removes. The consumer owns upload, cancellation, server validation and the file list. No network request is made by this control. |
| Slider / RangeSlider | `label`, numeric `value`/`defaultValue`, `onChange`, `onChangeEnd`, `minValue`, `maxValue`, `step`, `keyboardStep`, `formatOptions`, `disabled`, `hint`, `thumbLabels`, `names` | Arrow/Home/End operation and drag interaction. RangeSlider uses a two-value array and independently named handles that cannot cross. `names` assigns hidden native inputs for form submission. Horizontal only. |
| SegmentedControl | `label`, `options`, `value`/`defaultValue`, `onChange`, `disabled`, `className` | Single selection, arrow-key navigation, disabled choices, no empty selection after choosing. Shares FilterGroup's visual treatment but uses radio-group selection semantics. Use Tabs for tab panels. |
| Stepper | `label`, `steps`: string[], `currentStep`: zero-based number, `className` | Informational ordered progress. Current step has aria-current=step; prior steps are complete. A currentStep equal to steps.length marks all complete. The consuming form owns navigation/validation. |

Calendar width follows seven `--bbb-calendar-cell-size` day columns plus its inset
padding, so date-picker popups stay compact independently of the field width.
At narrow widths and enlarged text, the calendar scrolls inside its surface.

Sliders use `--bbb-slider-track-height` for both the filled and unfilled track
(6px by default) and `--bbb-slider-thumb-size` for the handle (24px by default).
The larger interaction area follows `--bbb-control-height`; the handle keeps its
hover, drag, keyboard focus, and disabled states. These tokens apply to both
Slider and RangeSlider without changing progress bars. Hover and drag shadows use
`--bbb-slider-shadow-hover` and `--bbb-slider-shadow-drag`; dragging enlarges the
handle using `--bbb-slider-drag-scale`. Reduced motion disables enlargement and transitions.

`step` controls value precision for pointer and native input changes. Optional
`keyboardStep` overrides arrow-key increments (including RTL direction); Home/End
and PageUp/PageDown retain their native behavior. Shift+Arrow uses at least the
page increment. Use a positive multiple of `step` for `keyboardStep`. Gallery uses
`step={0.01}` with `keyboardStep={5}` for smooth dragging and five-unit arrow steps;
the volume readout rounds to whole numbers without rounding the stored value.

Use immutable date values and helpers directly from `@internationalized/date`:

```tsx
import { DatePicker } from './bbb/components/DatePicker/DatePicker'
import { NumberField } from './bbb/components/NumberField/NumberField'
import { MultiSelect } from './bbb/components/MultiSelect/MultiSelect'
import { parseDate } from '@internationalized/date'

<DatePicker label="Start date" defaultValue={parseDate('2026-10-01')} required />
<NumberField label="Seats" defaultValue={2} minValue={1} maxValue={10} />
<MultiSelect
  label="Disciplines"
  defaultValue={['design']}
  options={[
    { id: 'design', label: 'Design', description: 'Shape the experience' },
    { id: 'engineering', label: 'Engineering' },
  ]}
/>
```

`UploadFile` is `{ id, file: File, status, progress?, error? }`. Use stable IDs and
cancel an in-flight request when the consuming app removes a file. Pass a progress
percentage or leave it undefined for unknown progress. Client accept/size checks
help selection; the receiving service owns authoritative validation. No object
URLs are created by the shared component.

## Complete workflows

Gallery adds Authentication (sign-in, recovery, code verification, new password),
Onboarding (workspace/preferences/review), Multi-step form (error summary, preserved
values, review, pending save, simulated server failure/retry), Unsaved changes
(dirty state, cancel confirmation, discard/save, browser unload prompt), and Page
recovery (loading, offline, missing, denied, retry and focus recovery).

These are composition references under patterns/, not authentication services or
routing implementations. Example async work is cancellable on unmount. Gallery
uploads stay local and simulate progress/failure. Products must supply their own
requests, persistence, routing guards, validation, and translations.

Sidebar groups also accept `collapsible`, `defaultExpanded` (defaults to `true`),
and `icon`. Set a `label` on collapsible groups: it names the disclosure button
and its nested link list. For example:

```tsx
<SidebarNavigation label="Projects" currentId="active" groups={[
  { id: 'projects', label: 'Projects', icon: 'layers', collapsible: true,
    defaultExpanded: true, items: [
      { id: 'active', label: 'Active projects', href: '/projects', icon: 'layout-grid' },
      { id: 'archive', label: 'Archive', href: '/archive', icon: 'box' },
    ] },
]} />
```

Each disclosure keeps its own expansion state. Enter and Space toggle it; Tab
reaches the visible native links. A closed section retains a supporting-color
label when it contains the current destination. In compact mode, section buttons
and visible links retain icons and tooltips; expanding the sidebar preserves
section state. The **Sidebar dropdowns** Gallery pattern demonstrates desktop,
icon rail, and mobile Sheet navigation using the Workspace shell composition.

## Content, internationalization, and additional controls

The Content and Internationalization foundations demonstrate writing conventions,
long labels, English/Arabic controls, regional formats, RTL, and localized portals.
See docs/CONTENT.md and docs/CUSTOMIZATION.md for the message override contract.

| Component | Public contract |
| --- | --- |
| PasswordField | TextField props except `type` and `trailingAction`, plus optional `showLabel` and `hideLabelText`. Keeps native value/change/ref/name/validation and password-manager autocomplete. Reveal preserves caret and input focus; the action follows disabled state. No password policy is imposed. |
| VerificationCode | TextField props with string `value`/`defaultValue`, `onChange(string)`, and `length` (default 6). One native text input supports selection, paste, one-time-code autofill, required validation, and numeric keyboards. Spaces/non-digits are removed; Arabic-Indic/Persian digits become ASCII; leading zeros survive. Native form reset restores uncontrolled defaults. It does not auto-submit or make verification requests. |
| DescriptionList | `items: { id, label, value }[]`, `layout: rows / stacked`, native dl attributes. Renders dt/dd semantics; rows become stacked within narrow containers. Values support rich shared components. |
| Toolbar | `label`, React Aria Toolbar props/children, optional `overflowActions: MenuAction[]` and `onOverflowAction(id)`. Arrow-key navigation skips disabled controls; actions wrap without clipping. The consumer places secondary actions in the overflow menu explicitly. Inputs keep their native editing keys. |
| InlineEdit | `label`, controlled `value`, `onSave(string)`, optional `validate(value): string \| undefined`, `disabled`, `className`. Enter saves, Escape/Cancel discards, validation preserves the draft, and focus returns to the reading action. Saving is synchronous; the consuming app owns persistence. Do not nest its form inside another form. |
| CommandSearch | `label`, `items: CommandItem[]`, `onAction(id)`, optional controlled `query`/`onQueryChange`, `loading`, `autoFocus`, `placeholder`, `className`. Locale-aware filtering, grouped actionable results, disabled choices, loading/empty states and count announcements; input keeps focus with active-descendant navigation. Supply already fetched results; networking remains in the consumer. |
| CommandPalette | CommandSearch props plus `trigger`, `title`, optional `searchLabel`, `open`/`onOpenChange`, `shortcut`. Composes Dialog and CommandSearch. Escape dismisses; selection closes and returns focus. Opt in to a modifier-key shortcut (for example `k`) on one app-level instance; shortcuts are ignored during typing, composition, or another dialog. |

`CommandItem` is `{ id, label, group, description?, keywords?, leading?, disabled? }`.
Keep IDs unique and labels readable. Search results are actions; navigate from
`onAction` using the consuming router when appropriate. Group headings remain
visible while keyboard navigation skips them. Loading results cannot be activated.

### Optional table capabilities

Existing Table behavior is preserved when these props are omitted:

- `hiddenColumnIds: ReadonlySet<string>` hides optional columns. Row headers remain
  visible; if all non-header columns are hidden, the first column is retained.
- `columnWidths: Readonly<Record<string, number>>` stores widths measured in CSS
  pixels. `onColumnResize(id, width)` enables pointer and keyboard resizing.
  Arrow keys resize in the reading direction; Home/End reach the tokenized limits.
  Treat widths as runtime geometry and use shared tokens for initial dimensions.
- `expandedRowIds`, `onExpandedRowsChange(Set<string>)`, and `renderExpandedRow(row)`
  expose inline details through named disclosure buttons with expanded state.
  The detail row spans only the currently displayed columns.
- Compose InlineEdit in `renderCell` for editable values. The consumer owns field
  validation, edited data, selection, sorting, visibility, and expansion state.

The Advanced table pattern demonstrates all four capabilities and resets the
column layout. Workspace search demonstrates scoped results, canceled simulated
search delays, empty recovery, and destination focus. Both use local example data.

New tokens: `--bbb-code-letter-spacing`, `--bbb-search-results-height`,
`--bbb-column-min-width`, `--bbb-column-max-width`, `--bbb-column-default-width`,
and `--bbb-column-resize-step`. Description lists stack below a 20rem container
width; this is a content-based component breakpoint.

For page-level dropdowns, a `SidebarNavigationItem` can have `children` instead
of `href`, plus optional `defaultExpanded`. The parent is a disclosure button;
its children are destinations with native links. Include an “All projects” child
when a parent needs an overview destination. Items with children can also be
`disabled`. Section labels stay unchanged unless their group is `collapsible`.
Both options compose together, and ancestor dropdowns indicate a selected child.

```tsx
const groups: SidebarNavigationGroup[] = [{
  id: 'workspace', label: 'Workspace', items: [{
    id: 'projects', label: 'Projects', icon: 'layers', children: [
      { id: 'all', label: 'All projects', href: '/projects', icon: 'layout-grid' },
      { id: 'active', label: 'Active projects', href: '/projects/active', icon: 'layers' },
    ],
  }],
}]
```

In **Sidebar dropdowns**, Pages is the default example; Sections demonstrates
expandable section headers. Each example has local navigation state.

Sidebar dropdowns distinguish section captions, semibold parent controls, and
indented child links. `--bbb-sidebar-nest-indent` controls
the additional child-label inset. Expanded children use text;
their icons remain mounted and appear in the compact rail. Selected child fills
stay inside the branch. Both page and section dropdowns share this treatment.

## Brand presets and logos

`ThemeProvider.brand` also accepts a `BrandPreset`. `createBrand` derives one from
BBB or another preset, flattening common and light/dark tokens into a serializable
configuration. Built-in objects are exported as `bbbBrand` and `studioBrand`.
An explicit brand starts an independent override boundary; providers without a
brand inherit the preset and explicit overrides. Mode palettes are resolved again
when switching modes, including nested and portaled content.

`BrandLogo` accepts `brand?: BrandPreset`, `decorative?: boolean`, and native span
attributes. Without `brand`, it reads the current provider. A wordmark uses its
text/suffix and accessible label; an image chooses its light or dark asset. Use
`decorative` inside a link that already names its destination. It uses
`--bbb-font-wordmark`, `--bbb-brand-size`, and `--bbb-brand-dot-size`; headings use
`--bbb-font-heading`. Both font roles default to `--bbb-font-sans`.

The Gallery Brand workspace demonstrates these APIs with BBB, Studio, and the
consumer-defined Fieldnotes preset. See [BRANDS.md](../../docs/BRANDS.md) for the
full format, nesting contract, validation, browser contrast checks, persistence,
and export APIs. `brandTokenNames`, `brandTokens`, `validateBrand`, `parseBrand`,
`serializeBrand`, `brandToCSS`, and `checkBrandContrast` are available from their
copied foundation modules.

### DocumentWorkspace

A library sidebar and document surface without a global header or logo. Shown in
Gallery → Patterns → Workspace shell → Document.

```tsx
<DocumentWorkspace
  label="Reference workspace"
  contentLabel="Open reference"
  navigationLabel="Reference library"
  openNavigationLabel="Open reference library"
  navigation={({ compact, onNavigate, expandNavigation }) => (
    <SidebarNavigation label="References" compact={compact} groups={groups}
      currentId={selectedId} onNavigate={id => { setSelectedId(id); onNavigate() }} />
  )}
  account={<AccountMenu />}
  tools={<Button onPress={createDocument}>New document</Button>}
  footer={<p role="status">Saved</p>}
>
  <DocumentContent />
</DocumentWorkspace>
```

Required props: `label`, `contentLabel`, `navigationLabel`, `openNavigationLabel`,
`navigation`, `account`, and `children`. Translate these application labels in the
consumer. Optional: `tools`, `footer`, `navigationDisabled`, `contentRef`, `className`.
`contentRef` is an object ref to the focusable content region.

`navigation` receives `compact`, `onNavigate`, and `expandNavigation`. Use `compact`
to render an icon rail. Call `onNavigate` after selecting content to close the mobile
Sheet and focus the content region; call `expandNavigation` after filtering from the
rail to reveal a library list. Mobile filtering preserves desktop collapse state.
The component owns its responsive container, collapse state, Sheet, and focus return.
Account/workspace logic, navigation data, search, loading, status copy, and content
remain consumer-owned. `navigationDisabled` makes navigation inert and disables its
mobile trigger, for example in a signed-out composition. The account slot remains
available. The account component should provide its own compact presentation.

## Product utility controls

These controls use the active ThemeProvider, shared tokens, and translated labels.
Gallery includes a live example for each, plus code, reset, and direct-link tools.

| Component | Public props | Behavior |
| --- | --- | --- |
| ThemeSwitcher | `value: ThemeMode`, `onChange`, `disabled`, `label`, `className` | One sun/moon icon button switches directly between Light and Dark, keeping focus on the button. From System, it switches to the opposite of the current system appearance. Use AppearanceSettings for the System preference. Persistence belongs to the app. |
| AppearanceSettings | `mode`, `onModeChange`, optional `density` + `onDensityChange`, `disabled`, `children`, `className` | Shared appearance fields. Add brand or locale fields through children. Labels and selected values wrap. |
| AccountMenu | `name`, `email`, `avatarSrc`, optional `trigger`, `actions`, `onAction`, `children`, `open`, `onOpenChange`, `className` | Avatar-triggered popover. Actions have `id`, `label`, optional `disabled`/`danger`. The consumer owns authentication, profile data, and closing after navigation. It uses dialog semantics so children can include forms and settings. |
| WorkspaceSwitcher | `workspaces: SelectOption[]`, `value`, `onChange`, `label`, `variant?: 'field' \| 'list'`, `disabled`, `actions`, `className` | Field variant uses Select and its checkmark/typeahead. List variant provides pressed selection buttons for account compositions. Workspace creation and management are consumer actions. |
| CopyButton | `text`, `label`, `onCopy`, `onCopyError`, and Button props except `children`, `onPress`, `loading` | Uses the browser Clipboard API. Pending, copied, and retry feedback are announced. Text changes reset feedback; failed clipboard writes remain retryable. Requires a browser context where clipboard access is allowed. |
| CodeBlock | `code`, `language`, `label`, `className` | Plain, escaped code with copy action and a named keyboard-scrollable region. Does not evaluate code or inject HTML. |
| KeyboardShortcut | `keys: string[]`, `label`, `className` | Displays key hints. Supply a spoken `label` for symbolic keys. Does not register a keyboard shortcut. |
| LoadingIndicator | `label`, `hideLabel`, `className` | Accessible loading status. Motion stops under reduced-motion preferences; the text remains available. |
| StatusIndicator | `label`, `tone?: neutral/success/warning/danger`, `icon`, `live`, `className` | Text plus a dot or icon. Use `live` for changing status that should be announced. |
| Banner | Alert props plus `actions`, `onDismiss`, `dismissLabel` | Persistent notice built on Alert. Dismissal is controlled by the consumer, which also restores focus if it removes the focused action. |
| BulkActionBar | `count`, required `scope`, `onClear`, `children`, `className` | Selected count and scope alongside consumer actions. Keep it mounted through selection changes. Consumers disable unavailable actions and restore focus when removing rows. |
| NotificationCenter | `items`, `onRead`, optional `onReadAll`, `onOpenItem`, `loading`, `error`, `onRetry`, `disabled`, `className` | Bell and unread count, loading/error/empty states, read actions. Items have `id`, `title`, optional `description`, `time`, `unread`. The caller formats time and owns fetching/persistence. Read actions retain focus when state changes. |
| SplitPane | `label`, `primary`, `children`, `onResize`, `className` | Vertical separator: arrows resize, Home/End reach bounds, and pointer dragging uses capture. Percentage changes are reported to `onResize`. Reading order stays primary then secondary. Below 36rem of available width, panels stack and the separator leaves the tab order. |
| TreeView | `label`, `items`, `selectedId`, `onSelectionChange`, optional `expandedIds`, `defaultExpandedIds`, `onExpandedChange`, `className` | React Aria treegrid with single selection, nested expansion, typeahead, arrow/Home/End navigation, and disabled items. Items have unique `id`, plain `label`, optional `disabled` and recursive `children`. Controlled callers reconcile selection/expansion if they remove items. |
| ContextMenu | `label`, `items: MenuAction[]`, `onAction`, `children`, `className` | Right-click, Shift+F10/ContextMenu key, and a visible actions button share the dropdown menu. The menu anchors to the visible button. Text editing retains the browser's native right-click menu. Escape restores the original keyboard target. |
| MediaPreview | `src`, required descriptive `alt`, `caption`, `className` | Image, loading/error/retry states, and an enlarged modal using the same source. Closing restores the enlarge trigger. Consumers supply and authorize image URLs. |

```tsx
import { useState } from 'react'
import { ThemeProvider } from './bbb/components/ThemeProvider/ThemeProvider'
import { ThemeSwitcher } from './bbb/components/ThemeSwitcher/ThemeSwitcher'
import { AppearanceSettings } from './bbb/components/AppearanceSettings/AppearanceSettings'
import type { ThemeMode, Density } from './bbb/components/ThemeProvider/theme'

function Preferences() {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [density, setDensity] = useState<Density>('comfortable')
  return (
    <ThemeProvider mode={mode} density={density}>
      <ThemeSwitcher value={mode} onChange={setMode} />
      <AppearanceSettings mode={mode} onModeChange={setMode}
        density={density} onDensityChange={setDensity} />
    </ThemeProvider>
  )
}
```

`CommandItem` now accepts optional `shortcut: string[]`, `href`, and `target`.
Links use native navigation; `onAction` can close the palette or handle app actions.
Hints do not install additional shortcuts. Keep at most one app-level palette
shortcut. `DropdownMenu` also accepts controlled `open` and `onOpenChange` props.
