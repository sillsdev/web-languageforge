const path = require("path");
const webpackMerge = require("webpack-merge");
const commonConfig = require("./webpack.config.js");
const workboxPlugin = require('workbox-webpack-plugin');
const DESTINATION = path.resolve(__dirname, 'src', 'dist');
const LiveReloadPlugin = require('webpack-livereload-plugin');

/**
 * Webpack Plugins
 */

//UglifyJsPlugin has been depreciated using TerserPlugin
const TerserPlugin = require("terser-webpack-plugin");

module.exports = webpackMerge(commonConfig, {
  mode: "production",
  output: {
    path: DESTINATION,
    filename: "[name].bundle.js",
  },
  optimization: {
    chunkIds: "named",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          priority: 10,
          enforce: true,
        },
      },
    },
    runtimeChunk: {
      name: "manifest",
    },
  },
  plugins: [
    new TerserPlugin(),
    new workboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      importScripts: [
        '/service-worker/languageforge/service-worker.js'
      ],
      include: [] // To be changed once ready to start caching the whole app
    }),
    new LiveReloadPlugin()
  ],
});
