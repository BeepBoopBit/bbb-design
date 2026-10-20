# BBB brand colors

BBB pairs the warmth of orange and sand with the calm of sea teal and dark ink.
This palette reinterprets BeepBoopBit's original color families with quieter
neutrals, less saturated supporting colors, and deliberate contrast. It carries
the clean, modern finish of the design system into a recognizably BBB identity.

The production palette lives in [tokens.css](./tokens.css). It replaces the old
`beepboopbit-colors.scss` snapshot; no Sass, legacy scene colors, or copied theme
maps are needed. Import `tokens.css` once to use the palette in another product.
BBB remains the default brand. The token source also defines BBB dark mode and
Studio light/dark presets. ThemeProvider scopes the selected palette and carries
it into overlays. See [customization](../../docs/CUSTOMIZATION.md) for the full
override contract and [foundations](../../docs/FOUNDATIONS.md) for verification.

## Wordmark

The BBB logo is the lowercase wordmark **bbb.** The letters use the primary text
color (`--bbb-color-text`), and only the final period uses the accent color
(`--bbb-color-accent`): Bit Ink with a Boop Ember dot in the default light palette.
Use the corresponding theme roles on dark surfaces so both remain visible.

Keep the letters and period together on one baseline, without a space before the
dot. The period is slightly larger: `--bbb-brand-dot-size` is `1.25em`, relative
to the wordmark's text size, without increasing the line height.
Preserve lowercase spelling and left-to-right order in every locale. Use the
shared bold sans-serif typography and tight tracking, as shown in Gallery's
navigation. The wordmark itself needs no symbol, enclosing shape, or extra effect.
An accompanying product descriptor is separate from the logo. When the logo is a
link, name its destination for assistive technology.

## Identity palette

| Color      | Value     | Identity token      | Purpose                                                                       |
| ---------- | --------- | ------------------- | ----------------------------------------------------------------------------- |
| Bit Ink    | `#252B2A` | `--bbb-brand-ink`   | Soft charcoal with a trace of sea green; text and identity.                   |
| Boop Ember | `#BD542F` | `--bbb-brand-ember` | A warmer, quieter orange for primary actions and selected controls.           |
| Sea Teal   | `#327476` | `--bbb-brand-teal`  | Muted teal for navigation, supporting details, and focus.                     |
| Soft Sand  | `#E9DFD1` | `--bbb-brand-sand`  | A pale echo of the original wood and sand, used in small supporting surfaces. |
| Pearl      | `#F6F5F3` | `--bbb-brand-pearl` | A near-white canvas with enough warmth to connect the palette.                |

## Use color with a purpose

- Let Pearl, white, and Ink do most of the work. Keep large surfaces calm.
- Use Ember for the next action. Pair filled actions with `--bbb-color-on-accent`.
  Use the dedicated hover and pressed tokens for interaction feedback.
- Use `--bbb-color-accent-text` for orange text and accent badges. It is darker
  than the action fill so small text stays readable on pale surfaces.
- Pair Teal with `--bbb-color-supporting-subtle` for supporting navigation and
  details. Focus uses Teal to remain distinct on the existing field edge or the keyboard-focused choice row.
  Filter chips, selected table rows, and current page buttons use this tint;
  `--bbb-color-supporting-subtle-hover` deepens it on hover. Chip and current-page
  text uses the darker `--bbb-color-supporting-hover` role for contrast.
- Use Sand sparingly as a supporting surface, with Ink for text. The Surfaces
  preview demonstrates this relationship.
- Reserve green, ochre, and rose for success, warning, and error. Keep a label
  or icon with status colors; an orange primary action does not indicate warning.

## Component roles

Components consume semantic roles, while brand artwork can use identity swatches.
These aliases let the palette change without rewriting component styles.

| Semantic role              | Source / use                                      |
| -------------------------- | ------------------------------------------------- |
| `--bbb-color-canvas`       | Pearl; main page background.                      |
| `--bbb-color-text`         | Bit Ink; headings and body text.                  |
| `--bbb-color-accent`       | Boop Ember; primary buttons and enabled switches. |
| `--bbb-color-accent-text`  | Darker Ember; ghost buttons and accent badges.    |
| `--bbb-color-supporting`   | Sea Teal; navigation and supporting icons.        |
| `--bbb-color-focus`        | Sea Teal; keyboard focus indicators.              |
| `--bbb-color-surface-warm` | Soft Sand; small, warm supporting surfaces.       |

White text on Ember, darker Ember on its pale tint, and Teal on its pale tint
meet a 4.5:1 contrast target. Normal text and status text are checked against
their intended surfaces; focus and validation indicators target 3:1 against
adjacent pale surfaces. Disabled controls are intentionally subdued. Recheck
contrast whenever a color or pairing changes.

Tooltips reverse the normal text/surface pairing: `--bbb-color-text` fills the
tooltip and `--bbb-color-surface` colors its text. Keep this pairing above the
theme root's default text styling so portaled tips stay readable in both modes.

Fields use `--bbb-color-field-surface` with a transparent resting edge and
persistent inset labels. Hover uses `--bbb-color-field-hover-surface` and
`--bbb-color-field-hover-border`. These quiet resting fills and hover edges do
not provide 3:1 boundary contrast; labels and values carry the readable hierarchy.
Focus strengthens the same edge in Teal, while invalid fields keep the danger
color through hover and focus. Increased-contrast preferences add the stronger
border role; forced colors retain an inward focus outline.

Simple field variants keep the same semantic colors and interaction edge.
`outlined` pairs `--bbb-color-surface` with `--bbb-color-border-strong` at rest;
`subtle` keeps the quiet field fill, and `plain` starts transparent. Their labels
sit above the surface. SearchField uses the subtle treatment by default with a
compact rounded shape. Check border, text, focus, and error contrast on the
actual consuming surface in both modes and identities.

Gallery's Color preview uses these same roles. Changing the Ember identity token
updates its swatch, primary buttons, and switches; changing Teal updates its
swatch, navigation, and focus. Keep interaction shades and tints coordinated when
replacing an entire color family.

## Modes and other identities

Dark mode uses lighter action/status foregrounds, dark filled-action text, and
coordinated dark surfaces; destructive fills have their own on-danger role.
Studio uses cool violet/blue families and tighter corners while retaining the
same semantics and interaction quality. Preset definitions stay in tokens.css.
Use Gallery Appearance to review either mode and Theme accessibility to inspect
representative text pairings. Exported snapshots are mode-specific.
