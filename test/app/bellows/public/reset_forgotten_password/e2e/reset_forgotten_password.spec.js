'use strict';

describe('E2E testing: Reset Forgotten Password', function () {
  var constants = require('../../../../testConstants');
  var header             = require('../../../pages/pageHeader');
  var loginPage          = require('../../../pages/loginPage');
  var resetPasswordPage  = require('../../../pages/resetPasswordPage');
  var forgotPasswordPage = require('../../../pages/forgotPasswordPage');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  it('with expired reset key routes to login with warning', function () {
    resetPasswordPage.get(constants.expiredPasswordKey);
    browser.wait(expectedCondition.visibilityOf(loginPage.errors.get(0)),
      CONDITION_TIMEOUT);
    expect(loginPage.username.isDisplayed()).toBe(true);
    expect(loginPage.infoMessages.count()).toBe(0);
    expect(loginPage.errors.count()).toBe(1);
    expect(loginPage.errors.first().getText()).toContain('expired');

    // clear errors so that afterEach appFrame error check doesn't fail,
    // see projectSettings.spec.js
    browser.refresh();
    expect(loginPage.errors.count()).toBe(0);
  });

  describe('for Forgot Password request', function () {

    it('can navigate to request page', function () {
      loginPage.forgotPasswordLink.click();
      browser.wait(expectedCondition.stalenessOf(loginPage.forgotPasswordLink),
        CONDITION_TIMEOUT);
      browser.wait(expectedCondition.visibilityOf(forgotPasswordPage.usernameInput),
        CONDITION_TIMEOUT);
      expect(forgotPasswordPage.usernameInput.isDisplayed()).toBe(true);
    });

    it('cannot request for non-existent user', function () {
      forgotPasswordPage.get();
      expect(forgotPasswordPage.infoMessages.count()).toBe(0);
      expect(forgotPasswordPage.errors.count()).toBe(0);
      forgotPasswordPage.usernameInput.sendKeys(constants.unusedUsername);
      forgotPasswordPage.submitButton.click();
      browser.wait(expectedCondition.visibilityOf(forgotPasswordPage.errors.get(0)),
        CONDITION_TIMEOUT);
      expect(forgotPasswordPage.errors.count()).toBe(1);
      expect(forgotPasswordPage.errors.first().getText()).toContain('User not found');
      forgotPasswordPage.usernameInput.clear();

      // clear errors so that afterEach appFrame error check doesn't fail,
      // see projectSettings.spec.js
      browser.refresh();
      expect(forgotPasswordPage.errors.count()).toBe(0);
    });

    it('can submit request', function () {
      forgotPasswordPage.usernameInput.sendKeys(constants.expiredUsername);
      forgotPasswordPage.submitButton.click();
      expect(forgotPasswordPage.errors.count()).toBe(0);
      browser.wait(expectedCondition.stalenessOf(resetPasswordPage.confirmPasswordInput),
        CONDITION_TIMEOUT);
      browser.wait(expectedCondition.visibilityOf(loginPage.infoMessages.get(0)),
        CONDITION_TIMEOUT);
      expect(loginPage.username.isDisplayed()).toBe(true);
      expect(loginPage.errors.count()).toBe(0);
      expect(loginPage.infoMessages.count()).toBe(1);
      expect(loginPage.infoMessages.first().getText()).toContain('email sent');
    });

  });

  describe('for Reset Password', function () {

    it('with valid reset key routes reset page', function () {
      resetPasswordPage.get(constants.resetPasswordKey);
      expect(resetPasswordPage.confirmPasswordInput.isDisplayed()).toBe(true);
      expect(resetPasswordPage.errors.count()).toBe(0);
      expect(loginPage.infoMessages.count()).toBe(0);
    });

    it('refuses to allow form submission if the confirm input does not match', function () {
      resetPasswordPage.passwordInput.sendKeys(constants.passwordValid);
      resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordTooShort);
      expect(resetPasswordPage.resetButton.isEnabled()).toBe(false);
      resetPasswordPage.passwordInput.clear();
      resetPasswordPage.confirmPasswordInput.clear();
    });

    it('allows form submission if the confirm input matches', function () {
      resetPasswordPage.passwordInput.sendKeys(constants.passwordValid);
      resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordValid);
      expect(resetPasswordPage.resetButton.isEnabled()).toBe(true);
      resetPasswordPage.passwordInput.clear();
      resetPasswordPage.confirmPasswordInput.clear();
    });

    it('should not allow a password less than 7 characters', function () {
      resetPasswordPage.passwordInput.sendKeys(constants.passwordTooShort);
      resetPasswordPage.confirmPasswordInput.sendKeys(constants.passwordTooShort);
      expect(resetPasswordPage.resetButton.isEnabled()).toBe(false);
      resetPasswordPage.passwordInput.clear();
      resetPasswordPage.confirmPasswordInput.clear();
    });

    it('successfully change user\'s password', function () {
      resetPasswordPage.get(constants.resetPasswordKey);
      resetPasswordPage.passwordInput.sendKeys(constants.resetPassword);
      resetPasswordPage.confirmPasswordInput.sendKeys(constants.resetPassword);
      resetPasswordPage.resetButton.click();

      // browser.wait(expectedCondition.stalenessOf(resetPasswordPage.confirmPasswordInput),
      //   CONDITION_TIMEOUT);
      // 'stalenessOf' occasionally failed with
      // WebDriverError: javascript error: document unloaded while waiting for result
      browser.sleep(100);
      browser.wait(expectedCondition.visibilityOf(loginPage.infoMessages.get(0)),
        CONDITION_TIMEOUT);
      expect(loginPage.username.isDisplayed()).toBe(true);
      expect(loginPage.infoMessages.count()).toBe(1);
      expect(loginPage.infoMessages.first().getText()).toContain('password has been reset');
      expect(loginPage.errors.count()).toBe(0);
    });

    it('successfully login after password change', function () {
      loginPage.get();
      loginPage.login(constants.resetUsername, constants.resetPassword);
      expect(header.loginButton.isPresent()).toBe(false);
      expect(header.myProjects.button.isDisplayed()).toBe(true);
    });

  });

});
