'use strict';

var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
var workboxPlugin = require('workbox-webpack-plugin');

module.exports = function (env) {
  if (env == null) {
    env = { };
  }

  // Webpack Config
  var webpackConfig = {
    entry: {},

    output: {
      publicPath: '',
      path: path.resolve(__dirname, 'src', 'dist')
    },

    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // to not to load all locales
      new CopyWebpackPlugin([
        { from: './node_modules/font-awesome/', to: 'font-awesome' },
        { from: './node_modules/intl-tel-input/build/', to: 'intl-tel-input' },
        { from: './node_modules/jquery/dist/', to: 'jquery' },
        { from: './node_modules/offline-js/offline.min.js', to: 'offline-js' },
        { from: './node_modules/rangy/lib/', to: 'rangy' },
        { from: './node_modules/zxcvbn/dist/', to: 'zxcvbn' },
        { from: './node_modules/ng-table/bundles/ng-table.min.css', to: 'ng-table' },
        { from: './node_modules/ng-table/bundles/ng-table.min.css.map', to: 'ng-table' },
      ]),
      new webpack.ContextReplacementPlugin(

        // The ([\\/]) piece accounts for path separators in *nix and Windows
        /angular([\\/])core([\\/])@angular/,
        path.resolve(__dirname, './src'),

        // your Angular Async Route paths relative to this root directory
        {}
      ),
      new webpack.DefinePlugin({
        'process.env.XFORGE_BUGSNAG_API_KEY': JSON.stringify(process.env.XFORGE_BUGSNAG_API_KEY
          || 'missing-bugsnag-api-key'),
        'process.env.NOTIFY_RELEASE_STAGES': process.env.NOTIFY_RELEASE_STAGES || "['live', 'qa']"
      })
    ],

    module: {
      rules: [
        { test: /\.ts$/, use: 'awesome-typescript-loader' },
        { test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: 'url-loader?limit=10000'
        },
        { test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/, use: 'file-loader' },
        { test: /\.(png|jpg)$/, use: 'url-loader?limit=8192' },
        { test: /ng-table\/.*\.html$/, use: ['ngtemplate-loader?requireAngular&relativeTo=/src/browser/&prefix=ng-table/', 'html-loader'] }
      ]
    }

  };

  // Our Webpack Defaults
  var defaultConfig = {
    devtool: 'source-map',

    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[id].chunk.js'
    },

    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'node_modules')]
    },

    devServer: {
      historyApiFallback: true,
      watchOptions: { aggregateTimeout: 300, poll: 1000 },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      }
    },

    node: {
      global: true,
      crypto: 'empty',
      __dirname: true,
      __filename: true,
      process: true,
      Buffer: false,
      clearImmediate: false,
      setImmediate: false,
      fs: 'empty'
    }
  };

  // Prepare service worker config
  var serviceWorkerConfig = {
    clientsClaim: true,
    importScripts: [
      '/service-worker/languageforge/service-worker.js'
    ],
    include: [] // To be changed once ready to start caching the whole app
  };

  // Set up and return a customized Webpack config according to the environment we're in

  webpackConfig.entry.main = './src/angular-app/languageforge/main.ts';

  if (process.env.NODE_ENV == "production") {
    webpackConfig.plugins.push(new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }));
    webpackConfig.plugins.push(new UglifyJsPlugin({
      sourceMap: true
    }));
    webpackConfig.plugins.push(new LoaderOptionsPlugin({
      minimize: true
    }));
  } else {
    serviceWorkerConfig.importScripts = ['/service-worker/service-worker-debug.js']
      .concat(serviceWorkerConfig.importScripts);
    serviceWorkerConfig.skipWaiting = true;
  }

  var plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // this assumes your vendor imports exist in the following directories
        return module.context && (
          module.context.indexOf('node_modules') !== -1 ||
          module.context.indexOf('core/input-systems') !== -1
        );
      }
    }),

    // CommonChunksPlugin will now extract all the common modules from vendor and main bundles
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new LiveReloadPlugin()
  ];
  webpackConfig.plugins = webpackConfig.plugins.concat(plugins);

  // Add Service Worker to list of plugins
  webpackConfig.plugins = webpackConfig.plugins.concat(
    [new workboxPlugin.GenerateSW(serviceWorkerConfig)]
  );

  return webpackMerge(defaultConfig, webpackConfig);
};
