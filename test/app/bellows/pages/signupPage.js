'use strict';

var SignupPage = function() {
  this.get = function() {
    browser.get('/signup');
    browser.waitForAngular();
  };
  
  this.signupForm = element('form#signupForm');
  this.usernameExists = element(by.id('usernameExists'));
  this.usernameOk = element(by.id('usernameOk'));
  this.usernameInput = element(by.model('record.username'));
  this.nameInput = element(by.model('record.name'));
  this.emailInput = element(by.model('record.email'));
  this.visiblePasswordInput = element(by.id('visiblePassword'));
  this.passwordInput = element(by.id('password'));
  this.confirmPasswordInput = element(by.model('confirmPassword'));
  this.showPassword = element(by.model('showPassword'));
  this.captchaInput = element(by.model('record.captcha'));
  this.captchaImage = element(by.id('captcha'));
  this.nextButton = element(by.id('identify'));
  this.signupButton = element(by.id('submit'));
  this.backButton = element(by.id('back'));
  this.noticeList  = element.all(by.repeater('notice in notices()'));
};

module.exports = new SignupPage();
