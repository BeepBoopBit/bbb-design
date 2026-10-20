# Source registry

BBB distributes editable React/TypeScript and CSS files. Apps adopt them through
the copy CLI or Gallery downloads described in [ADOPTION.md](ADOPTION.md).
This document covers maintaining the registry in the BBB repository.
The installer is in `packages/cli` and is packed independently from the design source.

## Canonical source and generated output

Author components in `src/components/`, foundations in `src/foundations/`, and patterns
in `src/pages/Gallery/patterns/`.
`registry/config.mjs` declares directory conventions, Gallery aliases, and example
entrypoints. It contains no component implementations.

`npm run build:registry` writes `registry-dist/<version>/` plus a discovery manifest
at `registry-dist/manifest.json`. The version comes from package.json. Generated
output is ignored by Git. `npm run release:freeze` records the versioned artifacts
in `releases/source/<version>.json.gz`, with a readable checksum lock beside it.
These snapshots are generated, checked into Git, and never replaced. Source or
bundled documentation changes require a new root package version and snapshot.
Both the Vite plugin and registry builder reject changes to a frozen version and
include every historical snapshot. Only the root discovery manifest advances.
See [RELEASING.md](RELEASING.md) for release preparation and versioning.

Each item uses the shadcn registry-item shape: `registry:item` and `registry:file`
with explicit targets. It contains the complete transitive source closure rather
than relying on remote registry dependencies. A Dialog bundle contains its Button,
Icon, theme hooks, messages, CSS, and notices. Combining bundles deduplicates files
by relative destination and checksum.

`meta.bbb` includes `schemaVersion: 1`, release, target root, entrypoints,
compatibility, component dependencies, and SHA-256 content hashes. Runtime package
requirements come from actual imports and are pinned to the tested package-lock
versions. React and React DOM are
provided by the app; see [ADOPTION.md](ADOPTION.md) for supported versions.

The builder parses TypeScript imports and re-exports, follows CSS imports, rejects
missing or undeclared dependencies, and checks every Components and Patterns
catalog entry. Component bundles cannot reach Gallery. Composition
bundles may include an explicit allowlist of example helpers. Paths are rewritten
to the copied structure, and Markdown download imports in help examples become
portable data URLs. Pattern bundles include their shared example CSS.
Their state and backend operations remain demonstrations.

The CLI defaults to `https://ui.beepboopbit.com/r/`; explicit flags, environment,
and saved project configuration can override it. The site and registry are live;
npm publication of the CLI is still pending.

## Gallery integration

The Vite source-registry plugin serves `/r/manifest.json` and
`/r/<version>/<item>.json` during development. The production Gallery build emits
the same artifacts beneath `dist/r/`. Gallery loads source when its code disclosure
is opened, showing setup, dependencies, file selection/copying, and a downloadable
JSON bundle. Guidance-only foundations retain example source without a bundle.

## Copying and updates

After npm publication, use `npx @beepboopbit/ui@latest init`, `add`, or `list`
inside a consuming app, as described in [ADOPTION.md](ADOPTION.md). Maintainers can
use the unpublished installer against a generated local registry:

```sh
npm ci
npm run build:registry
npm run cli -- init --cwd ../my-app --registry ./registry-dist --dry-run
npm run cli -- init --cwd ../my-app --registry ./registry-dist
npm run cli -- add button text-field dialog --cwd ../my-app
```

The destination must already be a supported app. These repository commands are
for developing and verifying the installer.

The CLI reads either local artifacts or an HTTP(S) registry and binds downloaded
bundles to their versioned manifest hashes. It validates all requested bundles
together, deduplicates shared files, protects existing files and symlinks, and
supports dry runs. It installs missing packages after preflight and before source
writes, and preserves compatible existing dependency declarations. `bbb.json`
records registry, destination, stylesheet, and baseline choice. A
`.bbb-source.json` record stores the source release, item names, and original
hashes in the destination. Later additions load that release's versioned manifest,
not current discovery. Commit both records with copied source to retain provenance.
The `copy:source` wrapper still supports individual downloaded JSON bundles without
package installation. Both paths use the same engine from `packages/cli/src/source.mjs`.

Repeated identical copies reuse files. A differing file causes a conflict and no
planned files are copied. Another release requires migration review; the helper
does not combine releases or merge/replace local edits. For upgrades, generate
into a separate directory, compare against owned source, and apply desired changes.

## Foundation data

`tokens.css` is the only authored source of built-in visual values.
`tokenDeclarations.ts` is generated portable TypeScript used by presets,
validation, and server rendering. `npm run tokens:sync` updates it. Vite watches
token edits, and app/registry builds synchronize it. Registry tests reject stale
data. Do not hand-edit generated declarations.

The sync script travels with bundles that need preset data. After editing copied
tokens, run `node src/bbb/foundations/sync-tokens.mjs`. For product identities,
prefer `createBrand` and provider overrides, which need no regeneration.

## Existing installer trial

The local registry-file format was exercised with `shadcn@4.22.1` in a separate
Vite project using plain CSS. Button, TextField, Select, and Dialog installation
preserved every source file byte for byte and did not add Tailwind. The command still
requires `components.json`; a fresh project without that file enters its setup
prompt. A minimal existing configuration with the CSS path and aliases was enough
for the file-copy trial. BBB's own CLI now supplies its source setup path without
requiring shadcn configuration. This trial does not establish Next.js support.

## Verification

```sh
npm run tokens:sync
npm run test:registry
npm run test:cli
npm run test:release
npm run test:copy
npm run test:cli:consumer
npm run pack:cli
npm run lint
npm run build
npm test
npm run test:browsers
npm run test:container -- --project=visual
```

Registry tests verify closure, manifests, checksums, token edits, and copy behavior.
CLI tests cover local and HTTP registries, release pinning, batch conflicts,
dependency compatibility, installation failure, and concurrent edits. The packed
consumer installs the tarball outside the repository, runs init and add, verifies
real npm dependency installation, then exercises the same independent app below.
`test:copy` creates a separate temporary app with its own dependencies, copies
generated artifacts, typechecks every entrypoint, and builds with plain Vite.
Chromium, Firefox, and WebKit exercise its form, dropdown, tabs, modal and sheet,
RTL/theme portals, and 200% text at 320px/390px. It checks host baseline isolation
and proves that editing copied source and regenerating copied tokens changes the
app. Successful temporary consumers are removed; failures retain their files.
Screenshots go to `.copy-consumer/review/`, which survives later Playwright runs.
See [QUALITY.md](QUALITY.md) for
browser installation and pinned visual review.
