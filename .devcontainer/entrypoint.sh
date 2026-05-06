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
chown -R $USER:$USER /workspace/node_modules || true
chmod 775 /workspace/node_modules || true

echo "Installing global dev tools"
npm install -g @nestjs/cli prettier jest mocha eslint rimraf @anthropic-ai/claude-code

echo "Installing project dependencies via npm"
npm install
echo "Dependencies installed"

echo "Checking if we need to approve builds"
if [ -f /usr/local/bin/approve-builds.exp ]; then
  mv /usr/local/bin/approve-builds.exp /workspace
  chown $USER:$USER /workspace/approve-builds.exp || true
  if command -v expect >/dev/null 2>&1; then
    expect ./approve-builds.exp || true
  else
    echo "expect not installed; skipping approve script"
  fi
fi
echo "Build approval step complete"
