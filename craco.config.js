const webpack = require('webpack');

module.exports = {
    babel: {
        plugins: [
            '@babel/plugin-syntax-import-assertions',
        ],
    },
    webpack: {
        configure: {
          resolve: {
            fallback: {
              process: require.resolve("process/browser"),
              stream: require.resolve("stream-browserify"),
            },
          },
          plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
          ],
        },
      },
};