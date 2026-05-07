#!/bin/bash
# Wrapper for expo start --web that keeps chrome-sandbox SUID-fixed.
# Expo downloads/extracts React Native DevTools at startup, resetting permissions.
# A background loop re-applies root ownership + 4755 whenever the binary appears.

fix_sandbox() {
  while true; do
    find /home/node/.cache/dotslash -name "chrome-sandbox" 2>/dev/null | while read -r f; do
      if [ "$(stat -c '%U' "$f" 2>/dev/null)" != "root" ]; then
        sudo chown root:root "$f" 2>/dev/null && sudo chmod 4755 "$f" 2>/dev/null
      fi
    done
    sleep 1
  done
}

fix_sandbox &
FIX_PID=$!
trap "kill $FIX_PID 2>/dev/null; exit" INT TERM EXIT

expo start --web --port 3000
