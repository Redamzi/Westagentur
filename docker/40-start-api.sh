#!/bin/sh
# Started by the nginx image entrypoint before nginx. Runs the API in the
# background and restarts it if it exits.
set -e
mkdir -p "$DATA_DIR"
cd /app/server
(
  while true; do
    node --disable-warning=ExperimentalWarning index.js
    echo "[api] exited with code $?, restarting in 2s" >&2
    sleep 2
  done
) &
