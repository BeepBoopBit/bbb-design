# Get started

Add BBB to your React app, wrap it in ThemeProvider, and use your first component.
You own the copied TypeScript and CSS files and can edit them in your project.

The [Gallery](https://ui.beepboopbit.com/gallery),
[source registry](https://ui.beepboopbit.com/r/manifest.json), and
[npm installer](https://www.npmjs.com/package/@beepboopbit/ui) are live.
Run the installer with `npx` inside your app, or [copy a downloaded bundle](#copy-a-downloaded-bundle).

Before you begin, install Node.js 24 and npm. Your app must use React and
React DOM 19.2.x, TypeScript 6.x, Vite, and plain CSS. Next.js and other frameworks
need separate compatibility checks. The installer adds required packages such as
React Aria, Lucide, and date utilities automatically.

## How the deployed site fits in

- **Browse:** use [Gallery](https://ui.beepboopbit.com/gallery) to try a component.
  Open **View code** for its actual files, dependencies, and source bundle download.
- **Install:** the CLI reads `https://ui.beepboopbit.com/r/` and copies the selected
  release into your app's `src/bbb/` directory. You do not need to build or host a registry.
- **Use:** import those local files in your React app. Your production build
  includes them; it does not fetch component code from the BBB site at runtime.

The published npm package supplies the installer. There is no
`bbb-design` component package to install, and the deployed Gallery is not your
application's backend.

## Create an app

`init` adds BBB to an existing app. It does not create the app. If you are starting
from an empty destination, create a React/TypeScript Vite app:

```sh
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

Already have a supported app? Open a terminal in that app's root instead.

## Install the CLI

Keep your terminal in your app's root. `npx @beepboopbit/ui@latest` downloads and
runs the installer without adding it as an app dependency. No global installation
or BBB repository clone is needed. Use `--cwd /path/to/my-app` if you want to run
the installer from another directory.

## Initialize BBB

From your app's root, preview setup against the deployed registry, then apply it:

```sh
npx @beepboopbit/ui@latest init --dry-run
npx @beepboopbit/ui@latest init
```

The dry run prints the files and packages it would add without changing your app.
After the second command, check your app for:

- `src/bbb/`: foundations, ThemeProvider, supporting source, and license notices.
- `bbb.json`: the saved registry URL, source directory, stylesheet, and baseline choice.
- `src/bbb/.bbb-source.json`: the selected source release and copied-file record.
- An import at the top of your existing stylesheet, normally `src/index.css`:

```css
@import "./bbb/foundations/styles.css";
```

The CLI installs missing runtime packages and prints a ThemeProvider example.
It does not wrap your app for you; do that in the first-component step below.
Keep the app's existing `import './index.css'` in `src/main.tsx`.

The default preserves your global page styling. Use `--baseline` on first
initialization to opt into BBB's whole-app baseline. Use `--dir src/ui` to change
the copied directory or `--stylesheet src/app.css` to select another existing,
imported stylesheet; adjust the later import paths to match.

## Add components

Still in your app's root, list components and add your first ones:

```sh
npx @beepboopbit/ui@latest list
npx @beepboopbit/ui@latest add button text-field dialog
```

These commands reuse the deployed registry saved by `init`. `add` copies all
required source and CSS, including shared components, and installs missing
packages. Add `--dry-run` to preview an addition, or `--no-install` to copy files
and print the npm commands to run yourself in your app.

In Gallery, a component's **Setup and dependencies** section also shows its CLI
name. Use that name when adding more components.

Commit `bbb.json`, `src/bbb/` including `.bbb-source.json` and license notices,
and your app's package and lockfile changes. Later additions use that recorded
source release even when the deployed site publishes a newer one.

## Use your first component

Open `my-app/src/App.tsx` in your editor and replace its contents with:

```tsx
import { useState } from 'react'
import { Button } from './bbb/components/Button/Button'
import { ThemeProvider } from './bbb/components/ThemeProvider/ThemeProvider'

export default function App() {
  const [message, setMessage] = useState('Ready to save.')

  return (
    <ThemeProvider mode="system" locale="en-US">
      <Button onPress={() => setMessage('Changes saved.')}>Save changes</Button>
      <p role="status">{message}</p>
    </ThemeProvider>
  )
}
```

The stylesheet import from `init` supplies tokens, focus, and shared utilities.
ThemeProvider supplies typography, appearance, locale, direction, and overlay
support. Wrap your app or the area using BBB once, keeping fields and dialogs
inside that provider. The example follows the system's light/dark preference;
set `mode="light"` or `mode="dark"` to choose explicitly.

You also installed TextField and Dialog. Import them from the copied files, then
place the dialog inside the same ThemeProvider:

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

Open the URL printed by Vite. You should see **Save changes** and **Ready to save.**
Press the button; the message should become **Changes saved.** Edit a copied
component or its CSS to see the change in your own app.

Vite's starter styles may still center the page or set a demo background. Remove
unwanted demo rules from your app's CSS while keeping the BBB stylesheet import.

To check the production build, stop the dev server and run from your app's root:

```sh
npm run build
npm run preview
```

Open the preview URL and check the button again. Deploy your app's `dist/`
directory to your usual static host. The BBB components are part of that build;
the BBB repository and registry are only needed when installing or adding source.

## If setup fails

- **npm reports 404 for `@beepboopbit/ui`:** check the package name and your npm
  registry settings. The public package is on `https://registry.npmjs.org/`.
- **No package.json or unsupported project:** create the app first and point
  `--cwd` at its root. Check its React, React DOM, and TypeScript declarations
  against the prerequisites; the installer does not upgrade them for you.
- **Stylesheet not found:** keep a CSS file imported by `src/main.tsx` and select
  it explicitly with `--stylesheet src/index.css` on `init`.
- **The button has no BBB styling:** check that your app imports its entry
  stylesheet, that the BBB import is at the top, and that the button is inside
  ThemeProvider. A copied `.tsx` file alone is not the complete component.
- **Registry unavailable:** check that the [public manifest](https://ui.beepboopbit.com/r/manifest.json)
  loads. The registry base is `https://ui.beepboopbit.com/r/`; pass the base URL,
  rather than a Gallery page or an individual JSON file, to `--registry`.
- **Existing-file or dependency conflict:** review the reported files or package
  versions. The installer preserves edits and stops before writing a conflicting
  batch. If npm fails, inspect package and lockfile changes before retrying.

## Use the repository installer

Maintainers can run the installer from a local checkout against the deployed
registry. With Git installed and your app at `../my-app` relative to the checkout:

```sh
git clone https://github.com/BeepBoopBit/bbb-design.git bbb-design
cd bbb-design
npm ci
npm run cli -- init --cwd ../my-app --registry https://ui.beepboopbit.com/r/ --dry-run
npm run cli -- init --cwd ../my-app --registry https://ui.beepboopbit.com/r/
npm run cli -- add button text-field dialog --cwd ../my-app
```

Replace `../my-app` with your app's actual path. Then follow the same ThemeProvider
and first-component steps above. The local and published installers use the same
source registry and copied-file format.
See the [CLI reference](../packages/cli/README.md) for all options.

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

You can also install source from the deployed Gallery without cloning the repository:

1. Open [Button](https://ui.beepboopbit.com/gallery?item=button), choose **View code**,
   then **Download source bundle**. This downloads JSON containing the actual
   files, supporting source, CSS, dependencies, and notices.
2. Download [ThemeProvider](https://ui.beepboopbit.com/gallery?item=themes) the same
   way. Keep bundles on the same `meta.bbb.release` version.
3. For each entry in the bundle's `files` array, write its `content` to its
   `target` relative to your app's root, removing the leading `~/`. For example,
   `~/src/bbb/components/Button/Button.tsx` becomes
   `my-app/src/bbb/components/Button/Button.tsx`. Reuse identical shared files.
4. In your app's root, run the `npm install ...` command under **Setup and
   dependencies** for each bundle. It uses the exact versions in `dependencies`.
5. Import `./bbb/foundations/styles.css` once in `src/main.tsx`, then follow
   [Use your first component](#use-your-first-component) and preview your app.

Keep every file, including `LICENSE` and `LICENSE-LUCIDE`. Copying only the
selected `.tsx` file or the Gallery preview can omit required source and styles.
Manual copying does not create the CLI's project configuration or release record;
continue managing these files manually.

For the whole-app baseline, also copy the `baseline` bundle and import
`./bbb/foundations/baseline.css` instead of `styles.css`.

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
