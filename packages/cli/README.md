# BBB UI installer

Copy BBB React/TypeScript components and their CSS into your app. Edit the files
freely. Your app imports its own source; this package is only the installer.

The npm package is `@beepboopbit/ui`, with the `bbb-ui`
command. Its default source registry is `https://ui.beepboopbit.com/r/`.
The installer is published on npm. Gallery's **View code** also offers source and
complete bundle downloads for manual copying.

## Add to your app

Follow [Get started](https://ui.beepboopbit.com/getting-started) for stylesheet,
ThemeProvider, and first-component examples. No BBB repository clone is needed.

Use Node.js 24 and npm. Run the CLI in your app's root.

`init` configures an existing app; it does not create one. If your destination is
empty, create a React/TypeScript Vite app first:

```sh
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

Already have a supported app? Start in its root and initialize BBB:

```sh
npx @beepboopbit/ui@latest init --dry-run
npx @beepboopbit/ui@latest init
npx @beepboopbit/ui@latest list
npx @beepboopbit/ui@latest add button text-field dialog
```

The app must already use React and React DOM 19.2.x, TypeScript 6.x, Vite, and
plain CSS. Existing compatible React 19.x declarations starting at 19.2 are
accepted. Other frameworks and package managers need separate support.

Run `npx @beepboopbit/ui@latest --help` for all options. `--cwd` selects an app. Explicit local
`--registry` paths are relative to the invoking directory; saved registry paths
in `bbb.json` are relative to that app. HTTP(S) base URLs and the environment
variable `BBB_UI_REGISTRY` are also supported. Registry selection uses, in order:
`--registry`, `BBB_UI_REGISTRY`, the app's saved `bbb.json`, then the public default.
`list` can run outside an app. Within an initialized app, it uses the recorded
source version unless you select another registry.

## Commands

- `init` copies foundations and ThemeProvider, detects the imported entrypoint
  stylesheet, and adds its CSS import. `--dir src/ui` changes the source directory;
  `--stylesheet src/app.css` selects another existing, imported stylesheet.
  `--baseline` opts into BBB's global page typography/background/reset. The default
  stylesheet keeps the host page's global styling. Init prints a ThemeProvider
  snippet for you to place around your app.
- `add <names...>` resolves complete source bundles, deduplicates shared files,
  and checks the whole batch before writing. Gallery item aliases are accepted.
- `list` shows available names. `--json` emits structured output. With a saved
  project configuration it uses that project's release; explicit `--registry`
  lists the selected registry's current release unless `--release` is supplied.

`init` and `add` install missing npm packages automatically. Registry packages are
tested at exact versions. Existing declarations must include those versions;
installed versions must remain within the tested compatible major range. Existing
compatible versions and version ranges are preserved. Missing declared packages
are restored with `npm install`; newly introduced packages are saved exactly.
React, TypeScript, and Vite are never upgraded automatically.

`--dry-run` validates the complete plan without writing files or running npm.
`--no-install` writes source and prints the package installation commands.
Commands use inferred defaults and explicit flags, with no interactive prompts.

## Owned files and releases

Commit `bbb.json` and the copied directory, including `.bbb-source.json` and
license notices. The source record pins the release and records original hashes.
Further additions fetch that exact version, even when registry discovery changes.
`--release <version>` can select an exact source version when initializing a new app.

Identical files are reused. A differing file blocks the entire requested batch;
there is no overwrite flag, automatic update, or merge. Review upstream changes
in a separate directory and apply the changes you want. Do not delete the source
record to bypass release checks.

All source, CSS, and configuration changes are checked before npm runs and checked
again before writing. Failed npm installation leaves these files untouched; npm
may have changed the app's package/lockfiles, so inspect those before retrying.
Registry checksums detect inconsistent files; they do not authenticate a registry.
Use a registry whose source you trust.

## Maintainer testing

To test the installer without publishing, run these commands from the BBB repository:

```sh
npm ci
npm run build:registry
npm run cli -- init --cwd ../my-app --registry ./registry-dist --dry-run
npm run pack:cli
npm exec --package=./.copy-consumer/beepboopbit-ui-0.1.3.tgz -- bbb-ui --help
```

The tarball filename follows this package's version. See
[registry maintenance](https://github.com/BeepBoopBit/bbb-design/blob/main/docs/REGISTRY.md)
for local source generation and verification.

## License and trademarks

The installer is available under the [MIT license](LICENSE). Copied source carries
its own license notices; retain them when redistributing it.

The BeepBoopBit and BBB names and the **bbb.** wordmark are covered separately by
the [trademark policy](https://github.com/BeepBoopBit/bbb-design/blob/main/TRADEMARKS.md).
Commercial code reuse and accurate attribution are welcome. Give independent
products and forks their own branding; technical identifiers such as `bbb.json`
and `--bbb-*` CSS variables may stay as they are.
