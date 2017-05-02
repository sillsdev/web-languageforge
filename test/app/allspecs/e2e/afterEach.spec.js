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
        var message = browserLog[i];
        var text = message.message;
        if (text.indexOf('\n') != -1) {

          // place CR between lines
          text = text.split('\n').join('\n');
        }

        if (util.isMessageToIgnore(message)) {
          return;
        }

        text = '\n\nBrowser Console JS Error: \n' + text + '\n\n';
        expect(text).toEqual(''); // fail the test
      }
    }
  });
});
