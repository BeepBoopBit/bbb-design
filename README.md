# BBB design system

Editable React components, design foundations, and patterns for BBB products.
Copy the source into your app, customize it, and own the files.

[Explore Gallery](https://ui.beepboopbit.com) ·
[Get started](https://ui.beepboopbit.com/getting-started)

## Add to your app

Use Node.js 24 and npm with an existing React 19.2.x, TypeScript 6.x, Vite app
using plain CSS. [Create an app first](docs/ADOPTION.md#create-an-app) if needed.
Run the published installer inside your app. The CLI downloads components from
the [live source registry](https://ui.beepboopbit.com/r/manifest.json); no BBB
repository clone is needed:

```sh
npx @beepboopbit/ui@latest init --dry-run
npx @beepboopbit/ui@latest init
npx @beepboopbit/ui@latest add button text-field dialog
npx @beepboopbit/ui@latest list
```

The CLI downloads from `https://ui.beepboopbit.com/r/`, copies complete source and
styles into `src/bbb/`, and installs missing third-party dependencies. `init` sets
up the stylesheet and prints a ThemeProvider snippet to place around your app.
Import components from your copied files and edit them freely. The installer is
not a runtime dependency, and there is no `bbb-design` component package to install.

`--dry-run` previews changes. Existing edits are preserved, and `bbb.json` plus the
copied `.bbb-source.json` record keep later additions on the same source release.
Follow [Get started](https://ui.beepboopbit.com/getting-started) or the
[adoption guide](docs/ADOPTION.md) for exact directory choices, stylesheet and
ThemeProvider setup, a working first component, and production builds. Gallery's
**View code** also offers manual bundle downloads without a repository clone.
`npx` runs the installer without adding it as an app dependency.

## Documentation

- [Copying source and updates](docs/ADOPTION.md)
- [CLI commands](packages/cli/README.md)
- [Registry generation and maintenance](docs/REGISTRY.md)
- [Brand, token, icon, and component customization](docs/CUSTOMIZATION.md)
- [Reusable presets and the brand workspace](docs/BRANDS.md)
- [Motion, layout, state, and accessibility foundations](docs/FOUNDATIONS.md)
- [Content and language](docs/CONTENT.md)
- [Browser and visual verification](docs/QUALITY.md)
- [Releases and deployment](docs/RELEASING.md)
- [Changelog](CHANGELOG.md)

New controls include calendar/date/range/time inputs, numeric stepping, multi-select,
tag entry, uploads, sliders, segmented controls, and step progress. New patterns
cover sign-in/password recovery, onboarding, multi-step validation and retry, dirty
form confirmation, and loading/offline/access/not-found recovery. These examples
use local state; authentication, saving, and upload progress are demonstrations.

## Gallery and component development

To work on BBB itself, use Node.js 24 and npm in this repository:

```sh
npm ci
npm run dev
```

The development server listens on `0.0.0.0` for access from other devices on your
network. Open the URL printed by Vite. Both `/` and `/gallery` display Gallery;
`/getting-started` renders the setup guide from `docs/ADOPTION.md`.

Use the single sun/moon icon button for a quick mode change, or **Appearance** to
switch BBB/Studio, light/dark/system mode, and comfortable/compact density. Themes
demonstrates both brands and exports CSS; Theme accessibility checks live color pairings.

Our design principle is **Apple-quality craft**: clean, modern interfaces with
clear hierarchy, generous space, quiet surfaces, and careful interaction details.
BBB keeps its own visual language while aiming for the finish and familiarity of
a first-party Apple app. Gallery makes this standard visible through three
principles: clarity comes first, space to breathe, and care in every detail.

Gallery includes fifteen foundations, seventy component examples, and twelve
patterns. Components cover actions, forms, identity, content, menus, navigation,
and feedback. Patterns combine them into complete experiences: Profile form,
Settings, Collection, Workspace shell, and Sidebar dropdowns.
Search by name or keyword, or filter by category. URLs preserve the selected category, search, or isolated example. Each card offers source code, reset, API documentation, and a direct link. The previews use real shared components;
FilterGroup and Icon also appear throughout the Gallery controls.

Interface icons use [Lucide](https://lucide.dev/) outline artwork through the shared
`Icon` component. Prefer canonical Lucide names; the original BBB names remain
compatible aliases. Use `lucideIconNames` for the canonical selection or
`iconNames` to include aliases. Size and stroke follow `--bbb-icon-size` and
`--bbb-icon-stroke` (2). Extend the shared registry with named Lucide imports
instead of maintaining parallel SVG sets in products. Lucide is distributed under
the ISC license; its notice is included in `LICENSE-LUCIDE`.

React Aria Components supplies unstyled keyboard, selection, and overlay behavior.
BBB controls their appearance through the shared tokens. TextField and Textarea retain native form elements.
Select, Combobox, and DropdownMenu share the same floating surface and option styling. See the [component API guide](./src/components/README.md)
for all props, usage examples, and interaction contracts.

Develop pages by composing components. Define all visual values in
`src/foundations/tokens.css`, then reference those variables from component styles.
The palette and scale evolve together, guided by this quality standard.

- **Color:** Pearl and white surfaces, Bit Ink text, Ember actions, and Sea Teal
  supporting details. Soft Sand adds restrained warmth. Semantic success, warning,
  and error colors remain distinct. Hover, pressed, and focus values are shared.
- **Type:** native system fonts (San Francisco on Apple platforms), a readable
  12–24px supporting scale, and a fluid 40–52px page title at the default root size.
- **Space and shape:** a 4px spacing rhythm, 8/12/16/20px corner radii, and 44px
  standard buttons. Labeled fields have a 72px minimum height with room to grow;
  compact buttons are 36px and switch interaction areas are 44px.
- **Depth and motion:** inset, base, and translucent surfaces; subtle card,
  control, and raised shadows. Control transitions are 160ms; tab selection
  and panel transitions are 240ms. Reduced motion removes transitions and spinner
  rotation while keeping the loading label visible.

All values live in `src/foundations/tokens.css`; there are no downloaded fonts or
external assets. The `--bbb-color-accent` token drives buttons, switches, and the
color and spacing previews together. `--bbb-color-supporting` supplies Teal for
navigation, details, and focus. Use `--bbb-radius-*` for shape and
`--bbb-shadow-*` for elevation, as demonstrated by the Surfaces preview.

See [BBB brand colors](./src/foundations/BRAND.md) for the new palette, its connection
to BeepBoopBit's orange/teal/ink/sand identity, and accessible color pairings. This
replaces the old `beepboopbit-colors.scss` snapshot with the live CSS tokens used by
the app. Import `src/foundations/tokens.css` in other products to reuse the system.

| Component   | Main props                                                                                         | Native behavior                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Button      | `variant`: primary / secondary / ghost / danger; `size`: sm / md; `loading`; `iconOnly`; `onPress` | Common button attributes and button ref; loading adds a spinner, sets `aria-busy`, and disables activation; defaults to `type="button"` |
| Badge       | `tone`: neutral / accent / success / warning; `dot`                                                | Span attributes and children                                                                                                            |
| TextField   | `label`, `hideLabel`, `hint`, `error`, `leadingIcon`, `trailingAction`                             | Input attributes and ref; associates labels and messages with the input                                                                 |
| FilterGroup | `label`, `value`, `options`, `onChange`                                                            | A labeled group of buttons with pressed states                                                                                          |
| Switch      | `label`, `description`, `checked` / `defaultChecked`, `onChange`, `disabled`                       | Native checkbox with switch semantics; supports Space, form attributes, and an input ref                                                |
| Icon        | `name`: see `IconName` in `Icon.tsx`                                                               | Decorative SVG; give its parent control an accessible name                                                                              |

Keep meaningful text inside a loading Button (for example, `Saving…`); the spinner
is decorative. Switch supports both controlled and uncontrolled state. Its visible
label and optional description are associated with the input. TextField preserves
native input attributes and associates `error` or `hint` with the input; an error
also sets `aria-invalid`.

Fields use soft filled surfaces with persistent inset labels and generous padding.
Focus and errors share one continuous edge, without an additional ring. The full
Profile form preview shows these controls together, with local save, discard,
validation, and responsive layouts.
Find it under **Patterns**, alongside a Settings composition with workspace
members, preferences, and local invitations. Avatars, avatar groups, cards, list
rows, settings sections, and empty states each have their own **Components** entry.
Photo selection and invitation actions affect only their local examples.
Checkboxes have animated marks; radio options sit in a shared inset surface.

The **Collection** pattern composes Table, Pagination, Filter chips, Breadcrumbs,
and Link with the existing form controls and overlays. Search and filters narrow
the projects; sortable headers reorder them. Row selection carries across pages,
with a visible count before bulk archiving. Row menus restore archived projects,
and project names open detail dialogs. Refresh demonstrates loading without
resetting local edits. Filter changes clear selection and return to the first
page. Empty results offer recovery, and narrow tables scroll within their own
surface. All project actions use local sample data.

The **Workspace shell** pattern composes Sidebar navigation, Page header, and
Sheet into an application workspace with Overview, Projects, and Members views.
Its sidebar becomes a navigation sheet when the example has less space. Selecting
a destination focuses its heading; dismissing the sheet returns to the menu
button. Workspace details can be edited, saved, or canceled in a separate sheet,
and each project has a details sheet. These actions update local example state.
The three new components also have independent **Components** previews.

On desktop, the icon beside the sidebar title switches between the full sidebar
and a compact icon rail. Destinations remain clickable, the current view stays
highlighted, and tooltips identify each icon on hover or keyboard focus. The same
toggle expands the sidebar and retains focus. Icons and rows keep their position
while full-size labels reveal smoothly, including when a toggle is reversed
mid-animation. Reduced motion makes both transitions instant. The current view
and desktop collapse preference survive switches to the mobile layout.

The Gallery page uses the same SidebarNavigation, SidebarToggle, and Sheet as
this pattern. Collapse the sidebar beside the BBB title to keep navigating by
icon, then use the same toggle to show labels again. On narrow screens, the menu opens the library in a navigation
sheet. Category links stay in sync with the filters, preserve search, and move
focus to the content after selection.

Sheets share Dialog's modal behavior, with an independently scrolling body,
persistent header/actions, and reduced-motion support. Gallery previews and
control labels reflow at enlarged text sizes, including 200% text at 320px.

In Gallery, try the dropdowns by keyboard, submit or cancel a dialog, switch tabs,
expand an accordion, or display a notification. Form examples demonstrate
validation and disabled states; Combobox also has error, loading, and empty results.
Progress can advance to completion, and Skeleton reveals its loaded content.
Disabled controls and the loading Button are intentionally inactive examples.
Search and category changes derive their counts from the catalog.

To add a gallery entry:

1. Build a reusable piece in `src/components/`, or extend a foundation.
2. Create its live preview in `src/pages/Gallery/previews/`. For a complete task or
   screen composed from shared pieces, use `src/pages/Gallery/patterns/` instead.
3. Register it in `src/pages/Gallery/galleryItems.ts` with a category, description,
   and search keywords. Counts and filters derive from this catalog.

Use **Patterns** for complete compositions. Keep their copy, layout, and sample
state in Gallery, and their reusable
controls in `src/components/`. Pages are actual app routes; Gallery is currently the app's page.

## Checks and production build

```sh
npm run lint
npm run build
npm run build:registry
npm run test:registry
npm run test:copy
npm test
npm run test:browsers
npm run test:visual
npm run preview
```

The build command checks TypeScript and writes the production app to `dist/`.
The preview command serves that build locally. Use `npm ci` for reproducible
installs from the lockfile.

`npm test` runs Playwright behavior checks and axe accessibility scans in Chromium,
including narrow layouts and open overlays. Install the browser once with
`npx playwright install chromium` (or `npx playwright install --with-deps chromium`
on a Linux CI image). Tests start an isolated Vite server on port 5180. Traces for
failures are written to the ignored `test-results/` directory. Runtime UI libraries
are split into a separate production chunk for caching.

`npm run release:prepare` stages the site, source registry, and CLI tarball locally.
GitHub Actions runs release, browser, visual, hosting, and packed-consumer checks
only when a Git tag is pushed. Passing checks deploy that tag's checked site to
`ui.beepboopbit.com`. Once npm trusted publishing is configured and enabled, new
CLI versions publish after deployment verification. Branch pushes and pull requests
do not run the workflow.
See [releases and deployment](docs/RELEASING.md) before pushing a release tag.

The open Combobox scan excludes React Aria's documented
[`aria-hidden-focus` false positive](https://github.com/adobe/react-spectrum/wiki/Known-accessibility-false-positives).
Separate keyboard checks verify Tab/Shift+Tab dismissal and background restoration.
Other scans keep the rule enabled. Browser automation does not replace testing
with VoiceOver or other assistive technology.

The completion suite also runs in Firefox and WebKit through `test:browsers`.
Visual baselines cover brands, modes, density, RTL, enlarged text, and key overlays.
Use `npm run test:container -- --project=visual` for the pinned rendering environment;
see [the quality guide](docs/QUALITY.md) for browser setup and snapshot review.

New foundations cover content conventions and internationalization. ThemeProvider
accepts shared message overrides, derives direction from the locale, and carries
language into portals. New controls include PasswordField, VerificationCode,
DescriptionList, Toolbar, InlineEdit, CommandSearch, and CommandPalette. Workspace
search and Advanced table patterns demonstrate their use; Authentication now
composes the shared password and code inputs.

See the [foundations guide](docs/FOUNDATIONS.md) for shared behavior and
accessibility conventions.

**Brand workspace** edits reusable presets with logos, common tokens, and both
color modes. Try BBB, Studio, or the consumer-defined Fieldnotes example; review
38 contrast pairings, save a local preset, or import/export JSON and scoped CSS.
Custom presets go directly into ThemeProvider without component changes.

Scaffolded with Vite's official [React + TypeScript template](https://vite.dev/guide/).

## License

BBB source is available under the [MIT license](LICENSE). Keep the included
[Lucide notice](LICENSE-LUCIDE) when copying source.
