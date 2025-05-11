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
};

module.exports = withNativeWind(config, { input: './global.css' });