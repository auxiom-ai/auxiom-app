const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
  
const config = getDefaultConfig(__dirname);
  
// Add any custom config here
config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
  crypto: require.resolve('react-native-crypto'),
  buffer: require.resolve('buffer/'),
  util: require.resolve('util/'),
  process: require.resolve('process/browser'),
  // Explicitly disable problematic modules
  net: false,
  tls: false,
  fs: false,
  http: false,
  https: false,
  zlib: false,
  path: false,
  child_process: false,
};

// Add additional configuration to handle problematic modules
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf', 'woff', 'woff2'];

// Add configuration to handle Node.js modules
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = withNativeWind(config, { input: './global.css' });