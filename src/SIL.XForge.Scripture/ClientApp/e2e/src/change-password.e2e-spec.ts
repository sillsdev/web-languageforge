import { browser, ExpectedConditions } from 'protractor';

import { AppPage } from './app.po';
import { ChangePasswordPage } from './change-password.po';
import { LoginPage } from './login.po';


describe('E2E Change Password app', () => {
  const constants = require('../testConstants.json');
  const loginPage = new LoginPage();
  const changePasswordPage = new ChangePasswordPage();
  const newPassword = '12345678';

  it('setup: login as user, go to change password page', async () => {
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
    await expect(changePasswordPage.successMessage.getText()).toContain('Password Successfully Changed');
    expect(await AppPage.getMainHeading()).toContain(constants.memberName);
    await AppPage.homepage.logoutButton.click();

    await loginPage.login(constants.memberUsername, newPassword);
    await browser.wait(ExpectedConditions.visibilityOf(AppPage.homepage.changePasswordButton),
      constants.conditionTimeout);
    expect(await AppPage.getMainHeading()).toContain(constants.memberName);
  });

 it('Verify the changed password into Old Password', async () => {
    await AppPage.homepage.changePasswordButton.click();
    await changePasswordPage.newPasswordInput.sendKeys(constants.adminPassword);
    await changePasswordPage.confirmPasswordInput.sendKeys(constants.adminPassword);
    await changePasswordPage.changePasswordButton.click();
    await browser.wait(ExpectedConditions.urlContains('home'), constants.conditionTimeout);
    await expect(browser.getCurrentUrl()).toContain('/home');
    await expect(changePasswordPage.successMessage.getText()).toContain('Password Successfully Changed');
    await AppPage.homepage.logoutButton.click();
  });
});
