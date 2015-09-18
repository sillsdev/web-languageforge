'use strict';

var BellowsForgotPasswordPage = function() {
  this.get = function() {
    browser.get('/auth/forgot_password/');
    browser.waitForAngular();
  };

  this.form = element('form#forgotPasswordForm');
  this.infoMessages = element.all(by.css('.alert-info'));
  this.errors = element.all(by.css('.alert-error'));
  this.usernameInput = element(by.id('username'));
  this.submitButton = element(by.partialButtonText('Submit'));
};

module.exports = new BellowsForgotPasswordPage();
