const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
      watch: false,
    },
    port: 9000,
    hot: true,
    liveReload: false,
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: false,
        interval: 1000,
        ignored: /node_modules/,
      },
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      reconnect: 3,
    },
    compress: true,
    historyApiFallback: true,
  },
});
