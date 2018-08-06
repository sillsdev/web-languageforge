import {browser, ExpectedConditions} from 'protractor';

import { BellowsChangePasswordPage } from './shared/change-password.page';
import { BellowsLoginPage } from './shared/login.page';
import { PageHeader } from './shared/page-header.element';

describe('Bellows E2E Change Password app', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const header = new PageHeader();
  const changePasswordPage = new BellowsChangePasswordPage();
  const newPassword = '12345678';

  it('setup: login as user, go to change password page', () => {
    loginPage.loginAsUser();
    changePasswordPage.get();
  });

  it('refuses to allow form submission if the confirm input does not match', () => {
    changePasswordPage.password.sendKeys(newPassword);
    changePasswordPage.confirm.sendKeys('blah12345');
    expect(changePasswordPage.submitButton.isEnabled()).toBeFalsy();
    changePasswordPage.password.clear();
    changePasswordPage.confirm.clear();
  });

  it('allows form submission if the confirm input matches', () => {
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

  it('can successfully changes user\'s password after form submission', () => {
    changePasswordPage.password.sendKeys(newPassword);
    changePasswordPage.confirm.sendKeys(newPassword);
    browser.wait(ExpectedConditions.visibilityOf(changePasswordPage.passwordMatchImage), constants.conditionTimeout);
    browser.wait(ExpectedConditions.elementToBeClickable(changePasswordPage.submitButton), constants.conditionTimeout);
    changePasswordPage.submitButton.click();
    expect<any>(changePasswordPage.noticeList.count()).toBe(1);
    expect(changePasswordPage.noticeList.first().getText()).toContain('Password updated');
    BellowsLoginPage.logout();

    loginPage.login(constants.memberUsername, newPassword);
    browser.wait(ExpectedConditions.visibilityOf(header.myProjects.button), constants.conditionTimeout);
    expect<any>(header.myProjects.button.isDisplayed()).toBe(true);

    // reset password back to original
    changePasswordPage.get();
    changePasswordPage.password.sendKeys(constants.memberPassword);
    changePasswordPage.confirm.sendKeys(constants.memberPassword);
    browser.wait(ExpectedConditions.visibilityOf(changePasswordPage.passwordMatchImage), constants.conditionTimeout);
    browser.wait(ExpectedConditions.elementToBeClickable(changePasswordPage.submitButton), constants.conditionTimeout);
    changePasswordPage.submitButton.click();
  });

});
