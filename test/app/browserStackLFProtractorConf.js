exports.config = {
  'baseUrl': 'http://e2etest.languageforge.org',
  'framework': 'jasmine2',
  'rootElement': '[id="app-container-for-bootstrap"]',

  'capabilities': {
    'browserName': 'chrome',
    'os': 'Windows',
    'os_version': '10'
  },

  onPrepare: function () {
    if (process.env.TEAMCITY_VERSION) {
      var jasmineReporters = require('jasmine-reporters');
      jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter());
    }
    else {
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
      }
    }
  }
};
