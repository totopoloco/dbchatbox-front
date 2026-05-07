
#### Uses a specific version of the node image
# [Choice] Node.js version: 18, 16, 14
#ARG VARIANT="22"
#FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# Uses the latest version of the node image
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node

# [Optional] Install additional OS packages.
# Build tools & native dependencies (needed by some npm packages)
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends jq rsync net-tools lsof vim expect htop dos2unix iputils-ping pandoc curl inotify-tools \
    # Shared libraries for @react-native/debugger-shell (Chromium-based devtools) \
    libnspr4 libnss3 libdbus-1-3 \
    libatk1.0-0t64 libatk-bridge2.0-0t64 libgtk-3-0t64 \
    libdrm2 libgbm1 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libxss1 libxtst6 \
    libcups2t64 libasound2t64

COPY .devcontainer/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY .devcontainer/chrome-sandbox-watchd.sh /usr/local/sbin/chrome-sandbox-watchd
RUN dos2unix /usr/local/bin/entrypoint.sh
RUN chmod a+x /usr/local/bin/entrypoint.sh
RUN chmod 0755 /usr/local/sbin/chrome-sandbox-watchd

EXPOSE 3000
EXPOSE 3001
EXPOSE 4200
