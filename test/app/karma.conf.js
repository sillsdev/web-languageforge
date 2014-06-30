// Karma configuration
module.exports = function(config) {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine'],
    // list of files / patterns to load in the browser
    files: [
      'src/js/lib/angular_stable_1.2.15/angular.js',
      'src/js/lib/angular_stable_1.2.15/angular-route.js',
      'src/js/lib/angular_stable_1.2.15/angular-animate.js',
      'src/js/lib/angular_stable_1.2.15/angular-sanitize.js',
      'test/lib/angular/angular-mocks.js',
      'src/js/lib/angular-file-upload.js',
      'src/js/lib/jquery-1.8.3.min.js',
      'src/js/lib/*ui-bootstrap*.js',
      'src/angular-app/**/*.js',
      'test/app/**/unit/*.spec.js'
    ],

    // list of files to exclude
    exclude: [],

    // test results reporter to use
    // possible values: dots || progress || growl
    reporters: ['progress'],

    // web server port
    port: 8080,

    // cli runner port
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO ||
	// LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file
	// changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 8000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
