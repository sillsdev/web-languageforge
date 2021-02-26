import {browser, ExpectedConditions} from 'protractor';

import {BellowsForgotPasswordPage} from './shared/forgot-password.page';
import {BellowsLoginPage} from './shared/login.page';
import {PageHeader} from './shared/page-header.element';
import {BellowsResetPasswordPage} from './shared/reset-password.page';

describe('Bellows E2E Reset Forgotten Password app', () => {
  const constants = require('./../testConstants.json');
  const header = new PageHeader();
  const loginPage = new BellowsLoginPage();
  const resetPasswordPage = new BellowsResetPasswordPage();
  const forgotPasswordPage = new BellowsForgotPasswordPage();

  it('with expired reset key routes to login with warning', () => {
    BellowsLoginPage.logout();
    BellowsResetPasswordPage.get(constants.expiredPasswordKey);
    browser.wait(ExpectedConditions.visibilityOf(loginPage.errors.get(0)), constants.conditionTimeout);
    expect<any>(loginPage.username.isDisplayed()).toBe(true);
    expect<any>(loginPage.infoMessages.count()).toBe(0);
    expect<any>(loginPage.errors.count()).toBe(1);
    expect<any>(loginPage.errors.first().getText()).toContain('expired');

    // clear errors so that afterEach appFrame error check doesn't fail, see project-settings.e2e-spec.js
    browser.refresh();
    expect<any>(loginPage.errors.count()).toBe(0);
  });

  describe('for Forgot Password request', () => {

    it('can navigate to request page', () => {
      loginPage.forgotPasswordLink.click();
      browser.wait(ExpectedConditions.stalenessOf(loginPage.forgotPasswordLink), constants.conditionTimeout);
      browser.wait(ExpectedConditions.visibilityOf(forgotPasswordPage.usernameInput), constants.conditionTimeout);
      expect<any>(forgotPasswordPage.usernameInput.isDisplayed()).toBe(true);
    });

    it('cannot request for non-existent user', () => {
      BellowsForgotPasswordPage.get();
      expect<any>(forgotPasswordPage.infoMessages.count()).toBe(0);
      expect<any>(forgotPasswordPage.errors.count()).toBe(0);
      forgotPasswordPage.usernameInput.sendKeys(constants.unusedUsername);
      forgotPasswordPage.submitButton.click();
      browser.wait(ExpectedConditions.visibilityOf(forgotPasswordPage.errors.get(0)), constants.conditionTimeout);
      expect<any>(forgotPasswordPage.errors.count()).toBe(1);
      expect<any>(forgotPasswordPage.errors.first().getText()).toContain('User not found');
      forgotPasswordPage.usernameInput.clear();

      // clear errors so that afterEach appFrame error check doesn't fail, see project-settings.e2e-spec.js
      browser.refresh();
      expect<any>(forgotPasswordPage.errors.count()).toBe(0);
    });

    it('can submit request', () => {
      forgotPasswordPage.usernameInput.sendKeys(constants.expiredUsername);
      forgotPasswordPage.submitButton.click();
      expect<any>(forgotPasswordPage.errors.count()).toBe(0);
      browser.wait(ExpectedConditions.stalenessOf(resetPasswordPage.confirmPasswordInput), constants.conditionTimeout);
      browser.wait(ExpectedConditions.visibilityOf(loginPage.infoMessages.get(0)), constants.conditionTimeout);
      expect<any>(loginPage.username.isDisplayed()).toBe(true);
      expect<any>(loginPage.errors.count()).toBe(0);
      expect<any>(loginPage.infoMessages.count()).toBe(1);
      expect<any>(loginPage.infoMessages.first().getText()).toContain('email sent');
    });

  });

  describe('for Reset Password', () => {

    it('with valid reset key routes reset page', () => {
      BellowsResetPasswordPage.get(constants.resetPasswordKey);
      expect<any>(resetPasswordPage.confirmPasswordInput.isDisplayed()).toBe(true);
      expect<any>(resetPasswordPage.errors.count()).toBe(0);
      expect<any>(loginPage.infoMessages.count()).toBe(0);
    });

    it('refuses to allow form submission if the confirm input does not match', () => {
      resetPasswordPage.passwordInput.sendKeys(constants.passwordValid);
      resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordTooShort);
      expect<any>(resetPasswordPage.resetButton.isEnabled()).toBe(false);
      resetPasswordPage.passwordInput.clear();
      resetPasswordPage.confirmPasswordInput.clear();
    });

    it('allows form submission if the confirm input matches', () => {
      resetPasswordPage.passwordInput.sendKeys(constants.passwordValid);
      resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordValid);
      expect<any>(resetPasswordPage.resetButton.isEnabled()).toBe(true);
      resetPasswordPage.passwordInput.clear();
      resetPasswordPage.confirmPasswordInput.clear();
    });

    it('should not allow a password less than 7 characters', () => {
      resetPasswordPage.passwordInput.sendKeys(constants.passwordTooShort);
      resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordTooShort);
      expect<any>(resetPasswordPage.resetButton.isEnabled()).toBe(false);
      resetPasswordPage.passwordInput.clear();
      resetPasswordPage.confirmPasswordInput.clear();
    });

    it('successfully change user\'s password', () => {
      BellowsResetPasswordPage.get(constants.resetPasswordKey);
      resetPasswordPage.passwordInput.sendKeys(constants.resetPassword);
      resetPasswordPage.confirmPasswordInput.sendKeys(constants.resetPassword);
      resetPasswordPage.resetButton.click();

      // browser.wait(ExpectedConditions.stalenessOf(resetPasswordPage.confirmPasswordInput),
      //   constants.conditionTimeout);
      // 'stalenessOf' occasionally failed with
      // WebDriverError: javascript error: document unloaded while waiting for result
      browser.sleep(100);
      browser.wait(ExpectedConditions.visibilityOf(loginPage.infoMessages.get(0)), constants.conditionTimeout);
      expect<any>(loginPage.username.isDisplayed()).toBe(true);
      expect<any>(loginPage.form.isPresent()).toBe(true);
      expect<any>(loginPage.infoMessages.count()).toBe(1);
      expect<any>(loginPage.infoMessages.first().getText()).toContain('password has been reset');
      expect<any>(loginPage.errors.count()).toBe(0);
    });

    it('successfully login after password change', () => {
      BellowsLoginPage.get();
      loginPage.login(constants.resetUsername, constants.resetPassword);
      expect<any>(header.loginButton.isPresent()).toBe(false);
      expect<any>(header.myProjects.button.isDisplayed()).toBe(true);
    });

  });

});
