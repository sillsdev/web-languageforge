'use strict';

var BellowsResetPasswordPage = function() {
  this.get = function(resetPasswordKey) {
    browser.get('/auth/reset_password/' + resetPasswordKey);
    browser.waitForAngular();
  };

  this.form = element('form#resetPasswordForm');
  this.infoMessages = element.all(by.css('.alert-info'));
  this.errors = element.all(by.css('.alert-error'));
  this.passwordInput = element(by.model('record.password'));
  this.confirmPasswordInput = element(by.model('confirmPassword'));
  this.resetButton = element(by.partialButtonText('Reset Password'));
};

module.exports = new BellowsResetPasswordPage();
