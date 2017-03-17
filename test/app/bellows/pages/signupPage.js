'use strict';

var SignupPage = function () {
  this.get = function () {
    browser.get(browser.baseUrl + '/public/signup');
  };

  this.getPrefilledEmail = function (email) {
    browser.get(browser.baseUrl + '/public/signup#/?e=' + encodeURIComponent(email));
  };

  this.signupForm = element(by.tagName('form'));
  this.emailInput = element(by.id('email'));
  this.emailInvalid = element(by.id('emailInvalid'));
  this.emailTaken = element(by.id('emailTaken'));

  this.nameInput = element(by.id('name'));

  this.visiblePasswordInput = element(by.id('visiblePassword'));
  this.visiblePasswordInvalid = element(by.id('visiblePasswordInvalid'));
  this.passwordInput = element(by.id('password'));
  this.passwordInvalid = element(by.id('passwordInvalid'));
  this.showPassword = element(by.model('showPassword'));

  this.captchaDiv = element(by.className('pui-captcha'));
  this.captcha = {
    expectedItemName: this.captchaDiv.element(by.id('expectedItemName')),
    blueSquareButton: this.captchaDiv.element(by.id('captcha0')),
    yellowCircleButton: this.captchaDiv.element(by.id('captcha1')),
    redTriangleButton: this.captchaDiv.element(by.id('captcha2')),

    setInvalidCaptcha: function () {
      this.blueSquareButton.click();
      this.expectedItemName.getText().then(function (result) {
        if (result == 'Blue Square') {
          element(by.className('pui-captcha')).element(by.id('captcha1')).click();
        }
      });
    },

    setValidCaptcha: function () {
      this.expectedItemName.getText().then(function (result) {
        var captchaDiv = element(by.className('pui-captcha'));
        switch (result) {
          case 'Blue Square' :
            captchaDiv.element(by.id('captcha0')).click();
            break;
          case 'Yellow Circle' :
            captchaDiv.element(by.id('captcha1')).click();
            break;
          case 'Red Triangle' :
            captchaDiv.element(by.id('captcha2')).click();
            break;
        }
      });
    }
  };

  this.captchaInvalid = element(by.id('captchaInvalid'));
  this.signupButton = element(by.id('submit'));
  this.noticeList  = element.all(by.repeater('notice in notices()'));
};

module.exports = new SignupPage();
