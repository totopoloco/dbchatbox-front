#!/bin/bash
# System daemon: scans all locations where dotslash may extract chrome-sandbox
# and ensures it always has root:root + 4755 (SUID). Runs as root.
# Dotslash uses /tmp/dotslash-<uid>/ or ~/.cache/dotslash/ depending on environment.
while true; do
  find /tmp /home /root -maxdepth 8 -name "chrome-sandbox" 2>/dev/null \
  | while read -r f; do
      if [ "$(stat -c '%U:%a' "$f" 2>/dev/null)" != "root:4755" ]; then
        chown root:root "$f" 2>/dev/null && chmod 4755 "$f" 2>/dev/null
      fi
    done
  sleep 1
done
