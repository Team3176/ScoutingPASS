// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional configurations for expo-router
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  unstable_allowRequireContext: true
};

config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'mjs'],
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['require', 'import']
};

module.exports = config;
