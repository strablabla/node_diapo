#!/bin/sh
# --- start_diapo.sh ---
# Starts node_diapo from this folder (Linux, macOS). The Desktop launcher made
# by install.js sets NODE to the absolute path of node; by hand, the node of
# the PATH is used. On an error the terminal waits, so that it stays readable.
# Started with no terminal (the launchers), the output goes to
# logs/node_diapo.log, started afresh each time; the page shows it too (Ctrl+Shift+D).
cd "$(dirname "$0")" || exit 1
if [ ! -t 1 ]; then
    mkdir -p logs
    exec "${NODE:-node}" html_app.js > logs/node_diapo.log 2>&1
fi
"${NODE:-node}" html_app.js
status=$?
if [ $status -ne 0 ] && [ -t 0 ]; then
    printf '\nnode_diapo stopped with an error (code %s). Press Enter to close.' "$status"
    read -r _
fi
exit $status
