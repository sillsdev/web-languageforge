import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from './shared/login.page';
import {SignupPage} from './shared/signup.page';

describe('Bellows E2E Signup app', () => {
  const constants = require('./../testConstants.json');
  const page = new SignupPage();
  const loginPage = new BellowsLoginPage();

  it('setup and contains a user form', async () => {
    await BellowsLoginPage.logout();
    await SignupPage.get();
    expect(page.signupForm).toBeDefined();
  });

  it('can verify required information filled', async () => {
    await SignupPage.get();
    expect<any>(await page.signupButton.isEnabled()).toBe(false);
    await page.emailInput.sendKeys(constants.unusedEmail);
    await page.nameInput.sendKeys(constants.unusedName);
    await page.passwordInput.sendKeys(constants.passwordValid);
    await page.captcha.setInvalidCaptcha();
    expect<any>(await page.signupButton.isEnabled()).toBe(true);
  });

  it('cannot submit if email is invalid', async () => {
    await page.emailInput.clear();
    await page.emailInput.sendKeys(constants.emailNoAt);
    await page.captcha.setInvalidCaptcha();
    expect<any>(await page.emailInvalid.isDisplayed()).toBe(true);
    expect<any>(await page.signupButton.isEnabled()).toBe(false);
  });

  it('cannot submit if password is weak', async () => {
    await page.emailInput.clear();
    await page.emailInput.sendKeys(constants.unusedEmail);
    expect<any>(await page.signupButton.isEnabled()).toBe(true);
    await page.passwordInput.clear();
    await page.passwordInput.sendKeys(constants.passwordTooShort);
    await page.captcha.setInvalidCaptcha();
    expect<any>(await page.passwordIsWeak.isDisplayed()).toBe(true);
    expect<any>(await page.signupButton.isEnabled()).toBe(false);
  });

  it('can submit if password not weak', async () => {
    await page.passwordInput.clear();
    await page.passwordInput.sendKeys(constants.passwordValid);
    await page.captcha.setInvalidCaptcha();
    expect<any>(await page.passwordIsWeak.isDisplayed()).toBe(false);
    expect<any>(await page.signupButton.isEnabled()).toBe(true);
  });

  it('can submit if password is showing and not weak', async () => {
    await page.showPassword.click();
    await page.captcha.setInvalidCaptcha();
    expect<any>(await page.passwordIsWeak.isDisplayed()).toBe(false);
    expect<any>(await page.signupButton.isEnabled()).toBe(true);
  });

  it('cannot submit if captcha not selected', async () => {
    await SignupPage.get();
    await page.emailInput.sendKeys(constants.unusedEmail);
    await page.nameInput.sendKeys(constants.unusedName);
    await page.passwordInput.sendKeys(constants.passwordValid);
    expect<any>(await page.signupButton.isEnabled()).toBe(false);
  });

  it('can submit a user registration request and captcha is invalid', async () => {
    await SignupPage.get();
    await page.emailInput.sendKeys(constants.unusedEmail);
    await page.nameInput.sendKeys(constants.unusedName);
    await page.passwordInput.sendKeys(constants.passwordValid);
    await page.captcha.setInvalidCaptcha();
    await page.signupButton.click();
    expect<any>(await page.captchaInvalid.isDisplayed()).toBe(true);
  });

  it('finds the admin user (case insensitive) already exists', async () => {
    await SignupPage.get();
    await page.emailInput.sendKeys(constants.adminEmail.toUpperCase());
    await page.nameInput.sendKeys(constants.unusedName);
    await page.passwordInput.sendKeys(constants.passwordValid);
    await page.captcha.setValidCaptcha();
    expect<any>(await page.signupButton.isEnabled()).toBe(true);
    await page.signupButton.click();
    expect<any>(await page.emailTaken.isDisplayed()).toBe(true);
  });

  it('can prefill email address that can\'t be changed', async () => {
    await SignupPage.getPrefilledEmail(constants.unusedEmail);
    expect<any>(await page.emailInput.isEnabled()).toBe(false);
  });

  it('can prefill email address that already exists', async () => {
    await SignupPage.getPrefilledEmail(constants.adminEmail);
    await page.nameInput.sendKeys(constants.unusedName);
    await page.passwordInput.sendKeys(constants.passwordValid);
    await page.captcha.setValidCaptcha();
    await page.signupButton.click();
    expect<any>(await page.emailTaken.isDisplayed()).toBe(true);
  });

  it('can signup a new user', async () => {
    await SignupPage.get();
    await page.emailInput.sendKeys(constants.unusedEmail);
    await page.nameInput.sendKeys(constants.unusedName);
    await page.passwordInput.sendKeys(constants.passwordValid);
    await page.captcha.setValidCaptcha();
    expect<any>(await page.signupButton.isEnabled()).toBe(true);
    await page.signupButton.click();

    // added to stop intermittent error
    // "Failed: javascript error: document unloaded while waiting for result"
    await browser.wait(ExpectedConditions.urlContains('projects'), constants.conditionTimeout);

    // Verify new user logged in and redirected to projects page
    expect(await browser.getCurrentUrl()).toContain('/app/projects');
  });

  it('redirects to projects page if already logged in', async () => {
    await BellowsLoginPage.logout();
    await loginPage.loginAsUser();
    await SignupPage.get();
    await browser.wait(ExpectedConditions.urlContains('projects'), constants.conditionTimeout);
    expect(await browser.getCurrentUrl()).toContain('/app/projects');
  });
});
