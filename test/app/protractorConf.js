var failFast = require('protractor-fail-fast');
var specString = '*';
var specs = [
  "/data/test/app/allspecs/**/*.e2e-spec.js",
  "/data/test/app/bellows/**/" + specString + ".e2e-spec.js",
  "/data/test/app/languageforge/**/" + specString + ".e2e-spec.js",
];
exports.config = {
  seleniumAddress: 'http://selenium:4444/wd/hub',
  baseUrl: 'http://app-for-e2e',
  allScriptsTimeout: 12000,
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--start-maximized']
    }
  },
  specs: specs,
  framework: 'jasmine2',
  rootElement: '[id="app-container"]',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 120000,
    print: function () {}
  },
  onPrepare: function () {
    /* global angular: false, browser: false, jasmine: false */

    browser.driver.manage().window().maximize();

    var jasmineReporters = require('jasmine-reporters');
    if (process.env.GITHUB_ACTIONS) {
      // https://github.com/angular/protractor-cookbook/tree/master/jasmine-junit-reports
      var junitReporter = new jasmineReporters.JUnitXmlReporter({
        savePath: 'e2e-output/',
        consolidateAll: true

        // results written to file: e2e-output/junitresults.xml

      });
      jasmine.getEnv().addReporter(junitReporter);
    }
    jasmine.getEnv().addReporter(new jasmineReporters.SpecReporter({
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
    var pauseOnFailure = {
      specDone: function (spec) {
        if (spec.status === 'failed') {
          debugger;
        }
      }
    };

    */
    // Uncomment to pause tests on first failure
    // jasmine.getEnv().addReporter(pauseOnFailure);
  },
  plugins: [failFast.init()],
  afterLaunch: function () {
    failFast.clean(); // Removes the fail file once all test runners have completed.
  }
};

if (process.env.TEAMCITY_VERSION) {
  exports.config.jasmineNodeOpts.showColors = false;
  exports.config.jasmineNodeOpts.silent = true;
}
