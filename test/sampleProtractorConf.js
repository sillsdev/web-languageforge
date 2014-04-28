// An example configuration file.
exports.config = {
  // The address of a running selenium server.
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  seleniumAddress: 'http://192.168.56.1:4444/wd/hub',

  // To run tests in a single browser, uncomment the following
  // capabilities: {
  //   'browserName': 'chrome'
  // },

  // To run tests in multiple browsers, uncomment the following
  multiCapabilities: [{
    'browserName': 'chrome'
  }, {
    'browserName': 'firefox'
  }],

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['lib/node_modules/protractor/example/example_spec.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
