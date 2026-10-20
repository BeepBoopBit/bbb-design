# Foundations and interaction rules

The Gallery Foundations category is the live reference. All visual values come
from `src/foundations/tokens.css`, including both brand presets and color modes.
The finish should retain the clarity, restraint, and attention to detail of a
first-party Apple app while allowing a product's own identity.

The [Brand workspace](BRANDS.md) turns that identity into a reusable preset, with
wordmarks/assets, mode-specific colors, common typography/shape/motion tokens,
configuration and contrast validation, and JSON/CSS import/export.

Content and Internationalization are live Gallery foundations too. Follow the
[content guide](CONTENT.md) for wording, feedback, long content, and translation.
Locale and typed message overrides apply to shared controls and their portals;
the consuming product supplies its own copy. The Arabic example exercises RTL,
dates, currency, pagination, and dialog dismissal. See [quality checks](QUALITY.md)
for the browser matrix and reviewed visual baselines.

## Motion

Slider handles deepen their shadow on hover and gently enlarge while dragging,
then settle on release. Their position and track fill follow input immediately.
Reduced motion removes the enlargement and makes shadow changes instant. Gallery
sliders use fine pointer precision with a separate five-unit keyboard increment.

Use the fast duration for hover, press, and small feedback. Use the medium duration
for changing views, expansion, and overlays. Use the shared standard easing curve.
Keep transitions interruptible: a second click should reverse or update the current
transition immediately. Never delay state changes to wait for an animation.

Prefer opacity and transform for entrances. Animate layout only when it explains
where content goes; avoid text scaling or rewrapping during a sidebar transition.
Exits preserve the trigger for focus return. Focus moves with task state, not after
an animation timer. Reduced-motion mode sets fast and medium durations to zero,
removes looping decorative motion, and keeps status text visible. Gallery's Motion
example can be reversed repeatedly to check this behavior.

## Icons

Use the shared 24×24 geometry, icon-size, and icon-stroke tokens. Align icons with
the text or control they describe. Decorative icons have `aria-hidden`; icon-only
actions have explicit accessible names. Use the same symbol for the same action.
Provider overrides replace artwork without changing the component's behavior.
The Iconography example lists the current catalog; Customization demonstrates an
override. Do not communicate error, selection, or success with an icon alone.

## Layout and density

Use content-width and page-gutter for application width and edge space. Use the
spacing scale to group related fields, then larger gaps between tasks. Start grid
tracks with `minmax(0, 1fr)` where content may shrink. Use containers for reusable
patterns and viewport queries for the application shell.

Established breakpoints are 36rem for narrow field compositions, 48rem for shell
and two-column changes, and 80rem for the wide Gallery layout. CSS media/container
conditions are the documented exception to tokenized dimensions. Choose a
breakpoint because content needs it, and reuse these values when appropriate.
SearchField uses a 12rem container breakpoint to preserve query space beside its
clear action, reducing padding and omitting the decorative icon when necessary.

Comfortable is the default. Compact reduces minimum control/row dimensions without
shrinking text or removing focus. Coarse pointer controls retain comfortable
heights. Text may grow and labels may wrap; controls must not impose fixed heights
that clip content. At 200% text and 320/390px widths, keep intentional calendar,
table, and tab scrolling inside the component instead of the page.

## Field styles

The default `filled` fields keep persistent inset labels. `outlined` uses a slim
surface and a visible edge for everyday forms; `subtle` uses the same proportions
with a quiet fill for supporting controls. `plain` provides minimal chrome for
embedded toolbars and inline editing. These three styles place labels above the
surface in normal flow. All use the same focus, validation, feedback, and dropdown
behavior, with one continuous inward-strengthened edge. Density applies to each
style without shrinking text or clipping labels.

SearchField provides a compact rounded search surface with an accessible hidden
label, search icon, and clear action. Use it in libraries and filter toolbars.
The consumer owns searching and result feedback. Gallery demonstrates these
styles individually, across the field family, and in the Profile form; collection
filters and product search bars use their appropriate compact treatments.

## Interaction states

| State | Treatment and behavior |
| --- | --- |
| Resting | Quiet filled fields, persistent labels, clear hierarchy |
| Hover | Distinct surface/edge change; selected rows retain a visible hover change |
| Pressed | Immediate feedback; use the pressed role, never a layout jump |
| Focus | Visible keyboard cue; fields strengthen their existing edge inward |
| Selected | Shape/mark and accessible state accompany color |
| Invalid | Error text associated with the control; the error edge persists through focus/hover |
| Disabled | No activation or hover response; accessible disabled semantics |
| Loading | Prevent duplicate actions, retain a meaningful label and busy state |
| Empty/error | Explain the state and offer an applicable next action |

Focus returns to overlay triggers. When an action removes its trigger, the consuming
pattern moves focus to a stable nearby control. Use alerts for errors needing
attention and polite status messages for completion; avoid announcing initial
static content unnecessarily. Unsaved changes belong to the consuming workflow.
The new pattern demonstrates cancel confirmation and a dirty-only beforeunload
listener; integrate the same policy into a consuming app's router.

## Theme accessibility

Normal text targets 4.5:1 against its actual surface. Focus indicators and meaningful
non-text states target 3:1 against adjacent colors. Text, errors, selection, and
controls must remain identifiable independently of color. Soft field boundaries
are supplemented by persistent labels; high-contrast/forced-color modes strengthen
field edges. Disabled controls are intentionally subdued.

Theme accessibility computes eight representative normal-text pairings live.
These measurements are a focused check, not certification of every composition.
Run browser behavior and axe checks across both brands, modes, and key overlays;
review actual focus, forced colors, keyboard operation, reduced motion, and 200%
text. Test a shipped product with VoiceOver or another screen reader as well.
Changing a theme or a custom slot can change accessibility; keep those checks part
of product review.

Sidebar dropdowns use disclosure buttons with `aria-expanded` and `aria-controls`
and nested lists of native links. Closed lists stay mounted but hidden and out
of the tab order. Expansion is independent per section and per navigation
instance; desktop rail changes preserve it. Consumers own destination focus and
routing, as demonstrated by the Sidebar dropdowns pattern.

Page dropdowns live inside a section's list: `children` turns an item into a
disclosure, while leaf items keep native links and `aria-current="page"`. Use a
child destination for the parent overview. Section labels remain static by
default; `collapsible` on the group enables the independent section treatment.

Sidebar hierarchy uses section captions, stronger parent labels, and
indented child links. `--bbb-sidebar-nest-indent` aliases the shared spacing scale.
The compact rail reveals child icons in their original positions, preserving link names, selection, keyboard access, and text geometry.

### Application shell composition

Gallery and the Workspace shell pattern use a branded identity area above the
sidebar, with the logo beside the collapse control. The workspace header keeps
account access on the right. Sidebars contain navigation and bottom Help & resources. Gallery keeps
Appearance in its header and groups the library into Foundations, Components, and Patterns.
Workspace shell defaults to “Branded”. “Document” demonstrates a library and content
surface without a logo or global header, with account access in the document toolbar.
Both layouts retain their own example state when switching. DocumentWorkspace is
the shared component behind the Document pattern; example content
and application state stay in the pattern directory.
`--bbb-shell-header-height` coordinates Gallery’s header height and sidebar offset.

Get started shares Gallery's shell, appearance, and navigation. Its guide is
rendered from `docs/ADOPTION.md`, using shared CodeBlock, Link, and PageHeader.
`--bbb-guide-content-width` constrains reading lines; `--bbb-guide-nav-width`
controls the section navigation. On narrower layouts the section list moves
above the guide. Header measurements keep section bookmarks visible beneath
the sticky bar, including enlarged text and wrapped mobile controls.

Workspace shell demonstrates account and workspace access from the header avatar.
The current workspace name accompanies it at wide widths; compact layouts retain
its accessible name. Workspace edits survive switching during the preview session.
Account name editing, logout, and sign-in are local demonstrations. Consuming apps
own authentication, authorization, workspace data, and routing. Help & resources
provides downloads of the adoption guide, component documentation, and changelog.

## Product utilities and appearance

ThemeSwitcher controls a requested `light`, `dark`, or `system` preference;
ThemeProvider resolves the actual palette. The single sun/moon icon button switches
directly between light and dark, choosing the opposite of the system palette when
the preference is System. ThemeSwitcher has no segmented variant; AppearanceSettings
offers all three preferences. A product owns storing preferences.
Gallery stores them locally and starts with System when no preference is saved.
AppearanceSettings composes the shared selects without owning brand or account data.

AccountMenu is a popover with dialog semantics, allowing settings fields inside.
WorkspaceSwitcher supports the same selection as a field or a list of pressed
buttons. NotificationCenter owns presentation only; consumers supply notifications
and read/open/retry callbacks. Marking notifications read retains the focused action.

SplitPane uses `--bbb-split-default` (40), `--bbb-split-min` (20),
`--bbb-split-max` (80), and `--bbb-split-step` (5) as percentages. It samples these
values on mount. The 36rem container breakpoint stacks the panes. Pointer geometry
is measured at interaction time; the keyboard direction follows locale direction.
TreeView uses React Aria's treegrid behavior for expansion, selection, and typeahead.
ContextMenu keeps a visible trigger and leaves native text-editing context menus alone.

MediaPreview uses `--bbb-media-preview-height` (28rem) to bound image height and
existing dialog sizing for the enlarged view. CodeBlock uses the shared monospace,
spacing, surface, focus, and scroll-height tokens. Interface icons use Lucide
outline artwork through Icon, with a 24×24 view box, rounded strokes, currentColor,
`--bbb-icon-size` (1.125rem), and `--bbb-icon-stroke` (2). Choose recognizable
symbols and distinct silhouettes for adjacent destinations. Icons remain
decorative and non-focusable; label the containing control. Directional arrows
and chevrons mirror in RTL. IconProvider retains artwork customization and nested
inheritance; legacy BBB names resolve to the same Lucide artwork and overrides.
