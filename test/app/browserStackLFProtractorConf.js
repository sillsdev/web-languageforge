exports.config = {
  'baseUrl': 'http://e2etest.languageforge.org',
  'framework': 'jasmine2',
  'rootElement': '[id="app-container-for-bootstrap"]',

  'commonCapabilities': {
    'browserstack.build': process.env.BUILD_NUMBER,
    'browserstack.project': process.env.TEAMCITY_BUILDCONF_NAME
  },

  'multiCapabilities': [{
    'browserName': 'Chrome',
    'os': 'Windows',
    'os_version': '10',
  },{
    'browserName': 'Chrome',
    'browser_version': '55.0',
    'os': 'Windows',
    'os_version': '10',
  },{
    'browserName': 'Chrome',
    'browser_version': '55.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1600x1200',
  },{
    'browserName': 'Firefox'
  },{
    'browserName': 'IE'
  }],


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
