# Get started

BBB is source you copy and edit. There is no `bbb-design` component package to
install. You own the copied React/TypeScript and CSS files and can change their
styles, props, text, and behavior in your project.

The supported starting point is React and React DOM 19.2.x, TypeScript 6.x, Vite,
and plain CSS. The CLI uses Node.js 24 and npm. Other frameworks,
including Next.js, need separate compatibility checks before support is promised.
React Aria, Lucide, and date utilities remain third-party packages where required.

The [Gallery and source registry](https://ui.beepboopbit.com) are live. The npm CLI
is not published yet; the `npx` commands below describe installation once
`@beepboopbit/ui` is published. Run them inside your own app. You do not need to
clone the BBB repository or build the registry.

## Create an app

`init` adds BBB to an existing app. It does not create the app. If you are starting
from an empty destination, create a React/TypeScript Vite app:

```sh
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

Already have a supported app? Open a terminal in that app's root instead.

## Initialize BBB

From your app's root, preview setup and then apply it:

```sh
npx @beepboopbit/ui@latest init --dry-run
npx @beepboopbit/ui@latest init
```

`init` copies foundations and ThemeProvider, adds an import to the app's detected
CSS entrypoint, installs missing packages, and prints a provider snippet. Place
that provider in your app yourself. The default preserves global page styling;
use `--baseline` on first initialization to opt into the whole-app baseline.
Use `--dir src/ui` or `--stylesheet src/app.css` when the defaults do not fit.
Use `--cwd /path/to/my-app` to select an app from another directory.

## Add components

Choose components inside your app:

```sh
npx @beepboopbit/ui@latest list
npx @beepboopbit/ui@latest add button text-field dialog
```

`add` copies the complete closure for all requested items, checking the whole batch
before writing. Both commands support `--dry-run` and `--no-install`. Existing
compatible dependency versions and ranges are preserved; incompatible declarations
stop the command for review. npm failures leave source, CSS, and configuration
untouched, though npm may have changed package/lockfiles.

Commit `bbb.json` and the copied source record. The record pins additions to the
same release. Local registry paths in configuration are relative to the app;
explicit `--registry` paths are relative to the invoking directory. HTTP(S) base
URLs and `BBB_UI_REGISTRY` are supported. `--release` selects an exact version for
a new initialization. There is no automatic update or overwrite command.

The installer package is `@beepboopbit/ui`, with the `bbb-ui` executable. `npx`
runs it without adding the CLI to your app's dependencies. Its default registry
is `https://ui.beepboopbit.com/r/`. Registry selection uses `--registry`, then
`BBB_UI_REGISTRY`, then the app's saved `bbb.json`, then the public default.

## Use your first component

The CLI adds component essentials to your stylesheet. For manual copying, import
them once in your application’s entry point:

```tsx
import './bbb/foundations/styles.css'
```

This provides namespaced tokens, component box sizing, focus, icon sizing, and
visually hidden utilities. Your app keeps its own body margins, typography, and
background. Wrap the BBB area in ThemeProvider for its typography, identity,
locale, direction, and overlays. For a first example, replace your app's
`src/App.tsx` with:

```tsx
import { Button } from './bbb/components/Button/Button'
import { ThemeProvider } from './bbb/components/ThemeProvider/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider mode="system" locale="en-US">
      <Button onPress={() => console.log('Saved')}>Save changes</Button>
    </ThemeProvider>
  )
}
```

To adopt BBB’s whole-app baseline manually, also copy the `baseline` bundle and import
`./bbb/foundations/baseline.css` instead of `styles.css`. That explicitly applies
page typography, background, margins, global box sizing, and focus styling.

Add fields and overlays with the CLI or by copying `text-field.json` and `dialog.json`.
Install their listed packages if needed, then reference local files:

```tsx
import { TextField } from './bbb/components/TextField/TextField'
import { Dialog } from './bbb/components/Dialog/Dialog'
import { Button } from './bbb/components/Button/Button'

<Dialog title="New project" trigger={<Button>New project</Button>}>
  <TextField label="Project name" name="project" />
</Dialog>
```

Use date helpers directly from `@internationalized/date`, such as
`import { parseDate } from '@internationalized/date'`.

## Preview your app

From your app's root, start its development server:

```sh
npm run dev
```

Open the URL printed by Vite. You should see your BBB button. Edit the copied
component, its CSS, or a shared token in your app to try your own changes.

## Customize owned source

Edit the local component and CSS files. Fixed visual values should continue to
use shared `--bbb-*` tokens. Use provider overrides or `createBrand` for product
identities; see [customization](CUSTOMIZATION.md) and [brands](BRANDS.md).

Bundles that use brand presets include a sync script. After editing their copied
`foundations/tokens.css`, regenerate portable preset data:

```sh
node src/bbb/foundations/sync-tokens.mjs
```

CSS-only bundles use the stylesheet directly and need no regeneration.
Ordinary CSS edits update component styling directly. Regeneration also updates
values used by custom presets, validation, and exports. Keep both files in sync;
do not edit `tokenDeclarations.ts` by hand.

## Repeated copies and updates

The helper reuses identical files. It preserves differing files and reports the
conflict before copying any files from that plan. It records original hashes,
item names, and release in `src/bbb/.bbb-source.json` and rejects mixed releases.
It does not automatically merge, overwrite, or update your code.

For upgrades, generate the desired release into a separate directory, compare
against local files, review the changelog and migrations, and apply the changes
you want. Upstream fixes do not automatically change copied files. The consuming
app owns its dependency updates and regression checks.

Development artifacts are regenerated locally. A published source release must
freeze its version and contents; changes need a new version. Before 1.0, breaking
changes require a minor version bump and migration notes. After 1.0, they require
a major version bump. Compatible additions use minor versions; fixes use patches.

## Copy a downloaded bundle

Open a component in [Gallery](https://ui.beepboopbit.com/gallery), choose **View
code**, and download its JSON bundle. The bundle includes implementation files,
styles, supporting files, dependencies, license notices, and setup instructions.
You can copy these files manually before the npm CLI is available.

Copy every file's `content` into its relative target under `src/bbb/`, and install
the listed `dependencies` in your app. Copy the ThemeProvider bundle too, then
follow the stylesheet and provider setup above. Preserve `LICENSE` and
`LICENSE-LUCIDE`. Copying one component file may leave out shared controls,
theme/locale support, or CSS that it needs.

Keep the relative folders intact. Moving the whole `bbb/` directory is supported;
moving individual files requires updating their imports. Registry generation and
repository copy helpers are covered in the [maintainer guide](REGISTRY.md).

## Patterns

Pattern bundles include complete local compositions, sample state,
and required components. They are examples to adapt. Authentication, saving,
uploads, and data loading are demonstrations; your app supplies networking,
security, routing, and persistence. Demo code stays in example directories.

See [component APIs](../src/components/README.md), [content](CONTENT.md),
[registry maintenance](REGISTRY.md), and [verification](QUALITY.md).
