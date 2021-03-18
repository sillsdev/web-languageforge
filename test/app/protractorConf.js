
exports.config = {
  // The address of a running selenium server.
  seleniumAddress: 'http://selenium:4444/wd/hub',
  baseUrl: 'http://app-for-e2e',

  // The timeout in milliseconds for each script run on the browser. This should
  // be longer than the maximum time your application needs to stabilize between
  // tasks.
  allScriptsTimeout: 12000,

  // To run tests in a single browser, uncomment the following
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--start-maximized']
    }
  },

  framework: 'jasmine2',

  // To run tests in multiple browsers, uncomment the following
  // multiCapabilities: [{
  //   'browserName': 'chrome'
  // }, {
  //   'browserName': 'firefox'
  // }],

  // Selector for the element housing the angular app - this defaults to
  // body, but is necessary if ng-app is on a descendant of <body>
  rootElement: '[id="app-container"]',

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  //specs: specs,

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 120000,
    print: function () {}

    //isVerbose: true,
  },

  onPrepare: function () {
    /* global angular: false, browser: false, jasmine: false */

    browser.driver.manage().window().maximize();

    if (process.env.TEAMCITY_VERSION) {
      var jasmineReporters = require('jasmine-reporters');
      jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter());
    } else {
      var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
      jasmine.getEnv().addReporter(new SpecReporter({
        spec: {
          displayStacktrace: true
        }
      }));
      /*
      jasmine.getEnv().addReporter(new jasmineReporters.TerminalReporter({
        verbosity: browser.params.verbosity, // [0 to 3, jasmine default 2]
        color: true,
        showStack: true
      }));
      */
      var pauseOnFailure = {
        specDone: function (spec) {
          if (spec.status === 'failed') {
            debugger;
          }
        }
      };

      // Uncomment to pause tests on first failure
      // jasmine.getEnv().addReporter(pauseOnFailure);
    }
  }
};

if (process.env.TEAMCITY_VERSION) {
  exports.config.jasmineNodeOpts.showColors = false;
  exports.config.jasmineNodeOpts.silent = true;
}
