# Releases and deployment

The public home is **https://ui.beepboopbit.com**. Gallery, the getting-started
guide, and source JSON share one static site. The CLI's default registry is
**https://ui.beepboopbit.com/r/**. The site, registry, and npm CLI are live.
The release workflow publishes new CLI versions through npm trusted publishing
after deployment verification.

The current repository versions are:

| Artifact | Identity | Version |
| --- | --- | --- |
| Editable source | Root `bbb-design` package version | `0.3.0` |
| Installer | npm `@beepboopbit/ui`, command `bbb-ui` | `0.1.3` |

Source 0.2.0 remains frozen and available on the live registry. Repository changes
reach the site only after a release tag is pushed and its workflow succeeds.

The root package stays private. Only the installer goes to npm. Apps keep their
copied source, ordinary runtime dependencies, `bbb.json`, and `.bbb-source.json`.
The CLI is not a component dependency.

## Freeze source

Review components, patterns, token data, dependency versions, licenses, and
bundled documentation before freezing:

```sh
npm ci
npm run tokens:sync
npm run release:freeze
```

Commit both generated files in `releases/source/`: the compressed JSON snapshot
and its readable `.json` checksum lock. The lock records hashes for the archive
and each canonical JSON artifact. Repeating the freeze command verifies existing
contents; it cannot replace them. Do not hand-edit or delete an existing snapshot
to accommodate changes.

`npm run build` and `npm run build:registry` include all frozen source versions.
An app pinned to an older version can therefore continue adding components after
a newer release. Versioned files are immutable; `/r/manifest.json` discovers the
current version. Standalone registry output and website output use identical bytes.

When source, dependency versions, or bundled documentation changes, advance the
root package version (for example, `npm version patch --no-git-tag-version`), review
the change, then freeze the new version. Some patterns embed documentation as
portable downloads, so documentation edits can change source bundles. Website-only
changes that do not affect bundles need no source version change. Advance the CLI
package version separately when installer behavior or its shipped documentation
changes; use `npm version patch --workspace @beepboopbit/ui --no-git-tag-version`.
Keep `package-lock.json` synchronized.

## Prepare files locally

```sh
npm run release:prepare
```

This runs lint, registry/CLI/release tests, the TypeScript and website build, and
the standalone registry build. It requires a frozen current source version,
compares both built registries with all verified snapshots, and inspects the actual
npm pack file list and executable mode. It writes ignored review files:

- `.release/site/`: the complete static site, including all `/r/` versions.
- `.release/beepboopbit-ui-0.1.3.tgz`: the installer tarball (version follows its package).
- `.release/source/`: frozen snapshots and checksum locks for archival.
- `.release/wrangler.jsonc`: the checked Cloudflare deployment configuration.
- `.release/release.json`: identities, npm integrity, and SHA-256 hashes of all
  staged files except the manifest itself.

Release preparation replaces `.release/` and never publishes. Run the browser
checks as well before treating these files as a checked release candidate:

```sh
npm run test:container -- --project=chromium --project=firefox --project=webkit --project=visual
```

Then run `npm run test:release:consumer` in an environment with all three Playwright
browsers and their native dependencies. This verifies the staged tarball's hash,
installs that exact CLI outside the repository, and builds and exercises every
copied bundle. On a machine that uses
the pinned container for those dependencies:

```sh
podman run --rm --init --ipc=host --security-opt label=disable \
  -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.63.0-noble \
  npm run test:release:consumer
```

Docker can run the same image; omit the Podman-specific security option and set
the user as described in [QUALITY.md](QUALITY.md). Browser screenshot comparisons
must use the pinned image. Review differences before changing baselines.

## Cloudflare setup

The `beepboopbit.com` zone must be active in the deployment account. Create a
Cloudflare API token with these permissions:

| Category | Permission | Access |
| --- | --- | --- |
| Account | Workers Scripts | Edit |
| Account | Account Settings | Read |
| Zone | Workers Routes | Edit |
| Zone | Zone | Read |

Limit Account Resources to the account containing `beepboopbit.com` and Zone
Resources to that specific zone. Workers Scripts access applies across the
selected account. Leave Client IP Address Filtering unset for GitHub-hosted
runners; replace the token before any configured expiration.

In the repository's **Settings → Secrets and variables → Actions**, add:

| Repository secret | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare Account ID containing the zone |
| `CLOUDFLARE_API_TOKEN` | The generated API token value |

No repository variables are required. Secret names can be checked, but their
presence does not verify authentication or token permissions. See
[Cloudflare authentication](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
and [GitHub secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

`wrangler.jsonc` configures the `bbb-ui` Worker to serve `.release/site/` at the
Custom Domain `ui.beepboopbit.com`, with `workers.dev` and preview URLs disabled.
Cloudflare creates the DNS record and HTTPS certificate. Review any conflicting
record for `ui` before the first deployment.

The build creates HTML entrypoints for `/`, `/gallery`, and `/getting-started`.
Missing registry files, assets, and unknown pages return HTTP 404.
`public/_headers` gives fingerprinted assets and versioned `/r/<version>/` files
year-long immutable caching; `/r/manifest.json` and HTML revalidate. Every candidate
includes the complete historical registry and a hashed deployment configuration.

## Deployment checks and automation

`.github/workflows/release-checks.yml` runs only when a Git tag is pushed, using
`push.tags: ['**']`. Branch pushes, pull requests, and manual dispatch do not run
it. Tag deletion does not run its jobs. It uses Node 24, a locked npm install, and Playwright's
`v1.63.0-noble` image. It runs release preparation, the cross-browser completion
suite, reviewed visual comparisons, the independent packed-CLI consumer, and the
local Cloudflare checks below.
Changing the locked Playwright version requires updating the workflow image too.

After all checks pass, the workflow uploads `bbb-release-candidate` with `.release/`
contents. Browser diagnostics are uploaded separately. The tag's run then deploys
that exact artifact to Cloudflare and verifies the public
site. The deployment job verifies the candidate's hashes and uploads it with the
pinned Wrangler dependency without rebuilding. Credentials are supplied only to
the deployment step. Once trusted publishing is configured and enabled as
described below, deployment verification allows the publish job to run. That job
downloads the same candidate, verifies its hashes and CLI integrity, and publishes
its tarball to npm without rebuilding. It then runs the exact published CLI's
`list` command outside the repository against the live default source registry.
Release runs share one concurrency group so another tag cannot cancel an active
release, deploy alongside it, or publish concurrently.

Run local checks before pushing ordinary commits. When a reviewed commit is ready
to deploy, push it to `main`, then create and push a version tag pointing to it:

```sh
git push origin main
git tag -a v0.3.0 -m "Release source 0.3.0 and CLI 0.1.3"
git push origin v0.3.0
```

Creating a local tag does not deploy. Pushing the tag starts all release checks
and deploys after they pass. Every tag name matches the workflow, including names
containing `/`; use `v<source-version>` as the release convention. Push a single
reviewed tag deliberately rather than using `git push --tags`. The workflow uses
the tagged commit, which must contain this tag-triggered configuration. See
[GitHub's tag filters](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchestagsbranches-ignoretags-ignore).

Before a first deployment, check the Cloudflare configuration and built site:

```sh
npm run deploy -- --dry-run
npm run test:hosting
```

The hosting suite uses the local Cloudflare runtime with the built candidate,
checks every public file and its caching, and verifies actual guide/source
interactions. It can use the pinned container with
`npm run test:container -- --config playwright.hosting.config.ts --project=hosting`.
The dry run and tests do not upload publicly.

After deployment, `npm run verify:deployment` compares every public file with the
candidate and checks caching and HTTP 404 behavior over HTTPS. It retries briefly
for DNS, certificates, and deployment propagation. A failure fails the workflow;
rollback is deliberate.

For a deliberate local upload, provide the two Cloudflare environment variables
and run `npm run deploy`, then `npm run verify:deployment`. The deploy command
uploads publicly unless `-- --dry-run` is supplied.

## npm publication

Once trusted publishing is configured and the `NPM_TRUSTED_PUBLISHING` repository
variable is `true`, pushing a release tag runs **checks → Cloudflare deployment
and verification → npm publication** in `.github/workflows/release-checks.yml`.
Until then, publication is skipped while checks and website deployment still run.
A failed check or deployment prevents publication. Only `@beepboopbit/ui` is
published; the root package stays private. The CLI version comes from
`packages/cli/package.json`, independently of the source version used for the Git tag.

The publish job uses Node 24 and pinned npm 11.19.0, with `id-token: write` limited
to that job. npm trusted publishing authenticates through GitHub OIDC. The job
does not read an npm token secret. First publication is interactive because
[npm requires the package to exist before configuring a trusted publisher](https://docs.npmjs.com/cli/v11/commands/npm-trust/).

### First publication with interactive 2FA

1. Sign in to npm and confirm publishing access to the `@beepboopbit` scope.
   Create the npm organization if needed and enable account 2FA.
2. Review the publication notices in the README, onboarding guide, and CLI README.
   Remove them for launch, bump source and CLI versions where their shipped
   documentation changes, freeze source, and run release preparation and checks.
   Preserve existing frozen releases.
3. Leave `NPM_TRUSTED_PUBLISHING` unset. Commit the reviewed release and push its
   version tag as described above. Wait for its checks and deployment verification
   to pass; the npm job will be skipped. Download that run's
   `bbb-release-candidate` artifact from GitHub Actions.
4. Check out that exact tag locally and run `npm ci`. Extract the artifact's
   contents into `.release/`, with `release.json` directly inside that directory.
   Publish from an interactive terminal:

   ```sh
   npm login --registry=https://registry.npmjs.org/
   node scripts/publish-cli.mjs
   ```

   Complete npm's browser and 2FA prompts. The script verifies the candidate's
   hashes and publishes its exact checked tarball, then verifies npm integrity.
   Keep 2FA enabled. No npm publishing token is needed in GitHub.
5. In a separate supported app, exercise the public install:

   ```sh
   npx @beepboopbit/ui@latest init
   npx @beepboopbit/ui@latest add button text-field dialog
   ```

### Subsequent releases with trusted publishing

Once `@beepboopbit/ui` exists, open its npm **Settings → Trusted publishing** and
add a GitHub Actions publisher with these case-sensitive values:

| Field | Value |
| --- | --- |
| Organization or user | `BeepBoopBit` |
| Repository | `bbb-design` |
| Workflow filename | `release-checks.yml` |
| Environment name | Leave empty; the publish job uses no GitHub environment |
| Allowed actions | Enable direct `npm publish` |

Use only the filename, not `.github/workflows/release-checks.yml`. If the repository
is moved, update its package repository metadata and the npm publisher settings.
In GitHub's repository **Settings → Secrets and variables → Actions → Variables**,
add the repository variable `NPM_TRUSTED_PUBLISHING` with the value `true`.
This enables the publish job for subsequent release tags. If an `NPM_TOKEN` secret
or publishing token was created for the previous setup, remove the secret and
revoke the token; this workflow does not use it. npm's package publishing-access
setting can be set to **Require two-factor authentication and disallow tokens**;
trusted publishing continues to work with that setting.

New trusted-publisher configurations must complete a successful
publish within two days; use a new CLI version to validate the configuration.
An already-published version is skipped and will not validate a new publisher.
See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Later source-only releases and workflow reruns skip npm publication when that CLI
version already has the exact checked integrity. A version with different contents
fails with instructions to bump the CLI version; lookup failures are not treated
as missing packages. Stable CLI versions publish under `latest`; prereleases use
`next`. Existing versions and dist-tags are never changed by the skip path.

npm can accept an upload and report that the package is still being processed.
The script waits roughly five minutes for the version to appear in npm's installer
metadata and checks integrity before reporting verified publication. A version's
individual endpoint can appear before installers can resolve it. The smoke check
also revalidates npm's cached metadata with `--prefer-online`.
If that wait expires, the accepted upload
may still be processing. Check its status on npm and continue verification with:

```sh
node scripts/publish-cli.mjs --verify-only
```

This checks the same candidate and waits for its public npm version without
submitting another publication. Do not rerun the publish command while an
accepted upload is still processing.

For a local preview of the publication step after `release:prepare`, run:

```sh
node scripts/publish-cli.mjs --dry-run
```

This verifies the staged files, checks npm for the version, and runs `npm publish
--dry-run` only if it is absent. It does not test trusted-publisher authorization;
that is checked by a real publication from the configured GitHub workflow.

For rollback, restore a known checked Cloudflare deployment or redeploy its
archived candidate with the complete historical registry. Discovery can point at
a prior version. Never overwrite or remove versioned artifacts that existing apps
use. Keep candidate hashes and snapshots with release records.
