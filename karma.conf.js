'use strict';
var getWebpackConfig = require('./webpack.config.js');

// Karma configuration
module.exports = function (config) {
  if (config.applicationName == null) {
    config.applicationName = 'languageforge';
  }
  var webpackConfig = getWebpackConfig({ applicationName: config.applicationName, isTest: true });
  var main = webpackConfig.entry.main;
  delete webpackConfig.entry;

  config.set({
    basePath: '.',
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [main],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      [main]: ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    // test results reporter to use
    // possible values: dots || progress || growl
    reporters: ['progress'],

    // web server port
    port: 8080,

    // cli runner port
    runnerPort: 9100,

    colors: true,
    logLevel: config.LOG_WARN,
    browsers: ['ChromiumHeadless'],
    captureTimeout: 8000,
    singleRun: true,
    mime: {
      'text/x-typescript': ['ts','tsx']
    }
  });
};
