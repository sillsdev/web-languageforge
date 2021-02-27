import {browser, by, element, ExpectedConditions} from 'protractor';

export class BellowsChangePasswordPage {
  conditionTimeout: number = 3000;

  // TODO: this will likely change when we refactor the display of notifications - cjh 2014-06
  async get() {
    await browser.get(browser.baseUrl + '/app/changepassword');
    return browser.wait(ExpectedConditions.visibilityOf(this.password), this.conditionTimeout);
  }

  password = element(by.id('change-password-input'));
  confirm = element(by.id('change-password-confirm-input'));
  passwordMatchImage = element(by.id('change-password-match'));
  submitButton = element(by.id('change-password-submit-button'));
  noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
}
