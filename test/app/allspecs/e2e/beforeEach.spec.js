'use strict';

var appFrame   = require('../../bellows/pages/appFrame.js');
var body     = require('../../bellows/pages/pageBody.js');
afterEach(function() {
  //browser.ignoreSyncronization = true;
  expect(appFrame.errorMessage.isPresent()).toBe(false);
  expect(body.phpError.isPresent()).toBe(false);

  // output JS console errors and fail tests
  browser.manage().logs().get('browser').then(function(browserLog) {
    if (browserLog.length > 0) {
      expect(browserLog.length).toBe(0); // throw an exception
      for (var i=0;i<browserLog.length;i++) {
        var message = browserLog[i].message;
        if (message.indexOf('\n') != -1) {
          message = message.substring(0, message.indexOf('\n'));
        }
        console.log(message);
        console.log('');
      }
    }
  });
  //browser.ignoreSyncronization = false;
});