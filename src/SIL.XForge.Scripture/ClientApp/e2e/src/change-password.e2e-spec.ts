import { browser, ExpectedConditions } from 'protractor';

import { AppPage } from './app.po';
import { ChangePasswordPage } from './change-password.po';
import { LoginPage } from './login.po';
import { MyAccountPage } from './my-account.po';

describe('E2E Change Password app', () => {
  const constants = require('../testConstants.json');
  const loginPage = new LoginPage();
  const changePasswordPage = new ChangePasswordPage();
  const newPassword = '12345678';

  it('setup: login as user, go to change password page', async () => {
    await LoginPage.logout();
    await loginPage.loginAsUser();
    await changePasswordPage.get();
  });

  it('Verify the changed password navigates to homepage after clicking the submit button', async () => {
    await changePasswordPage.newPasswordInput.clear();
    await changePasswordPage.confirmPasswordInput.clear();
    await changePasswordPage.newPasswordInput.sendKeys(newPassword);
    await changePasswordPage.confirmPasswordInput.sendKeys(newPassword);
    await changePasswordPage.changePasswordButton.click();
    await browser.wait(ExpectedConditions.urlContains('home'), constants.conditionTimeout);

    await expect(browser.getCurrentUrl()).toContain('/home');
    await expect(AppPage.getMainHeading()).toContain(constants.memberName);
    await AppPage.homepage.avatar.click();
    await AppPage.homepage.logoutButton.click();
    await loginPage.login(constants.memberUsername, newPassword);

    await expect(AppPage.getMainHeading()).toContain(constants.memberName);
  });

  it('Change new password into old password', async () => {
    await AppPage.homepage.avatar.click();
    await AppPage.homepage.myAccount.click();
    await browser.wait(ExpectedConditions.visibilityOf(MyAccountPage.changePasswordButton), constants.conditionTimeout);
    await MyAccountPage.changePasswordButton.click();
    await changePasswordPage.newPasswordInput.sendKeys(constants.adminPassword);
    await changePasswordPage.confirmPasswordInput.sendKeys(constants.adminPassword);
    await changePasswordPage.changePasswordButton.click();
    await browser.wait(ExpectedConditions.urlContains('home'), constants.conditionTimeout);

    await expect(browser.getCurrentUrl()).toContain('/home');
    await AppPage.homepage.avatar.click();
    await AppPage.homepage.logoutButton.click();
  });
});
