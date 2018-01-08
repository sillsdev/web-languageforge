'use strict';

var BellowsResetPasswordPage = function () {
  this.get = function (resetPasswordKey) {
    browser.get(browser.baseUrl + '/auth/reset_password/' + resetPasswordKey);
  };

  this.form = element(by.id('reset-password-form'));
  // infoMessage and errors are dynamic elements, so class name locators seem to be the best option
  this.infoMessages = element.all(by.className('alert-info'));
  this.errors = element.all(by.className('alert-danger'));
  this.passwordInput = element(by.model('$ctrl.record.password'));
  this.confirmPasswordInput = element(by.model('$ctrl.confirmPassword'));
  this.resetButton = element(by.id('reset-password-btn'));
};

module.exports = new BellowsResetPasswordPage();
