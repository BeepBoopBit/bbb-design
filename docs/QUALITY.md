# Browser and visual checks

Run lint, Gallery and registry builds, and the independent copied-source consumer before distributing a change. Browser tests
check behavior, accessibility, responsive layouts, and actual use of shared tokens.
Screenshots add a check on geometry and visual hierarchy; they do not replace
keyboard, touch, or assistive-technology review.

CI allows 60 seconds per behavior test for complete forms and full-catalog axe
scans on shared runners; individual assertion timeouts stay unchanged. The release
workflow runs only on tag pushes, prints failures inline, and stops a browser suite
after five failures. Run local checks before ordinary branch pushes and pull requests.
Its container makes the existing home directory belong to the runtime user so
Firefox can launch.

## Commands

```sh
npm run lint
npm run build
npm run build:registry
npm run test:registry
npm run test:cli
npm run test:copy
npm run test:cli:consumer
npm run pack:cli
npm test
npm run test:browsers
npm run test:visual
```

`npm test` runs the complete Chromium behavior suite. `test:browsers` adds the
completion suite in Firefox and WebKit: password reveal, localized code input,
toolbar navigation, commands, search recovery, table resizing/editing, RTL portals,
contrast, and narrow reflow. WebKit provides engine coverage; review the shipped
product in actual Safari and VoiceOver as well.

The product-utility suite also runs in all three engines: theme selection and
persistence, URL/history recovery, copy failures, account/workspace controls,
notifications, tree navigation, split-pane resizing, context menus, media recovery,
and narrow/enlarged layouts in both theme modes.

The field suite runs in all three engines too: compact search clearing and form
reset, dialog Escape, field variant selection, dropdown keyboard behavior,
validation edges, complete-form saving, long labels, RTL, and enlarged text in
both modes and identities.

The calendar/slider regression suite also runs in all three engines, including
enlarged calendar geometry, slider fill alignment, drag targets, and token overrides.

The brand suite runs in all three engines too: preset validation and round trips,
38 contrast pairs per identity, nested/system modes, independent override scopes,
portal logos, workspace persistence and imports, and enlarged-text reflow.

On a supported host, install browsers and their dependencies with
`npx playwright install --with-deps chromium firefox webkit`.

## Reproducible environment

The project includes a container runner for Podman or Docker. It uses the official
Playwright Ubuntu Noble image matching the installed Playwright version. It mounts
the project, including node_modules, and starts the test server inside the container.
Run `npm ci` first. Browser downloads are included in the image; the first run may
download the image. Traces and failure screenshots remain in the unique temporary
directory printed by the runner, so concurrent workspace checks do not delete them.
Reviewed screenshot baselines stay under `tests/screenshots/` in the project.
The runner chooses an available test-server port; set `BBB_TEST_PORT` to select
one explicitly. Native runs keep port 5180 unless overridden.

```sh
npm run test:container -- --project=chromium --project=firefox --project=webkit
npm run test:container -- --project=visual
```

Use this pinned environment for the committed Linux screenshot baselines. Fonts
and platform rendering can differ on a host machine. Playwright documents the
[container setup](https://playwright.dev/docs/docker) and why
[screenshots depend on the rendering environment](https://playwright.dev/docs/test-snapshots).

## Reviewing visual changes

The visual project fixes the clock, disables motion, waits for fonts, and captures
real Gallery examples. The matrix covers both brands, light/dark modes, both
densities, desktop/mobile, Arabic, enlarged text, calendars, commands, and table details.
Screenshot-only CSS hides the surrounding sticky Gallery header so it cannot
obscure component captures. Component styles are preserved.

After an intentional design change, generate candidates in the pinned environment:

```sh
npm run test:container -- --project=visual --update-snapshots
```

Inspect every changed image under `tests/screenshots/visual.spec.ts/`, then run the
visual project without `--update-snapshots`. Never update snapshots solely to hide
a failure. Changes to font packages, Playwright, or its image require another review.

Gallery tests derive category totals from the catalog rather than fixing the
number of examples. They still verify filtering, result counts, empty recovery,
and the behavior of individual components. Add behavior tests when adding a new
interaction, including dismissal/focus restoration and failure recovery.

Automated axe scans cover WCAG A/AA rules available to automation. They cannot
establish full accessibility conformance. Review high-contrast mode, meaningful
non-text contrast, real screen-reader output, pointer targets, and long content.

## Copied-source checks

`test:registry` verifies complete file/dependency closure, release metadata and
checksums, token synchronization, and repeatable copies that preserve edited files.
`test:cli` checks local/HTTP registry access, pinned releases, multi-item conflicts,
dry runs, compatibility checks, npm failure, and concurrent edits. `test:cli:consumer`
packs the installer, installs it outside the repository, and uses it to initialize
and populate the independent app described below. It verifies actual npm dependency
installation and confirms the app does not depend on the CLI package.
`test:copy` creates a temporary app with its own dependencies, imports all generated
entrypoints, typechecks and builds them, then exercises copied components in all
three browser engines. It checks keyboard controls, theme/RTL portals, sheet
resizing, 200% text at 320px/390px, host baseline isolation, and local source/token
edits. It retains failed consumers for diagnosis and writes review screenshots
to `.copy-consumer/review/`. See [REGISTRY.md](REGISTRY.md).

When native browser dependencies are unavailable on the host, run either consumer
command in the same pinned image used by the browser runner:

```sh
podman run --rm --init --network=host --ipc=host --security-opt label=disable \
  -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.63.0-noble \
  npm run test:cli:consumer
```

`source-copy.spec.ts` covers Gallery source-file selection, download contents,
loading failure/retry, keyboard focus, accessibility scans, and enlarged layouts.
`get-started.spec.ts` covers the setup guide, copy/download actions, section bookmarks,
route history, shared appearance/sidebar state, and mobile navigation. It checks
keyboard focus and 200% text at 320px/390px in both modes across all three engines.
Registry artifacts are generated locally and embedded in the Gallery build; these
commands do not publish or deploy them.
