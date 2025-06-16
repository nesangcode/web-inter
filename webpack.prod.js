const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { GenerateSW } = require('workbox-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      '...', // This extends default minimizers (like terser-webpack-plugin)
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 70000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled', // Set to 'server' to analyze bundle
      generateStatsFile: true,
    }),
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'dicoding-stories-api',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'dicoding-stories-images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets',
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
      ],
      navigateFallback: '/404.html',
      navigateFallbackAllowlist: [/^(?!\/api).*/], // Allow all except API routes
      navigateFallbackDenylist: [/\.[^/]+$/], // Deny requests for files with extensions
      // Import custom service worker code for push notifications
      importScripts: ['./sw-custom.js']
    })
  ],
});
