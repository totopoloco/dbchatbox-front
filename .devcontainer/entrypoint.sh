#!/bin/bash
set -e
# --- IGNORE HUSKY ---
export HUSKY=0

cd /workspace

# Prepare node_modules directory (avoid overly permissive 0777; 775 is enough)
if [ ! -d /workspace/node_modules ]; then
  echo "Creating node_modules directory"
  mkdir -p /workspace/node_modules
fi
chown -R node:node /workspace/node_modules || true
chmod 775 /workspace/node_modules || true

echo "Installing global dev tools"
npm install -g @nestjs/cli prettier jest mocha eslint rimraf @anthropic-ai/claude-code expo-cli

echo "Installing project dependencies via npm"
npm install
echo "Dependencies installed"


# Fix ownership of all workspace files for the node user
echo "Fixing workspace ownership"
chown -R node:node /workspace

# Fix chrome-sandbox SUID bit for React Native DevTools (Electron requires root-owned sandbox)
# This must run AFTER the chown above since npm install may have downloaded it during postCreate
echo "Fixing chrome-sandbox SUID permissions"
find /home/node/.cache/dotslash -name "chrome-sandbox" 2>/dev/null | while read -r sandbox; do
  chown root:root "$sandbox"
  chmod 4755 "$sandbox"
done

# Start a background daemon that watches for newly extracted chrome-sandbox binaries
# and immediately applies root:root + 4755. This covers VS Code debugger launches,
# npm run web, and any other Expo/Electron trigger.
echo "Starting chrome-sandbox watcher daemon"
mkdir -p /home/node/.cache/dotslash
(
  while true; do
    inotifywait -r -e create,moved_to /home/node/.cache/dotslash 2>/dev/null \
      | grep -q "chrome-sandbox" && \
      find /home/node/.cache/dotslash -name "chrome-sandbox" | while read -r f; do
        chown root:root "$f" 2>/dev/null && chmod 4755 "$f" 2>/dev/null
      done
  done
) &
echo "Sandbox watcher started (PID $!)."
