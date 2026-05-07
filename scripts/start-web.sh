#!/bin/bash
# chrome-sandbox-watchd (started by entrypoint) handles SUID permissions system-wide.
# ELECTRON_DISABLE_SANDBOX=1 is required in this container because the overlay
# filesystem does not honour the setuid bit at execution time.
export ELECTRON_DISABLE_SANDBOX=1
expo start --web --port 3000
