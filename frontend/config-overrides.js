// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    os: require.resolve('os-browserify/browser'),
    path: require.resolve('path-browserify'),
    fs: false,
    https: require.resolve('https-browserify'),
    http: require.resolve('stream-http'),
    zlib: require.resolve('browserify-zlib'),
    assert: require.resolve('assert/'),
    util: require.resolve('util/'),
    url: require.resolve('url/'),
    vm: require.resolve('vm-browserify'),
    buffer: require.resolve('buffer/'),
  };

  // Add plugins to provide process and buffer globals
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Ignore source-map warnings from third-party libraries
  config.ignoreWarnings = [/Failed to parse source map/];

  return config;
}