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
          
          // place CR between lines
          message = message.split('\n').join("\n");
        }
        if (/angular\.js .* TypeError: undefined is not a function/.test(message) || /next_id/.test(message)) {
          // we ignore errors of this type caused by Angular being unloaded prematurely on page refreshes (since it's not a real error)

        } else if (/rangy-1\.3alpha\.772/.test(message)) {
          // we ignore rangy errors because we are lazy and don't want to upgrade to the latest rangy atm (but we really should upgrade at some point) - cjh 2015-02
        } else {
          message = "\n\nBrowser Console JS Error: \n" + message + "\n\n";
          expect(message).toEqual(''); // fail the test
        }

      }
    }
  });
  //browser.ignoreSyncronization = false;
});