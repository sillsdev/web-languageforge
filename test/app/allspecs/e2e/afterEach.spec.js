'use strict';

afterEach(function () {
  var appFrame = require('../../bellows/pages/appFrame.js');
  var body     = require('../../bellows/pages/pageBody.js');
  var util     = require('../../bellows/pages/util.js');

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

        if (util.isErrorToIgnore(message)) {
          return;
        }

        message = '\n\nBrowser Console JS Error: \n' + message + '\n\n';
        expect(message).toEqual(''); // fail the test
      }
    }
  });
});
