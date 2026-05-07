// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// node_modules is on a separate filesystem (bind mount in devcontainer).
// `fs.readdir` on the parent dir does not list it, so metro's file crawler
// never recurses into it. Adding it as an explicit watchFolder forces metro
// to crawl it directly.
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.join(__dirname, 'node_modules'),
];

module.exports = config;
