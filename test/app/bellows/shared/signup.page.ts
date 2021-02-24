import {browser, by, element} from 'protractor';

export class SignupPage {
  static get() {
    return browser.get(browser.baseUrl + '/public/signup');
  }

  static getPrefilledEmail(email: string) {
    return browser.get(browser.baseUrl + '/public/signup#!/?e=' + encodeURIComponent(email));
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

    setInvalidCaptcha: async () => {
      await this.captcha.blueSquareButton.click();
      return this.captcha.expectedItemName.getText().then((result: string) => {
        if (result === 'Blue Square') {
          element(by.id('pui-captcha')).element(by.id('captcha1')).click();
        }
      });
    },

    setValidCaptcha: () => {
      return this.captcha.expectedItemName.getText().then((result: string) => {
        const captchaDiv = element(by.id('pui-captcha'));
        switch (result) {
          case 'Blue Square' :
            return captchaDiv.element(by.id('captcha0')).click();
          case 'Yellow Circle' :
            return captchaDiv.element(by.id('captcha1')).click();
          case 'Red Triangle' :
            return captchaDiv.element(by.id('captcha2')).click();
        }
      });
    }
  };

  captchaInvalid = element(by.id('captchaInvalid'));
  signupButton = element(by.id('submit'));
  noticeList  = element.all(by.repeater('notice in $ctrl.notices()'));
}
