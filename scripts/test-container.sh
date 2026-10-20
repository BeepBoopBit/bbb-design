#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if command -v podman >/dev/null 2>&1; then
  bbb_runtime=podman
elif command -v docker >/dev/null 2>&1; then
  bbb_runtime=docker
else
  echo 'Install Podman or Docker to run the pinned browser environment.' >&2
  exit 1
fi
bbb_version=$(node -p 'require("./node_modules/@playwright/test/package.json").version')
bbb_image="mcr.microsoft.com/playwright:v${bbb_version}-noble"
bbb_artifacts=$(mktemp -d "${TMPDIR:-/tmp}/bbb-design-browser.XXXXXX")
printf 'Browser artifacts: %s\n' "$bbb_artifacts"
bbb_port=${BBB_TEST_PORT:-$(node -e 'const net = require("node:net"); const server = net.createServer(); server.listen(0, "127.0.0.1", () => { console.log(server.address().port); server.close(); });')}
bbb_options=()
if [ "$bbb_runtime" = podman ]; then bbb_options+=(--security-opt label=disable); fi
# Rootless Podman keeps files owned by the caller. Docker uses the caller's uid.
if [ "$bbb_runtime" = docker ]; then bbb_options+=(--user "$(id -u):$(id -g)"); fi
exec "$bbb_runtime" run --rm --init --network=host --ipc=host "${bbb_options[@]}" \
  -v "$PWD:/work" -v "$bbb_artifacts:/artifacts" -e "BBB_TEST_PORT=$bbb_port" -w /work "$bbb_image" \
  ./node_modules/.bin/playwright test --output=/artifacts "$@"
