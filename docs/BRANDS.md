# Reusable brand presets

A `BrandPreset` carries an identity, common visual choices, and complete light/dark
color maps. Pass the object directly to ThemeProvider; custom brands do not need
registration or changes to shared components. The named `bbb` and `studio` options
remain supported.

```tsx
import { createBrand, studioBrand } from './bbb/foundations/brands'
import { ThemeProvider } from './bbb/components/ThemeProvider/ThemeProvider'
import { BrandLogo } from './bbb/components/BrandLogo/BrandLogo'
import { Button } from './bbb/components/Button/Button'
import './bbb/foundations/styles.css'

const north = createBrand({
  id: 'north',
  name: 'North',
  extends: studioBrand,
  logo: { type: 'wordmark', text: 'north', suffix: '.', label: 'North' },
  tokens: {
    '--bbb-font-heading': 'var(--bbb-font-serif)',
    '--bbb-button-radius': 'var(--bbb-radius-full)',
  },
})

<ThemeProvider brand={north} mode="system">
  <BrandLogo />
  <Button>Continue</Button>
</ThemeProvider>
```

## Configuration and precedence

`schemaVersion: 1` identifies BBB's brand file format. `id` is a stable
lowercase identifier containing letters, digits, or hyphens; `name` is its readable
name. `logo` is either a wordmark or mode-specific image. `tokens` contains shared
typography, shape, spacing, depth, and motion choices. `modes.light` and `modes.dark`
contain complete color families and any mode-specific overrides, including shadows.
This is a BBB preset format; it is not a DTCG token interchange file.

`createBrand` inherits from BBB unless `extends` is supplied. It merges common
tokens and each color mode separately. Inheritance is flattened into the resulting
object, so JSON files do not depend on a separate preset registry. Treat exported
presets as immutable and use `createBrand` to derive a new identity.

Values resolve in this order: shared CSS foundations, preset common tokens, the
selected mode, then the provider's `tokens` overrides. Put color changes in both
mode maps; an existing mode value takes precedence over a common value. A nested
provider with no `brand` inherits its parent's preset and explicit overrides.
Changing only `mode` resolves that preset again, without leaking the previous
mode's palette. Supplying `brand` starts an independent identity boundary and resets
inherited explicit overrides. Pass shared overrides again when intentionally
applying them to another brand.

Locale, messages, mode, and density otherwise retain their existing inheritance.
Portals copy the resolved brand, mode, density, direction, language, and overrides.
The system color-mode setting stays responsive to OS changes. Reduced-motion
preferences override brand transition durations, including inline overrides.

Built-in values continue to live only in `src/foundations/tokens.css`.
`src/foundations/sync-tokens.mjs` derives portable `tokenDeclarations.ts` data for
`brands.ts`. Vite and registry builds synchronize it automatically; use
`npm run tokens:sync` after editing repository tokens, or
`node src/bbb/foundations/sync-tokens.mjs` after editing copied tokens.
There is no runtime CSS loader, network fetch, or second authored palette.
Existing CSS selectors remain available to stylesheet consumers.

## Typography and logos

Reuse and customize the components, tokens, and brand preset code under the MIT
license. Give your product its own name and logo. The BeepBoopBit and BBB names and
the **bbb.** wordmark are covered separately by the
[trademark policy](https://github.com/BeepBoopBit/bbb-design/blob/main/TRADEMARKS.md);
accurate attribution and compatibility references are welcome, and technical
identifiers such as `--bbb-*` may stay as they are.

`--bbb-font-sans` is the interface/body face. `--bbb-font-heading` and
`--bbb-font-wordmark` default to it and can change independently. `--bbb-font-serif`
provides a local serif fallback family; custom fonts must be loaded by the consuming
application. Continue to verify metrics and wrapping with the actual font.

`BrandLogo` reads the current preset, or accepts `brand={preset}` to choose an
identity explicitly while retaining the surrounding theme's visual roles. Its
accessible image name comes from `logo.label`; use `decorative` inside a link that
already names the destination. A text wordmark preserves left-to-right spelling
and its accent suffix. Wordmarks scale together to fit a narrow container, keeping
the full identity visible. BBB uses `bbb.` with the larger Ember dot.

Image logos use `{ type: 'image', light: '/logo.svg', dark: '/logo-light.svg',
label: 'North' }`. `dark` is optional and falls back to `light`. Local asset paths
and HTTP(S) URLs are supported; ship those assets with the consuming app. Preset
exports reference assets rather than embedding them. Review logo sizing and clear
space in the intended layout.

## Gallery workflow

Open **Foundations → Brand workspace**. BBB, Studio, and Fieldnotes use the same
editor. Fieldnotes is defined solely as a consumer example, with a serif heading
and wordmark, rounded actions, and a teal primary family; the provider has no
Fieldnotes-specific implementation.

1. Choose a starter, edit the identity, and review both modes and densities.
2. In Tokens, choose a scope and token, enter its value, and apply it. Structural
   errors keep the previous valid value. Color contrast failures remain visible
   so you can inspect and correct the result.
3. Try the real form, switch navigation to the table, and open the menu and dialog.
4. Resolve configuration and contrast issues to enable Save preset and exports.
5. Save one preset on this browser, restore it later, or export JSON/CSS. Reset
   returns to the selected starter and does not delete the saved preset.

Edits are local to this workspace. Saving does not publish a brand or change the
Gallery shell. Import validates JSON before replacing the current draft. Malformed
or unsupported saved files are ignored; browser storage failures offer JSON export
as the recovery path.

## Validation and export APIs

- `brandTokenNames`: known public token names derived from the source stylesheet.
- `brandTokens(preset, mode)`: merged common/mode values, retaining aliases.
- `validateBrand(unknown)`: path/message issues for schema, identity, token names,
  complete color maps, invalid values, and unresolved/circular references. CSS
  syntax checks additionally use the browser's CSS parser when available.
- `checkBrandContrast(preset)`: browser-only results for 38 pairings across both
  modes. Covers normal text, action hover/press, selected content, status feedback,
  and focus/error edges. Alpha is composited over the canvas; a translucent canvas
  reports an unknown result because its product background is unspecified.
- `parseBrand(json)` and `serializeBrand(preset)`: validate and read/write versioned
  JSON. Invalid input throws an error with the relevant paths. These validate the
  configuration; call the separate contrast function to check color pairings.
- `brandToCSS(preset)`: validated CSS for both modes, scoped by the preset ID.
  References remain `var(...)` expressions. Import after BBB styles and apply
  `data-bbb-theme`, `data-bbb-brand`, `data-bbb-mode`, and the `bbb-theme` class to
  static boundaries. CSS alone does not carry logo metadata or load assets.

For React consumers, importing JSON through `parseBrand` and passing the object to
ThemeProvider is the preferred path. Preset values and explicit token overrides
are inline on custom theme boundaries; use the preset/token API to change them.

Keep `schemaVersion` with exported data. Unknown versions are rejected rather than
silently interpreted. Schema migrations should be explicit when a later format is
introduced. Source token changes follow the release guidance in [ADOPTION.md](ADOPTION.md).

Automated checks supplement review of real layouts, keyboard behavior, fonts,
forced colors, images, and assistive technology; they do not certify a whole brand.
