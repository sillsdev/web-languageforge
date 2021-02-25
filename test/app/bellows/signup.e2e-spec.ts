import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from './shared/login.page';
import {SignupPage} from './shared/signup.page';

describe('Bellows E2E Signup app', () => {
  const constants = require('./../testConstants.json');
  const page = new SignupPage();
  const loginPage = new BellowsLoginPage();

  it('setup and contains a user form', () => {
    BellowsLoginPage.logout();
    SignupPage.get();
    expect(page.signupForm).toBeDefined();
  });

  it('can verify required information filled', () => {
    SignupPage.get();
    expect<any>(page.signupButton.isEnabled()).toBe(false);
    page.emailInput.sendKeys(constants.unusedEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setInvalidCaptcha();
    expect<any>(page.signupButton.isEnabled()).toBe(true);
  });

  it('cannot submit if email is invalid', () => {
    page.emailInput.clear();
    page.emailInput.sendKeys(constants.emailNoAt);
    page.captcha.setInvalidCaptcha();
    expect<any>(page.emailInvalid.isDisplayed()).toBe(true);
    expect<any>(page.signupButton.isEnabled()).toBe(false);
  });

  it('cannot submit if password is weak', () => {
    page.emailInput.clear();
    page.emailInput.sendKeys(constants.unusedEmail);
    expect<any>(page.signupButton.isEnabled()).toBe(true);
    page.passwordInput.clear();
    page.passwordInput.sendKeys(constants.passwordTooShort);
    page.captcha.setInvalidCaptcha();
    expect<any>(page.passwordIsWeak.isDisplayed()).toBe(true);
    expect<any>(page.signupButton.isEnabled()).toBe(false);
  });

  it('can submit if password not weak', () => {
    page.passwordInput.clear();
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setInvalidCaptcha();
    expect<any>(page.passwordIsWeak.isDisplayed()).toBe(false);
    expect<any>(page.signupButton.isEnabled()).toBe(true);
  });

  it('can submit if password is showing and not weak', () => {
    page.showPassword.click();
    page.captcha.setInvalidCaptcha();
    expect<any>(page.passwordIsWeak.isDisplayed()).toBe(false);
    expect<any>(page.signupButton.isEnabled()).toBe(true);
  });

  it('cannot submit if captcha not selected', () => {
    SignupPage.get();
    page.emailInput.sendKeys(constants.unusedEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    expect<any>(page.signupButton.isEnabled()).toBe(false);
  });

  it('can submit a user registration request and captcha is invalid', () => {
    SignupPage.get();
    page.emailInput.sendKeys(constants.unusedEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setInvalidCaptcha();
    page.signupButton.click();
    expect<any>(page.captchaInvalid.isDisplayed()).toBe(true);
  });

  it('finds the admin user (case insensitive) already exists', () => {
    SignupPage.get();
    page.emailInput.sendKeys(constants.adminEmail.toUpperCase());
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setValidCaptcha();
    expect<any>(page.signupButton.isEnabled()).toBe(true);
    page.signupButton.click();
    expect<any>(page.emailTaken.isDisplayed()).toBe(true);
  });

  it('can prefill email address that can\'t be changed', () => {
    SignupPage.getPrefilledEmail(constants.unusedEmail);
    expect<any>(page.emailInput.isEnabled()).toBe(false);
  });

  it('can prefill email address that already exists', () => {
    SignupPage.getPrefilledEmail(constants.adminEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setValidCaptcha();
    page.signupButton.click();
    expect<any>(page.emailTaken.isDisplayed()).toBe(true);
  });

  it('can signup a new user', () => {
    SignupPage.get();
    page.emailInput.sendKeys(constants.unusedEmail);
    page.nameInput.sendKeys(constants.unusedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captcha.setValidCaptcha();
    expect<any>(page.signupButton.isEnabled()).toBe(true);
    page.signupButton.click();

    // added to stop intermittent error
    // "Failed: javascript error: document unloaded while waiting for result"
    browser.wait(ExpectedConditions.urlContains('projects'), constants.conditionTimeout);

    // Verify new user logged in and redirected to projects page
    browser.getCurrentUrl().then(() => {
      expect(browser.getCurrentUrl()).toContain('/app/projects');
    });
  });

  it('redirects to projects page if already logged in', () => {
    BellowsLoginPage.logout();
    loginPage.loginAsUser();
    SignupPage.get();
    browser.wait(ExpectedConditions.urlContains('projects'), constants.conditionTimeout);
    browser.getCurrentUrl().then(() => {
      expect(browser.getCurrentUrl()).toContain('/app/projects');
    });
  });
});
