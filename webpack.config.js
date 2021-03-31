const path = require('path');
const ROOT = path.resolve(__dirname, './src/angular-app/languageforge');

/**
 * Webpack Plugins
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
//const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require('webpack')

module.exports = {
    context: ROOT,

    resolve: {
        extensions: ['.ts', '.js']
    },

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
    },

    plugins: [
        // new HtmlWebpackPlugin({
        //     title: 'AngularJS - Webpack',
        //     template: 'index.html',
        //     inject: true
        // }),
        new LoaderOptionsPlugin({
            debug: true,
            options: {
                tslint: {
                    configuration: require('./tslint.json'),
                    typeCheck: true
                }
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new CopyPlugin({
            patterns: [
                  { from: '../../../node_modules/font-awesome/', to: 'font-awesome' },
                  { from: '../../../node_modules/intl-tel-input/build/', to: 'intl-tel-input' },
                  { from: '../../../node_modules/jquery/dist/', to: 'jquery' },
                  { from: '../../../node_modules/offline-js/offline.min.js', to: 'offline-js' },
                  { from: '../../../node_modules/rangy/lib/', to: 'rangy' },
                  { from: '../../../node_modules/zxcvbn/dist/', to: 'zxcvbn' },
                  { from: '../../../node_modules/ng-table/bundles/ng-table.min.css', to: 'ng-table' },
                  { from: '../../../node_modules/ng-table/bundles/ng-table.min.css.map', to: 'ng-table' },
            ],
          }),
          new webpack.ProvidePlugin({
            process: 'process/browser',
          }),
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
          }),  
      
    ],

    entry: './main.ts'
};