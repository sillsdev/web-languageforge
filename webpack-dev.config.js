const path = require("path");
const webpackMerge = require("webpack-merge");
const commonConfig = require("./webpack.config.js");

module.exports = webpackMerge(commonConfig, {
  mode: "development",
  devtool: 'eval-cheap-module-source-map',
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve(__dirname, 'node_modules')]
  },
});
