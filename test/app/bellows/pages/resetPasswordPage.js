'use strict';

var BellowsResetPasswordPage = function() {
  this.get = function(resetPasswordKey) {
    browser.get(browser.baseUrl + '/auth/reset_password/' + resetPasswordKey);
  };

  this.form = element(by.tagName('form'));
  this.infoMessages = element.all(by.css('.alert-info'));
  this.errors = element.all(by.css('.alert-error'));
  this.passwordInput = element(by.model('record.password'));
  this.confirmPasswordInput = element(by.model('confirmPassword'));
  this.resetButton = element(by.partialButtonText('Reset Password'));
};

module.exports = new BellowsResetPasswordPage();
