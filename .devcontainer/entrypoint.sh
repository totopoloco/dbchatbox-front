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

echo "Checking if we need to approve builds"
if [ -f /usr/local/bin/approve-builds.exp ]; then
  mv /usr/local/bin/approve-builds.exp /workspace
  chown node:node /workspace/approve-builds.exp || true
  if command -v expect >/dev/null 2>&1; then
    expect ./approve-builds.exp || true
  else
    echo "expect not installed; skipping approve script"
  fi
fi
echo "Build approval step complete"

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
