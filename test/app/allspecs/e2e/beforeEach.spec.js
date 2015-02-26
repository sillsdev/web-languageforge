'use strict';

var appFrame   = require('../../bellows/pages/appFrame.js');
var body     = require('../../bellows/pages/pageBody.js');
afterEach(function() {
  //browser.ignoreSyncronization = true;
  appFrame.errorMessage.isPresent().then(function(isPresent) {
    if (isPresent) {
      appFrame.errorMessage.getText().then(function(message) {
        if (message.indexOf('Oh. Exception') != -1) {
          message = "PHP API error on this page: " + message;
          expect(message).toEqual(''); // fail the test
        }
      });
    }
  });
  body.phpError.isPresent().then(function(isPresent) {
    if (isPresent) {
      body.phpError.getText().then(function(message) {
        message = "PHP Error present on this page:" + message;
        expect(message).toEqual(''); // fail the test
      });
    }
  });

  // output JS console errors and fail tests
  browser.manage().logs().get('browser').then(function(browserLog) {
    if (browserLog.length > 0) {
      for (var i=0;i<browserLog.length;i++) {
        var message = browserLog[i].message;
        if (message.indexOf('\n') != -1) {
          message = message.substring(0, message.indexOf('\n'));
        }
        if (/angular\.js .* TypeError: undefined is not a function/.test(message)) {
          // we ignore errors of this type caused by Angular being unloaded prematurely on page refreshes (since it's not a real error)

        } else {
          message = "Browser Console JS Error: " + message;
          expect(message).toEqual(''); // fail the test
        }

      }
    }
  });
  //browser.ignoreSyncronization = false;
});