import {} from 'jasmine';
import {browser, element, by, By, $, $$, ExpectedConditions} from 'protractor';

const constants = require('json!../../../testConstants.json');
import {BellowsLoginPage} from '../../pages/loginPage';
import {PageHeader} from '../../pages/pageHeader';
import {BellowsChangePasswordPage} from '../../pages/changePasswordPage';


describe('E2E testing: Change password', function () {
  // var constants = require('../../../testConstants');
  const expectedCondition = ExpectedConditions;
  const CONDITION_TIMEOUT = 3000;
  const newPassword = '12345678';
  const loginPage = new BellowsLoginPage();
  const header = new PageHeader();
  const changePasswordPage = new BellowsChangePasswordPage();

  it('setup: login as user, go to change password page', function () {
    loginPage.loginAsUser();
    changePasswordPage.get();
  });

  it('refuses to allow form submission if the confirm input does not match', function () {
    changePasswordPage.password.sendKeys(newPassword);
    changePasswordPage.confirm.sendKeys('blah12345');
    expect(changePasswordPage.submitButton.isEnabled()).toBeFalsy();
    changePasswordPage.password.clear();
    changePasswordPage.confirm.clear();
  });

  it('allows form submission if the confirm input matches', function () {
    changePasswordPage.password.sendKeys(newPassword);
    changePasswordPage.confirm.sendKeys(newPassword);
    expect(changePasswordPage.submitButton.isEnabled()).toBeTruthy();
    changePasswordPage.password.clear();
    changePasswordPage.confirm.clear();
  });

  /* cant test this yet because I don't know how to test for HTML 5 form validation - cjh 2014-06
  it('should not allow a password less than 7 characters', function() {
    var shortPassword = '12345';
    changePasswordPage.password.sendKeys(shortPassword);
    changePasswordPage.confirm.sendKeys(shortPassword);
    expect(changePasswordPage.submitButton.isEnabled()).toBe(false);
    changePasswordPage.password.clear();
    changePasswordPage.confirm.clear();
  });
  */

  it('can successfully changes user\'s password after form submission', function () {
    changePasswordPage.password.sendKeys(newPassword);
    changePasswordPage.confirm.sendKeys(newPassword);
    browser.wait(expectedCondition.visibilityOf(changePasswordPage.passwordMatchImage),
      CONDITION_TIMEOUT);
    browser.wait(expectedCondition.elementToBeClickable(changePasswordPage.submitButton),
      CONDITION_TIMEOUT);
    changePasswordPage.submitButton.click();
    expect(changePasswordPage.noticeList.count()).toBe(1);
    expect(changePasswordPage.noticeList.first().getText()).toContain('Password updated');
    loginPage.logout();

    loginPage.login(constants.memberUsername, newPassword);
    browser.wait(expectedCondition.visibilityOf(header.myProjects.button), CONDITION_TIMEOUT);
    expect(header.myProjects.button.isDisplayed()).toBe(true);

    // reset password back to original
    changePasswordPage.get();
    changePasswordPage.password.sendKeys(constants.memberPassword);
    changePasswordPage.confirm.sendKeys(constants.memberPassword);
    browser.wait(expectedCondition.visibilityOf(changePasswordPage.passwordMatchImage),
      CONDITION_TIMEOUT);
    browser.wait(expectedCondition.elementToBeClickable(changePasswordPage.submitButton),
      CONDITION_TIMEOUT);
    changePasswordPage.submitButton.click();
  });

});
