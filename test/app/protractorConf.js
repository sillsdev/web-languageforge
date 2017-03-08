
exports.config = {
  // The address of a running selenium server.
  seleniumAddress: 'http://default.local:4444/wd/hub',
  baseUrl: 'http://languageforge.local',

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
  rootElement: '[id="app-container-for-bootstrap"]',

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  //specs: specs,

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 120000

    //isVerbose: true,
  },

  onPrepare: function () {
    /* global angular: false, browser: false, jasmine: false */

    browser.driver.manage().window().maximize();

    // Disable animations so e2e tests run more quickly
    var disableNgAnimate = function () {
      angular.module('disableNgAnimate', []).run(['$animate', function ($animate) {
        $animate.enabled(false);
      }]);
    };

    // This seemed to make the tests more flaky rather than less. IJH 2014-12
    //    browser.addMockModule('disableNgAnimate', disableNgAnimate);

    var jasmineReporters = require('jasmine-reporters');
    if (process.env.TEAMCITY_VERSION) {
      jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter());
    }
    else {
      jasmine.getEnv().addReporter(new jasmineReporters.TerminalReporter({
        verbosity: browser.params.verbosity, // [0 to 3, jasmine default 2]
        color: true,
        showStack: true
      }));
      var pauseOnFailure = {
        specDone: function (spec) {
          if (spec.status === 'failed') {
            browser.pause();
          }
        }
      }
      // Uncomment to pause tests on first failure
      // jasmine.getEnv().addReporter(pauseOnFailure);
    }
  }
};

if (process.env.TEAMCITY_VERSION) {
  exports.config.jasmineNodeOpts.showColors = false;
  exports.config.jasmineNodeOpts.silent = true;
}
