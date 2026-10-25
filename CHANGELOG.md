# Changelog

## Unreleased

## 0.3.0 — 2026-10-26

Source release `0.3.0`; installer `@beepboopbit/ui` version `0.1.3`.

- Introduce the BBB homepage with interactive examples, brand previews, and direct
  setup links. Share site navigation and catalog search across the homepage,
  getting-started guide, component documentation, and Gallery.

- Add HoverCard previews with hover, keyboard, and touch access; NavigationMenu
  with grouped native links and disclosure controls; semantic/decorative
  Separator; and NativeSelect with shared field styles and native form behavior.
  Include gallery examples and source bundles. Add dedicated documentation for
  these four components plus Select, Dialog, Table, Calendar, and FileUpload,
  sharing the documentation layout with the composition controls. Make upload
  labels independent of document heading depth and name retry actions by file.

- Add ButtonGroup with split-action composition, Toggle and ToggleGroup,
  InputGroup with inline addons and multiline action bars, standalone Collapsible,
  and a bottom Drawer sharing Dialog focus and dismissal behavior. Include
  interactive Gallery examples, dedicated documentation pages, and copyable
  source bundles. The library now includes 80 component examples and 16 dedicated
  component documentation pages.

- Clarify the distinction between MIT-licensed code and BBB trademarks in the
  source documentation and installer README. Publish the updated installer
  documentation as CLI `0.1.3`.
- Refresh reviewed visual baselines for the redesigned site and update catalog
  search and tooltip checks to match its navigation and headings.

## Earlier development notes

- Publish the CLI through GitHub OIDC after verified Cloudflare deployment. Keep
  the checked tarball intact, tolerate npm processing delays, and support
  verification without another publish. Update onboarding and Gallery commands
  for the live npm installer. Prepare source 0.2.3 and CLI 0.1.2 for the first
  automated publication, preserving earlier frozen source releases.
- Make Get started usable before npm publication: install the repository CLI,
  fetch source from the deployed registry, verify stylesheet/provider setup, and
  run a working first component and production build. Explain Gallery downloads
  and common setup failures; keep future npm instructions separate. Prepare source
  0.2.2 because the guide also ships inside downloadable patterns.
- Make the README, onboarding guide, and installer README lead with the npm copy
  CLI inside the consuming app. Keep repository setup in maintainer guidance and
  state that npm publication is pending. Prepare source 0.2.1 and CLI 0.1.1 for
  these documentation updates, preserving frozen source 0.2.0.
- Run release checks and Cloudflare deployment only on tag pushes. Branch pushes,
  pull requests, and manual dispatch do not start the workflow; another tag does
  not cancel an active release.
- Prepare `@beepboopbit/ui` 0.1.0 and source 0.2.0 for ui.beepboopbit.com.
  Configure the default registry, retain immutable source snapshots across builds,
  and stage the site, CLI tarball, and checksums with `release:prepare`. Add GitHub
  Actions release, browser, visual, and independent consumer checks. Hosting and
  npm publication remain separate.
- Remove the five product demos and the Products category from Gallery, including
  product navigation, source bundles, and dedicated example tokens. Keep shared
  components and general patterns; older product links fall back to Gallery.
- Add the Get started route alongside Gallery, rendering the canonical adoption
  guide with copyable examples, section links, and guide downloads. Share desktop
  and mobile navigation, appearance, and browser history across both routes.
- Explain that CLI initialization needs an existing app, include Vite scaffolding
  instructions, and distinguish missing package files from invalid JSON.
- Add the independently packable `@beepboopbit/ui` installer with `bbb-ui init`,
  `add`, and `list`. Support local/HTTP registries, pinned source releases, dry
  runs, detected CSS setup, optional baseline, and compatible npm dependency
  installation. Check complete batches before writing and preserve edited files.
  Verify the packed CLI in an independent app across three browser engines.
  The public registry is live; npm publication of the installer is still pending.
- Distribute BBB as editable source bundles. Remove compiled-library packaging and
  the package barrel, replace package-based examples with local imports, and make
  fixtures load styles explicitly. Add complete component, foundation, pattern,
  and product bundles with dependency closure, release metadata, hashes, and notices.
- Separate component essentials from the optional application baseline. Generate
  portable brand declarations from canonical CSS and include a token sync script
  with copied preset data. Add Gallery source browsing/downloads, local copying
  that preserves edited files, and independent consumer verification.
- Add an MIT project license and source adoption/registry maintenance guidance.

- Add outlined, subtle, and plain field variants alongside the default filled
  treatment across text, dropdown, number, date/time, password/code, and tag fields.
  Add compact SearchField with clearing, Escape, native form reset, and translated
  labels. Use compact search/filter controls in Gallery and product compositions;
  keep command search and inline editing compact. Add Field styles and Search field
  examples and style choices in individual previews and the Profile form.

- Toast notifications support optional actions such as Undo, with an accessible
  label and consumer-controlled dismissal after the operation succeeds.

- Brand workspace follows Gallery’s mode until a preview mode is chosen; media demo artwork updates its canvas and palette when the theme changes.

- ThemeSwitcher uses a single sun/moon icon button for direct light/dark changes
  on click or keyboard activation. Remove its `variant` prop and three-option
  segmented presentation; Gallery uses the same icon button as the top navigation.
  System remains available in AppearanceSettings.

- Add sixteen shared product utility components, including the sun/moon icon
  ThemeSwitcher, appearance settings, account/workspace controls, notification
  center, code/copy tools, status/banner/bulk controls, tree, split pane, context
  menu, and image preview. Add English/Arabic labels and public APIs.
- Extend command items with navigation links and shortcut hints; allow controlled
  DropdownMenu state for contextual actions.
- Gallery now starts in System mode, exposes a dedicated theme control, persists
  navigation/search in URLs, and provides isolated examples, resets, lazy-loaded
  source, and API links. Add seventeen component examples using the shared controls.
- Expand Settings with profile, appearance, language, and account actions; compose
  shared account/workspace controls and consistent product appearance/notifications.


- Reusable BrandPreset objects, createBrand, and BrandLogo; retain named BBB/Studio
  presets and support consumer identities without component changes.
- Brand workspace with identity/token editing, light/dark previews, 38-pair contrast
  checks, local persistence, validated JSON import, and JSON/scoped CSS export.
- Independent heading/wordmark font roles and supporting pressed colors. Explicit
  nested brands reset inherited token overrides; mode changes resolve their own
  palette. Reduced-motion preferences override custom transition durations.

- Define the BBB wordmark as lowercase `bbb.` with an accent-colored final period,
  for BBB product identity.

- Sliders lift with animated hover/drag shadows and settle on release. Add optional
  `keyboardStep`; Gallery sliders drag smoothly while arrow keys adjust by five.

- Keep Select dropdown chevrons vertically centered while opening and closing.

- Clearer sidebar hierarchy with indented child links, stronger
  parent labels, and child selection fills inset beneath their parent.

- Sidebar page dropdowns with nested destinations; the Gallery pattern defaults
  to static section labels and retains a Sections variant.

- Content and Internationalization foundations, with English/Arabic shared-control
  dictionaries, typed message overrides, localized numbers, and RTL portal support.
- PasswordField, VerificationCode, DescriptionList, Toolbar, InlineEdit,
  CommandSearch, and CommandPalette. Authentication reuses the new fields.
- Optional table column visibility, pointer/keyboard resizing, and expandable rows;
  Advanced table and Workspace search patterns demonstrate complete interactions.
- Cross-browser completion checks in Chromium, Firefox, and WebKit; a pinned
  container runner and reviewed Gallery screenshot baselines; catalog-aware counts.
- Keep calendars and date-picker popups sized to their seven day columns, with
  internal scrolling at narrow widths and enlarged text.
- Correct slider fill thickness, enlarge handles, and retain comfortable drag
  targets. Add `--bbb-slider-track-height` for independent track customization.

## 0.2.0 — 2026-10-14

- Standardize interface icons on Lucide through the shared Icon component and
  runtime dependency. Add canonical names for navigation, terminal, workflow,
  voice, and editing controls; keep the original BBB names as compatible aliases.
- Preserve decorative SVG semantics, directional mirroring, token customization,
  and nested IconProvider artwork overrides across canonical names and aliases.
  Set the default icon stroke to 2.
- Show the canonical Lucide selection in Gallery's Iconography foundation and
  document the shared icon convention for consuming products.

## 0.1.1 — 2026-10-13

- Keep tooltip text readable in light and dark modes when theme styles load after
  component styles. Portaled tooltips retain their inverse text/surface colors
  across BBB, Studio, and consumer brands.

## 0.1.0 — 2026-09-22

- Expandable SidebarNavigation groups with keyboard disclosures, icon-rail
  support, and a Sidebar dropdowns Gallery pattern.

- First local-installable ES module library with exported component prop types,
  explicit styles/token entry points, and React peer dependencies.
- BBB and Studio themes with light/dark/system modes, density, scoped token
  overrides, portal inheritance, and Gallery appearance preferences/CSS export.
- Custom icon artwork, rich option/menu content, sidebar icon slots, and overlay
  classes, with documented customization conventions.
- Calendar, date/date-range/time pickers, number field, multi-select, tag entry,
  file upload, slider/range slider, segmented control, and stepper.
- Motion, iconography, layout/density, interaction states, customization, themes,
  and live contrast Gallery foundations.
- Authentication/recovery, onboarding, multi-step form, unsaved changes, and page
  recovery patterns, with local simulations and no backend integration.
- Existing components retain their current props and behavior. Root-only token
  overrides should move to ThemeProvider `tokens` when using scoped providers,
  especially for portaled content. See docs/CUSTOMIZATION.md.

### Gallery navigation refresh

- Gallery and Workspace shell default to a branded identity area with the sidebar toggle. Workspace shell also demonstrates a document layout without a logo or global header.
- Gallery has direct product destinations and bottom Help & resources with downloadable guides.
- Workspace shell demonstrates a combined account/workspace popover, workspace switching, editable account name, and local logout/sign-in.
- `--bbb-shell-header-height` coordinates the Gallery header and fixed navigation offset.

- Replace the bbb-notes card layout with a logo-free library sidebar and document
  workspace, including notebook filters, a collapsed navigation rail, mobile library
  sheet, and account/workspace switching with separate local collections.

- Add DocumentWorkspace with navigation, document tools, account, content, and footer
  slots. Workspace shell’s Document pattern and bbb-notes share its responsive
  layout, icon rail, mobile navigation, and focus restoration.
