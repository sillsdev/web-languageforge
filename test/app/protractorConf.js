'use strict';

var constants = require('./testConstants.json'),
  specs = ['bellows/**/e2e/*.spec.js'];

if (constants.siteType == 'languageforge') {
    specs.push('languageforge/**/e2e/*.spec.js');
} else if (constants.siteType == 'scriptureforge') {
    specs.push('scriptureforge/**/e2e/*.spec.js');
}

exports.config = {
  // The address of a running selenium server.
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  seleniumAddress: 'http://192.168.56.1:4444/wd/hub',
  // TODO: Re-enable when Test Project can be created with the jamaicanpsalm theme   2014-05 DDW
  //baseUrl: 'https://scriptureforge.local',
  baseUrl: constants.baseUrl,
  
  // To run tests in a single browser, uncomment the following
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
        'args': ['--start-maximized'],
    }
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

  framework: 'jasmine',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 70000
    //isVerbose: true,
  },

  onPrepare: function() {
    /* global angular: false, browser: false, jasmine: false */

    // Disable animations so e2e tests run more quickly
    var disableNgAnimate = function() {
      angular.module('disableNgAnimate', []).run(['$animate', function($animate) {
        $animate.enabled(false);
      }]);
    };

    // This seemed to make the tests more flaky rather than less. IJH 2014-12
//    browser.addMockModule('disableNgAnimate', disableNgAnimate);

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
