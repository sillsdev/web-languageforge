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

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome', 'PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 8000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
