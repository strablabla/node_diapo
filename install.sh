#!/bin/sh
# --- install.sh ---
# Linux and macOS: installs node_diapo and puts a launcher on the Desktop.
# The work is done by install.js (the same on every OS); this only finds Node.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not installed (or not in the PATH): get it from https://nodejs.org (20.19 or later)."
    exit 1
fi
exec node install.js "$@"
