'use strict';

var BellowsForgotPasswordPage = function() {
  this.get = function() {
    browser.get(browser.baseUrl + '/auth/forgot_password');
  };

  this.form = element(by.id('forgot-password-form'));
  // infoMessage and errors are dynamic elements, so class name locators seem to be the best option
  this.infoMessages = element.all(by.className('alert-info'));
  this.errors = element.all(by.className('alert-danger'));
  this.usernameInput = element(by.id('username'));
  this.submitButton = element(by.id('forgot-password-submit-btn'));
};

module.exports = new BellowsForgotPasswordPage();
