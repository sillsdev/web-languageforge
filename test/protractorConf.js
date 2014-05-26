// An example configuration file.
exports.config = {
  // The address of a running selenium server.
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  seleniumAddress: 'http://192.168.56.1:4444/wd/hub',
  // TODO: Re-enable when Test Project can be created with the jamaicanpsalm theme   2014-05 DDW
  //baseUrl: 'http://jamaicanpsalms.scriptureforge.local',
  baseUrl: 'http://scriptureforge.local',
  
  // To run tests in a single browser, uncomment the following
  capabilities: {
    'browserName': 'chrome'
  },

  // To run tests in multiple browsers, uncomment the following
  // multiCapabilities: [{
  //   'browserName': 'chrome'
  // }, {
  //   'browserName': 'firefox'
  // }],

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: [
      // 'app/setupTestEnvironment.spec.js',
      'app/**/e2e/*.spec.js',
      // 'app/teardownTestEnvironment.spec.js'
  ],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 50000
  }
};
