# Make the system yours

BBB is the default identity. Studio is a second, deliberately different identity
used to verify that shared components can change brand without being copied.
Both include coordinated light and dark palettes. All values, including preset
values, live in `src/foundations/tokens.css`.

## Choose a preset

```tsx
import { ThemeProvider } from './bbb/components/ThemeProvider/ThemeProvider'
import { Button } from './bbb/components/Button/Button'
import './bbb/foundations/styles.css'

<ThemeProvider brand="studio" mode="system" density="comfortable" locale="en-US">
  <Button>Continue</Button>
</ThemeProvider>
```

`brand` is `bbb`, `studio`, or a reusable `BrandPreset` object. See
[brand presets and the Gallery workspace](BRANDS.md) to create, validate, and export
another identity. `mode` is `light`, `dark`, or `system`; system mode
responds to OS changes. `density` is `comfortable` or `compact`. Compact reduces
control and row heights; coarse pointer devices retain comfortable button targets.
Nested providers inherit unspecified choices. An explicit `brand` resets inherited
token overrides; a nested provider without `brand` retains them. Each provider is a real div: put it
around a page or a meaningful group, not between a table and its rows.

The Gallery Appearance popover applies these options to the whole application
and remembers them locally. Themes shows both brands side by side. Open a select
or dialog inside either sample: its portal retains that sample's brand, mode,
density, direction, and token overrides.

## Override tokens

The three layers are identity (`--bbb-brand-*`), semantic roles
(`--bbb-color-accent`, `--bbb-color-text`, etc.), and a small number of component
roles (`--bbb-button-radius`, `--bbb-field-radius`). Shared scale tokens control
typography, spacing, dimensions, shadows, and motion. Keep the stable `--bbb-`
namespace when using a different brand.

```tsx
<ThemeProvider
  tokens={{
    '--bbb-font-sans': 'Inter, system-ui, sans-serif',
    '--bbb-button-radius': 'var(--bbb-radius-full)',
    '--bbb-field-radius': 'var(--bbb-radius-md)',
  }}
>
  <YourApplication />
</ThemeProvider>
```

Load any custom font in the consuming app. `tokens` is the preferred override API:
its values propagate into portaled menus, tooltips, dialogs, sheets, and toasts.
It accepts CSS variable values and is typed as `ThemeTokens`. Use `className` and
`style` for the provider's layout; CSS variables supplied only through arbitrary
ancestor CSS or `style` are not automatically copied into portals.

Override a **complete color family**, separately for light and dark:

| Family | Roles to coordinate |
| --- | --- |
| Primary | `brand-ember`, `color-accent-hover`, `color-accent-pressed`, `color-accent-text`, `color-accent-subtle`, `color-on-accent` |
| Supporting | `brand-teal`, `color-supporting-hover`, `color-supporting-subtle`, `color-supporting-subtle-hover`, `color-focus` |
| Neutrals | `brand-ink`, `brand-pearl`, `brand-sand`; all surface, text, border, field, and scrim roles |
| Outcomes | Success, warning, and danger foreground/tint pairs; danger hover/pressed and `color-on-danger` |
| Depth | Shadow roles appropriate to the surfaces and mode |

Every name in this table has the `--bbb-` prefix. Brand aliases are resolved at
each theme boundary. Changing only the brand's main hex value does not generate
coordinated hover/pressed/tint colors. Status colors describe outcomes, independently
of the chosen accent. Start from either complete preset, then replace the needed
families and verify contrast.

The Themes example can export a resolved CSS snapshot of either sample, including
current density, mode, and the button shape override. It is a starting point for a
static stylesheet, not an automatic light/dark palette generator. The selector is
`[data-bbb-theme].my-brand`; apply that class to each boundary, including portal
roots, or translate its overrides into the provider's `tokens` prop. Resolved
snapshots intentionally do not retain alias relationships. Export light and dark
separately if you need both.

## Customize a component

Fields accept `variant="filled" | "outlined" | "subtle" | "plain"`. Use outlined
fields for simple forms, subtle fields for supporting controls, and plain fields
inside toolbars or inline editing. The filled style remains the default. Labels
move above the surface in the other styles; their value/change APIs stay the same.
SearchField provides compact rounded search bars and accepts subtle, outlined,
and plain variants. Its `onChange` receives a string. Use `--bbb-search-radius`
to change search shape; its default is `var(--bbb-radius-full)`. Field heights use
`--bbb-control-height` for simple styles and `--bbb-field-height` for inset labels.
Dropdowns retain their shared option surface and keyboard behavior in every style.

Prefer existing variants, composition props, and tokens before overriding CSS.
Prop types are exported alongside each copied component; components use `className` where
styling a root makes sense. Existing fields retain their established value and
change APIs; wrappers document where native events differ from selected values.

- `Button`: children support icons and content; `className`, native styles and
  ref remain available. `--bbb-button-radius` changes only action button shape.
- `TextField`: `leadingIcon` and `trailingAction`; its `className` styles the field
  wrapper and the ref targets the input. Native input `style` styles the input.
- `Select`, `Combobox`, `MultiSelect`: options accept `leading` and `description`.
  `renderOption(option)` can replace option contents. Keep the plain `label` for
  accessible naming and typeahead. Do not put independent buttons inside options.
- `DropdownMenu`: `leading` on actions and `renderItem`; preserve action labels.
- `Dialog`/`Sheet`: trigger, body, footer, `className`, `bodyClassName`, `closeLabel`.
  `Popover` and `Tooltip` accept root classes. Provider tokens reach their portals.
- `SidebarNavigation`: `leading` accepts a custom icon node alongside the default
  `icon` name; native nav attributes and `className` are supported.
- `Card`, `PageHeader`, `ListRow`, `EmptyState`: use their existing content/action
  slots for product composition; keep routing and business state in the app.

Replace the artwork behind named icons without changing component code:

BBB uses Lucide outline icons through its shared `Icon` component. Prefer
canonical Lucide names, such as `house`, `messages-square`, `square-terminal`,
and `workflow`. `lucideIconNames` lists the shared Lucide selection;
`iconNames` also includes the original BBB names for compatibility. Add named
imports to `src/components/Icon/iconData.tsx` when extending this selection,
instead of importing the entire Lucide catalog or copying SVG paths into products.

```tsx
import { IconProvider, Icon } from './bbb/components/Icon/Icon'

<IconProvider icons={{
  check: <path d="m5 12 4 4L19 6" />,
}}>
  <Icon name="check" />
</IconProvider>
```

Overrides are SVG children in a 24×24 view box. Size comes from
`--bbb-icon-size` (1.125rem) and stroke from `--bbb-icon-stroke` (2); color
inherits currentColor. Nested providers merge overrides. Legacy names, such as
`close` and `sparkle`, resolve to `x` and `sparkles`, including artwork
overrides. Icons are decorative; label the containing control. Reserve artwork
overrides for deliberate identity customization; use Lucide for interface symbols.

For a new interaction, compose the public FieldSurface, FormField, DropdownSurface,
and React Aria primitives. Preserve labels, keyboard behavior, validation, focus
return, reduced motion, and theme attributes on portals. `useThemeAttributes()`
provides those attributes for custom portaled roots; add the `bbb-theme` class.

## Localization

`locale` configures React Aria number/date formatting and interaction direction.
ThemeProvider derives `dir` from an explicit locale unless you override it. Nested
providers inherit the parent locale and direction. Both `lang` and `dir` reach
portaled surfaces. Keep an explicit direction consistent with the locale.
Translate product copy, field labels, custom validation, and overlay close labels
in the consuming app. Some existing wrappers retain English default messages;
this release does not promise fully translated built-in copy. Review the full
product with long translations, RTL, text zoom, and local date conventions.

## Shared interface messages

English and Arabic dictionaries cover shared controls, including menu placeholders,
pagination, table actions, uploads, tags, modal dismissal, and password reveal.
Supply a typed `Messages` override for another language or different terminology:

```tsx
<ThemeProvider
  locale="de-DE"
  messages={{
    closeDialog: 'Dialog schließen',
    save: 'Änderungen speichern',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort ausblenden',
    remove: '{name} entfernen',
  }}
>
  <YourApplication />
</ThemeProvider>
```

Named placeholders are interpolated as text; numeric values use the selected
locale. English is the fallback for keys omitted from an unsupported locale's
dictionary. Exported `englishMessages`, `arabicMessages`, `Messages`, and `MessageKey`
provide the complete contract. Use `useMessages()` for consistent shared labels
and number formatting inside a custom composed control.

Nested providers with the same locale inherit message overrides. Switching locale
starts with that language's defaults and the child's overrides. Context continues
through portals. Messages do not translate product content, which remains in the
consumer's translation system. The Internationalization foundation demonstrates
Arabic fields, dates, currency, pagination, and a modal in a scoped provider.

### Document workspaces

Use `DocumentWorkspace` for a library beside a document surface without a global
header. Supply navigation through its render slot, document actions through `tools`,
and an account/workspace control through `account`. The account slot belongs in the
document toolbar; it does not move into navigation in compact layouts. Supply your
own content, footer/status, and translated accessible labels. Use `className` for
composition styling. The component creates its own responsive container and uses
shared sidebar dimensions, surfaces, spacing, and motion tokens. See the Workspace
shell Document pattern for a complete example.

## Product utility compositions

ThemeSwitcher is controlled: connect `value` and `onChange` to the same preference
passed to ThemeProvider. Its single icon button toggles light/dark immediately;
use AppearanceSettings when all three mode choices are needed.
AppearanceSettings offers a children slot for app-specific brand/locale preferences.
AccountMenu offers a custom trigger, action descriptors, and arbitrary settings
content; WorkspaceSwitcher offers create/manage action slots. Neither owns accounts,
sessions, workspaces, or persistence. NotificationCenter similarly uses caller data.

Use SplitPane's `--bbb-split-*` percentage tokens before mounting to change initial
size and limits. New controls use existing semantic colors and text/spacing tokens;
custom brands need no new palette branches. MediaPreview's maximum image height is
`--bbb-media-preview-height`. All shared utility labels have English and Arabic
messages and can be overridden through ThemeProvider's typed `messages` prop.
