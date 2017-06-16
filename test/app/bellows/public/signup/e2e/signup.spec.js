'use strict';

describe('E2E testing: Signup app', function () {
  var constants = require('../../../../testConstants.json');
  var page         = require('../../../pages/signupPage.js');
  var loginPage    = require('../../../pages/loginPage.js');
  var projectsPage = require('../../../pages/projectsPage.js');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  it('setup and contains a user form', function () {
    loginPage.logout();
    page.get();
    expect(page.signupForm).toBeDefined();
  });

  it('can verify required information filled', function () {
    page.get();
    expect(page.signupButton.isEnabled()).toBe(false);
    page.emailInput.sendKeys(constants.unusedEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setInvalidCaptcha();
    expect(page.signupButton.isEnabled()).toBe(true);
  });

  it('cannot submit if email is invalid', function () {
    page.emailInput.clear();
    page.emailInput.sendKeys(constants.emailNoAt);
    page.captcha.setInvalidCaptcha();
    expect(page.emailInvalid.isDisplayed()).toBe(true);
    expect(page.signupButton.isEnabled()).toBe(false);
  });

  it('cannot submit if password is weak', function () {
    page.emailInput.clear();
    page.emailInput.sendKeys(constants.unusedEmail);
    expect(page.signupButton.isEnabled()).toBe(true);
    page.passwordInput.clear();
    page.passwordInput.sendKeys(constants.passwordTooShort);
    page.captcha.setInvalidCaptcha();
    expect(page.passwordIsWeak.isDisplayed()).toBe(true);
    expect(page.signupButton.isEnabled()).toBe(false);
  });

  it('can submit if password not weak', function () {
    page.passwordInput.clear();
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setInvalidCaptcha();
    expect(page.passwordIsWeak.isDisplayed()).toBe(false);
    expect(page.signupButton.isEnabled()).toBe(true);
  });

  it('can submit if password is showing and not weak', function () {
    page.showPassword.click();
    page.captcha.setInvalidCaptcha();
    expect(page.passwordIsWeak.isDisplayed()).toBe(false);
    expect(page.signupButton.isEnabled()).toBe(true);
  });

  it('cannot submit if captcha not selected', function () {
    page.get();
    page.emailInput.sendKeys(constants.unusedEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    expect(page.signupButton.isEnabled()).toBe(false);
  });

  it('can submit a user registration request and captcha is invalid', function () {
    page.get();
    page.emailInput.sendKeys(constants.unusedEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setInvalidCaptcha();
    page.signupButton.click();
    expect(page.captchaInvalid.isDisplayed()).toBe(true);
  });

  it('finds the admin user (case insensitive) already exists', function () {
    page.get();
    page.emailInput.sendKeys(constants.adminEmail.toUpperCase());
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setValidCaptcha();
    expect(page.signupButton.isEnabled()).toBe(true);
    page.signupButton.click();
    expect(page.emailTaken.isDisplayed()).toBe(true);
  });

  it('can prefill email address that can\'t be changed', function () {
    page.getPrefilledEmail(constants.unusedEmail);
    expect(page.emailInput.isEnabled()).toBe(false);
  });

  it('can prefill email address that already exists', function () {
    page.getPrefilledEmail(constants.adminEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setValidCaptcha();
    page.signupButton.click();
    expect(page.emailTaken.isDisplayed()).toBe(true);
  });

  it('can signup a new user', function () {
    page.get();
    page.emailInput.sendKeys(constants.unusedEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setValidCaptcha();
    expect(page.signupButton.isEnabled()).toBe(true);
    page.signupButton.click();

    // added to stop intermittent error
    // "Failed: javascript error: document unloaded while waiting for result"
    browser.wait(expectedCondition.urlContains('projects'), CONDITION_TIMEOUT);

    // Verify new user logged in and redirected to projects page
    browser.wait(expectedCondition.visibilityOf(projectsPage.createBtn), CONDITION_TIMEOUT); // flaky wait (can cause "document unloaded while waiting for result")
    expect(projectsPage.createBtn.isDisplayed()).toBe(true);
  });

  it('redirects to projects page if already logged in', function () {
    loginPage.logout();
    loginPage.loginAsUser();
    page.get();
    browser.wait(expectedCondition.visibilityOf(projectsPage.createBtn), CONDITION_TIMEOUT); // flaky wait (can cause "document unloaded while waiting for result")
    expect(projectsPage.createBtn.isDisplayed()).toBe(true);
  });
});
