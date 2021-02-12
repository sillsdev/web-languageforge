exports.config = {
  directConnect: true,
  baseUrl: 'http://localhost',
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--start-maximized']
    }
  },
  framework: 'jasmine2',
  rootElement: '[id="app-container"]',

  onPrepare: function () {
    /* global angular: false, browser: false, jasmine: false */

    //browser.driver.manage().window().maximize();
    var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true
      }
    }));

    var pauseOnFailure = {
      specDone: function (spec) {
        if (spec.status === 'failed') {
          browser.pause();
        }
      }
    };
    jasmine.getEnv().addReporter(pauseOnFailure);
  }
};
