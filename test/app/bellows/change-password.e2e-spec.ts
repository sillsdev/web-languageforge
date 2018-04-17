import {browser, by, element, ExpectedConditions, promise, protractor} from 'protractor';

import { BellowsChangePasswordPage } from './shared/change-password.page';
import { BellowsLoginPage } from './shared/login.page';
import { PageHeader } from './shared/page-header.element';


describe('Bellows E2E Change Password app', function() {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const header = new PageHeader();
  const changePasswordPage = new BellowsChangePasswordPage();
  const newPassword = '12345678';

  it('setup: login as user, go to change password page', async function() {
    await loginPage.loginAsUser();
    await changePasswordPage.get();
  });

  it('refuses to allow form submission if the confirm input does not match', async function() {
    await changePasswordPage.password.sendKeys(newPassword);
    await changePasswordPage.confirm.sendKeys('blah12345');
    expect(await changePasswordPage.submitButton.isEnabled()).toBeFalsy();
    await changePasswordPage.password.clear();
    await changePasswordPage.confirm.clear();
  });

  it('allows form submission if the confirm input matches', async function() {
   await changePasswordPage.password.sendKeys(newPassword);
   await changePasswordPage.confirm.sendKeys(newPassword);
   expect(await changePasswordPage.submitButton.isEnabled()).toBeTruthy();
   await changePasswordPage.password.clear();
   await changePasswordPage.confirm.clear();
  });

  /* cant test this yet because I don't know how to test for HTML 5 form validation - cjh 2014-06
  it('should not allow a password less than 7 characters', function() {
    var shortPassword = '12345';
    changePasswordPage.password.sendKeys(shortPassword);
    changePasswordPage.confirm.sendKeys(shortPassword);
    expect(changePasswordPage.submitButton.isEnabled()).toBe(false);
    changePasswordPage.password.clear();
    changePasswordPage.confirm.clear();
  }); */
  

  it('can successfully changes user\'s password after form submission', async function() {
    await changePasswordPage.password.sendKeys(newPassword);
    await changePasswordPage.confirm.sendKeys(newPassword);
    await browser.driver.wait(ExpectedConditions.visibilityOf(changePasswordPage.passwordMatchImage), constants.conditionTimeout);
    await browser.driver.wait(ExpectedConditions.elementToBeClickable(changePasswordPage.submitButton), constants.conditionTimeout);
    await changePasswordPage.submitButton.click();
    await expect<any>(await changePasswordPage.noticeList.count()).toBe(1);
    await expect(await changePasswordPage.noticeList.first().getText()).toContain('Password updated');
    await BellowsLoginPage.logout();

    await loginPage.login(constants.memberUsername, newPassword);
    await browser.driver.wait(ExpectedConditions.visibilityOf(header.myProjects.button), constants.conditionTimeout);
    expect<any>(await header.myProjects.button.isDisplayed()).toBe(true);

    // reset password back to original
    await changePasswordPage.get();
    await changePasswordPage.password.sendKeys(constants.memberPassword);
    await changePasswordPage.confirm.sendKeys(constants.memberPassword);
    await browser.driver.wait(ExpectedConditions.visibilityOf(changePasswordPage.passwordMatchImage), constants.conditionTimeout);
    await browser.driver.wait(ExpectedConditions.elementToBeClickable(changePasswordPage.submitButton), constants.conditionTimeout);
    await changePasswordPage.submitButton.click();
  }); 
  

});
