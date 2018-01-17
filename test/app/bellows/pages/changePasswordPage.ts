import {browser, element, by, By, $, $$, ExpectedConditions} from 'protractor';

const CONDITION_TIMEOUT = 3000;

export class BellowsChangePasswordPage {
  // TODO: this will likely change when we refactor the display of notifications - cjh 2014-06
  get() {
    browser.get(browser.baseUrl + '/app/changepassword');
    browser.wait(ExpectedConditions.visibilityOf(this.password), CONDITION_TIMEOUT);
  };

  password = element(by.id('change-password-input'));
  confirm = element(by.id('change-password-confirm-input'));
  passwordMatchImage = element(by.id('change-password-match'));
  submitButton = element(by.id('change-password-submit-button'));
  noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
}

module.exports = new BellowsChangePasswordPage();
