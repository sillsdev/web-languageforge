'use strict';

var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');

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
      { from: './node_modules/zxcvbn/dist/', to: 'zxcvbn' }
    ]),
    new webpack.ContextReplacementPlugin(

      // The ([\\/]) piece accounts for path separators in *nix and Windows
      /angular([\\/])core([\\/])@angular/,
      path.resolve(__dirname, './src'),

      // your Angular Async Route paths relative to this root directory
      {}
    ),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // this assumes your vendor imports exist in the node_modules or js/assets directories
        return module.context && (
          module.context.indexOf('node_modules') !== -1 ||
          module.context.indexOf('js/assets') !== -1 ||
          module.context.indexOf('js/vendor') !== -1 ||
          module.context.indexOf('core/input-systems') !== -1
        );
      }
    }),

    // CommonChunksPlugin will now extract all the common modules from vendor and main bundles
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new LiveReloadPlugin()
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
      {
        // fix critical dependency warning by removing reference to require() in Bridge
        test: /bridge\.js/,
        use: {
          loader: 'string-replace-loader',
          query: {
            search: ' || require(name)',
            replace: ''
          }
        }
      },
      {
        // fix conflict between System namespace in Bridge and System variable injection
        test: /(newtonsoft\.json|machine|bridge)\.js/,
        parser: { system: false }
      }
    ]
  }

};

// Our Webpack Defaults
var defaultConfig = {
  devtool: 'source-map',

  output: {
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
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

module.exports = function (env) {
  var mainPath =  './src/angular-app/languageforge/main.ts';
  if (env && env.applicationName) {
    mainPath = './src/angular-app/' + env.applicationName + '/main.ts';
  }

  webpackConfig.entry.main = mainPath;
  return webpackMerge(defaultConfig, webpackConfig);
};
