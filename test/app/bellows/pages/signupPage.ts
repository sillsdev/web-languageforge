import {browser, element, by} from 'protractor';

export class SignupPage {
  get() {
    browser.get(browser.baseUrl + '/public/signup');
  }

  getPrefilledEmail(email: string) {
    browser.get(browser.baseUrl + '/public/signup#!/?e=' + encodeURIComponent(email));
  }

  signupForm = element(by.id('signupForm'));
  emailInput = element(by.id('email'));
  emailInvalid = element(by.id('emailInvalid'));
  emailTaken = element(by.id('emailTaken'));

  nameInput = element(by.id('name'));

  visiblePasswordInvalid = element(by.id('visiblePasswordInvalid'));
  passwordInput = element(by.id('password'));
  passwordIsWeak = element(by.id('passwordIsWeak'));
  showPassword = element(by.model('$ctrl.showPassword'));

  captchaDiv = element(by.id('pui-captcha'));
  captcha = {
    expectedItemName: this.captchaDiv.element(by.id('expectedItemName')),
    blueSquareButton: this.captchaDiv.element(by.id('captcha0')),
    yellowCircleButton: this.captchaDiv.element(by.id('captcha1')),
    redTriangleButton: this.captchaDiv.element(by.id('captcha2')),

    setInvalidCaptcha: function () {
      this.blueSquareButton.click();
      this.expectedItemName.getText().then((result: string) => {
        if (result === 'Blue Square') {
          element(by.id('pui-captcha')).element(by.id('captcha1')).click();
        }
      });
    },

    setValidCaptcha: function () {
      this.expectedItemName.getText().then((result: string) => {
        let captchaDiv = element(by.id('pui-captcha'));
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

  captchaInvalid = element(by.id('captchaInvalid'));
  signupButton = element(by.id('submit'));
  noticeList  = element.all(by.repeater('notice in $ctrl.notices()'));
};
