import {browser, by, element} from 'protractor';

export class BellowsResetPasswordPage {
  static get(resetPasswordKey: string) {
    return browser.get(browser.baseUrl + '/auth/reset_password/' + resetPasswordKey);
  }

  form = element(by.id('reset-password-form'));
  // infoMessage and errors are dynamic elements, so class name locators seem to be the best option
  infoMessages = element.all(by.className('alert-info'));
  errors = element.all(by.className('alert-danger'));
  passwordInput = element(by.model('$ctrl.record.password'));
  confirmPasswordInput = element(by.model('$ctrl.confirmPassword'));
  resetButton = element(by.id('reset-password-btn'));
}
