#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

for dir in "$ROOT_DIR"/cloudfunctions/*; do
  if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
    echo "Installing dependencies for $(basename "$dir")"
    (cd "$dir" && npm install --no-fund --no-audit)
  fi
done

echo "Cloud function dependencies installed."
