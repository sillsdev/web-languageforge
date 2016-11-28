'use strict';

var appFrame = require('../../bellows/pages/appFrame.js');
var body     = require('../../bellows/pages/pageBody.js');
afterEach(function () {
  appFrame.errorMessage.isPresent().then(function (isPresent) {
    if (isPresent) {
      appFrame.errorMessage.getText().then(function (message) {
        if (message.indexOf('Oh. Exception') != -1) {
          message = 'PHP API error on this page: ' + message;
          expect(message).toEqual(''); // fail the test
        }
      });
    }
  });

  body.phpError.isPresent().then(function (isPresent) {
    if (isPresent) {
      body.phpError.getText().then(function (message) {
        message = 'PHP Error present on this page:' + message;
        expect(message).toEqual(''); // fail the test
      });
    }
  });

  // output JS console errors and fail tests
  browser.manage().logs().get('browser').then(function (browserLog) {
    if (browserLog.length > 0) {
      for (var i = 0; i < browserLog.length; i++) {
        var message = browserLog[i].message;
        if (message.indexOf('\n') != -1) {

          // place CR between lines
          message = message.split('\n').join('\n');
        }

        // Errors we choose to ignore because they are typically not encountered by users, but only
        // in testing
        if (/angular\.js .* TypeError: undefined is not a function/.test(message) ||
          /angular.*\.js .* Error: \[\$compile:tpload]/.test(message) ||
          /angular\.js .*Error: RPC Error - Server Status Code -1/.test(message) ||
          /"level":"info"/.test(message) ||
          /next_id/.test(message) ||
          /ERR_INTERNET_DISCONNECTED/.test(message)
        ) {
          return;
        }

        message = '\n\nBrowser Console JS Error: \n' + message + '\n\n';
        expect(message).toEqual(''); // fail the test

      }
    }
  });
});
