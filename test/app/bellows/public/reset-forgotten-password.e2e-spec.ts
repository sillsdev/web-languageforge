import {browser, ExpectedConditions} from 'protractor';

import {BellowsForgotPasswordPage} from '../shared/forgot-password.page';
import {BellowsLoginPage} from '../shared/login.page';
import {PageHeader} from '../shared/page-header.element';
import {BellowsResetPasswordPage} from '../shared/reset-password.page';

describe('Bellows E2E Reset Forgotten Password app', async () => {
  const constants = require('../../testConstants.json');
  const header = new PageHeader();
  const loginPage = new BellowsLoginPage();
  const resetPasswordPage = new BellowsResetPasswordPage();
  const forgotPasswordPage = new BellowsForgotPasswordPage();

  it('with expired reset key routes to login with warning', async () => {
    await BellowsLoginPage.logout();
    await BellowsResetPasswordPage.get(constants.expiredPasswordKey);
    await browser.wait(ExpectedConditions.visibilityOf(loginPage.errors.get(0)), constants.conditionTimeout);
    await expect<any>(loginPage.username.isDisplayed()).toBe(true);
    await expect<any>(loginPage.infoMessages.count()).toBe(0);
    await expect<any>(loginPage.errors.count()).toBe(1);
    await expect<any>(loginPage.errors.first().getText()).toContain('expired');

    // clear errors so that afterEach appFrame error check doesn't fail, see project-settings.e2e-spec.js
    await browser.refresh();
    await expect<any>(loginPage.errors.count()).toBe(0);
  });

  describe('for Forgot Password request', async () => {

    it('can navigate to request page', async () => {
      await loginPage.forgotPasswordLink.click();
      await browser.wait(ExpectedConditions.stalenessOf(loginPage.forgotPasswordLink), constants.conditionTimeout);
      await browser.wait(ExpectedConditions.visibilityOf(forgotPasswordPage.usernameInput), constants.conditionTimeout);
      await expect<any>(forgotPasswordPage.usernameInput.isDisplayed()).toBe(true);
    });

    it('cannot request for non-existent user', async () => {
      await BellowsForgotPasswordPage.get();
      await expect<any>(forgotPasswordPage.infoMessages.count()).toBe(0);
      await expect<any>(forgotPasswordPage.errors.count()).toBe(0);
      await forgotPasswordPage.usernameInput.sendKeys(constants.unusedUsername);
      await forgotPasswordPage.submitButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(forgotPasswordPage.errors.get(0)), constants.conditionTimeout);
      await expect<any>(forgotPasswordPage.errors.count()).toBe(1);
      await expect<any>(forgotPasswordPage.errors.first().getText()).toContain('User not found');
      await forgotPasswordPage.usernameInput.clear();

      // clear errors so that afterEach appFrame error check doesn't fail, see project-settings.e2e-spec.js
      await browser.refresh();
      await expect<any>(forgotPasswordPage.errors.count()).toBe(0);
    });

    it('can submit request', async () => {
      await forgotPasswordPage.usernameInput.sendKeys(constants.expiredUsername);
      await browser.wait(ExpectedConditions.visibilityOf(forgotPasswordPage.submitButton), constants.conditionTimeout);
      await forgotPasswordPage.submitButton.click();
      await browser.wait(() => forgotPasswordPage.errors, constants.conditionTimeout);
      await expect<any>(forgotPasswordPage.errors.count()).toBe(0);
      await browser.wait(ExpectedConditions.stalenessOf(resetPasswordPage.confirmPasswordInput),
        constants.conditionTimeout);
      await browser.wait(ExpectedConditions.visibilityOf(loginPage.infoMessages.get(0)), constants.conditionTimeout);
      await expect<any>(loginPage.username.isDisplayed()).toBe(true);
      await expect<any>(loginPage.errors.count()).toBe(0);
      await expect<any>(loginPage.infoMessages.count()).toBe(1);
      await expect<any>(loginPage.infoMessages.first().getText()).toContain('email sent');
    });

  });

  describe('for Reset Password', async () => {

    it('with valid reset key routes reset page', async () => {
      await BellowsResetPasswordPage.get(constants.resetPasswordKey);
      await browser.wait(ExpectedConditions.visibilityOf(resetPasswordPage.confirmPasswordInput),
       constants.conditionTimeout);
      await expect<any>(resetPasswordPage.confirmPasswordInput.isDisplayed()).toBe(true);
      await expect<any>(resetPasswordPage.errors.count()).toBe(0);
      await expect<any>(loginPage.infoMessages.count()).toBe(0);
    });

    it('refuses to allow form submission if the confirm input does not match', async () => {
      await resetPasswordPage.passwordInput.sendKeys(constants.passwordValid);
      await resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordTooShort);
      await expect<any>(resetPasswordPage.resetButton.isEnabled()).toBe(false);
      await resetPasswordPage.passwordInput.clear();
      await resetPasswordPage.confirmPasswordInput.clear();
    });

    it('allows form submission if the confirm input matches', async () => {
      await resetPasswordPage.passwordInput.sendKeys(constants.passwordValid);
      await resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordValid);
      await expect<any>(resetPasswordPage.resetButton.isEnabled()).toBe(true);
      await resetPasswordPage.passwordInput.clear();
      await resetPasswordPage.confirmPasswordInput.clear();
    });

    it('should not allow a password less than 7 characters', async () => {
      await resetPasswordPage.passwordInput.sendKeys(constants.passwordTooShort);
      await resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordTooShort);
      await expect<any>(resetPasswordPage.resetButton.isEnabled()).toBe(false);
      await resetPasswordPage.passwordInput.clear();
      await resetPasswordPage.confirmPasswordInput.clear();
    });

    it('successfully change user\'s password', async () => {
      await BellowsResetPasswordPage.get(constants.resetPasswordKey);
      await browser.wait(ExpectedConditions.visibilityOf(resetPasswordPage.passwordInput),
        constants.conditionTimeout);
      await resetPasswordPage.passwordInput.sendKeys(constants.resetPassword);
      await browser.wait(ExpectedConditions.visibilityOf(resetPasswordPage.confirmPasswordInput),
        constants.conditionTimeout);
      await resetPasswordPage.confirmPasswordInput.sendKeys(constants.resetPassword);
      await browser.wait(ExpectedConditions.visibilityOf(resetPasswordPage.resetButton),
        constants.conditionTimeout);
      await resetPasswordPage.resetButton.click();

      // browser.wait(ExpectedConditions.stalenessOf(resetPasswordPage.confirmPasswordInput),
      // constants.conditionTimeout);
      // 'stalenessOf' occasionally failed with
      // WebDriverError: javascript error: document unloaded while waiting for result
      await browser.sleep(100);
      await browser.wait(ExpectedConditions.visibilityOf(loginPage.infoMessages.get(0)), constants.conditionTimeout);
      await expect<any>(loginPage.username.isDisplayed()).toBe(true);
      await expect<any>(loginPage.form.isPresent()).toBe(true);
      await expect<any>(loginPage.infoMessages.count()).toBe(1);
      await expect<any>(loginPage.infoMessages.first().getText()).toContain('password has been reset');
      await expect<any>(loginPage.errors.count()).toBe(0);
    });

    it('successfully login after password change', async () => {
      await BellowsLoginPage.get();
      await loginPage.login(constants.resetUsername, constants.resetPassword);
      await expect<any>(header.loginButton.isPresent()).toBe(false);
      await expect<any>(header.myProjects.button.isDisplayed()).toBe(true);
    });

  });

});
