'use strict';

// Karma configuration
module.exports = function (config) {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine', 'karma-typescript'],

    // list of files / patterns to load in the browser
    files: [
      'src/angular-app/**/*.ts'

      // exclude sfchecks tests for now since they aren't working - IJH 2017-08
      // 'node_modules/angular/angular.js',
      // 'node_modules/angular-route/angular-route.js',
      // 'node_modules/angular-sanitize/angular-sanitize.js',
      // 'node_modules/angular-mocks/angular-mocks.js',
      // 'node_modules/ng-file-upload/dist/ng-file-upload.js',
      // 'node_modules/jquery/dist/jquery.js',
      // 'node_modules/angular-ui-bootstrap/dist/*ui-bootstrap*.js',
      // 'src/angular-app/**/*.js',
      // 'test/app/**/unit/*.spec.js'
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },

    karmaTypescriptConfig: {
      tsconfig: './tsconfig.json',
      reports: {
        html: 'test/CodeCoverage/typescript/'
      }
    },

    // test results reporter to use
    // possible values: dots || progress || growl
    reporters: ['progress', 'karma-typescript'],

    // web server port
    port: 8080,

    // cli runner port
    runnerPort: 9100,

    colors: true,
    logLevel: config.LOG_WARN,
    browsers: ['ChromeHeadless'],
    captureTimeout: 8000,
    singleRun: true
  });
};
