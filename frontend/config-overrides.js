const webpack = require('webpack');

module.exports = function override(config) {
    config.resolve.fallback = {
        vm: require.resolve('vm-browserify'),
        crypto: require.resolve('vm-browserify')
    };
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);
    return config;
};
