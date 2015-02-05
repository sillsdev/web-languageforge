var constants = require('./testConstants.json');

var specs = ['bellows/**/e2e/*.spec.js'];
specs.push('scriptureforge/**/e2e/*.spec.js');

exports.config = {
  // The address of a running selenium server.
  seleniumAddress: 'http://192.168.56.1:4444/wd/hub',
  baseUrl: 'https://scriptureforge.local',
  
  // To run tests in a single browser, uncomment the following
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
        'args': ['--start-maximized'],
    },
  },

  // To run tests in multiple browsers, uncomment the following
  // multiCapabilities: [{
  //   'browserName': 'chrome'
  // }, {
  //   'browserName': 'firefox'
  // }],

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: specs,

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 70000,
    //isVerbose: true,
  },

  onPrepare: function() {
    if (process.env.TEAMCITY_VERSION) {
      require('jasmine-reporters');
      jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
  }
};

if (process.env.TEAMCITY_VERSION) {
  exports.config.jasmineNodeOpts.showColors = false;
  exports.config.jasmineNodeOpts.silent = true;
}
