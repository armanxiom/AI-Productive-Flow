const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Prevent Metro from watching openid-client's temp cache directory,
// which can cause Metro to crash or hang.
config.resolver.blockList = [/\.cache\/openid-client\/.*/];

module.exports = config;
