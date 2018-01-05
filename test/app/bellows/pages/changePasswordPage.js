'use strict';

module.exports = new BellowsChangePasswordPage();

function BellowsChangePasswordPage() {
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  // TODO: this will likely change when we refactor the display of notifications - cjh 2014-06
  this.get = function get() {
    browser.get(browser.baseUrl + '/app/changepassword');
    browser.wait(expectedCondition.visibilityOf(this.password), CONDITION_TIMEOUT);
  };

  this.password = element(by.id('change-password-input'));
  this.confirm = element(by.id('change-password-confirm-input'));
  this.passwordMatchImage = element(by.id('change-password-match'));
  this.submitButton = element(by.id('change-password-submit-button'));
  this.noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
}
