#!/usr/bin/env bash
# Run a command inside WSL with the project's Node (nvm) and pnpm (corepack)
# on PATH. Bridges Windows/MINGW shells to the WSL-native toolchain.
# Usage: wsl.exe bash scripts/wsl-run.sh <command> [args...]

# NOTE: nvm.sh is not `set -u` safe, so source it before enabling strict mode.
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use 22.17.0 >/dev/null

set -euo pipefail

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@10.30.2 --activate >/dev/null 2>&1 \
    || npm install -g pnpm@10.30.2 >/dev/null 2>&1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

exec "$@"
