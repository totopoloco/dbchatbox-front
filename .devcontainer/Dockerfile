
#### Uses a specific version of the node image
# [Choice] Node.js version: 18, 16, 14
#ARG VARIANT="22"
#FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# Uses the latest version of the node image
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node

# [Optional] Install pnpm
RUN npm install -g pnpm

# [Optional] Install additional OS packages.
# Build tools & native dependencies (needed by some npm packages)
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends jq rsync net-tools lsof vim expect htop dos2unix iputils-ping pandoc curl libnspr4

COPY .devcontainer/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY .devcontainer/approve-builds.exp /usr/local/bin/approve-builds.exp
RUN dos2unix /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/approve-builds.exp
RUN chmod a+x /usr/local/bin/entrypoint.sh
RUN chmod 0755 /usr/local/bin/approve-builds.exp

EXPOSE 3000
EXPOSE 3001
EXPOSE 4200
