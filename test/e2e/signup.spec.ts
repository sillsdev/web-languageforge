import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { SignupPage } from './pages/signup.page';

test.describe('E2E Signup app', () => {
  const constants = require('./testConstants.json');
  let signupPage: SignupPage;

  test.beforeAll(async ({ anonTab }) => {
    signupPage = new SignupPage(anonTab);
  })

  // this name is not very descriptive
  test('Can verify required information filled', async () => {
    await signupPage.goto();

    await expect(signupPage.signupButton).toBeDisabled();
    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.unusedEmail);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.signupButton).toBeEnabled();
  });

  test('Cannot submit if email is invalid', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.emailNoAt);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.emailInvalid).toBeVisible();
    await expect(signupPage.signupButton).toBeDisabled();
  });

  test('Cannot submit if password is weak', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.unusedEmail);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.signupButton).toBeEnabled();
    await signupPage.passwordInput.fill(constants.passwordTooShort);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.passwordIsWeak).toBeVisible();
    await expect(signupPage.signupButton).not.toBeEnabled();
  });

  test('Can submit if password not weak', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.unusedEmail);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.passwordIsWeak).not.toBeVisible();
    await expect(signupPage.signupButton).toBeEnabled();
  });

  test('Can submit if password is showing and not weak', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.unusedEmail);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.showPassword.click();
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.passwordIsWeak).not.toBeVisible();
    await expect(signupPage.signupButton).toBeEnabled();
  });

  test('Cannot submit if captcha not selected', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.unusedEmail);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await expect(signupPage.signupButton).toBeDisabled();
  });

  // name is not good
  // suggested name: invalid captcha allows submit but then displays error
  test('Can submit a user registration request and captcha is invalid', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.unusedEmail);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.captcha.setInvalidCaptcha();
    await signupPage.signupButton.click();
    await expect(signupPage.captchaInvalid).toBeVisible();
  });

  test('Finds the admin user (case insensitive) already exists', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.adminEmail.toUpperCase());
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.captcha.setValidCaptcha();
    await expect(signupPage.signupButton).toBeEnabled();
    await signupPage.signupButton.click();
    await expect(signupPage.emailTaken).toBeVisible();
  });

  test('Can prefill email address that can\'t be changed', async () => {
    await signupPage.goto(constants.unusedEmail);

    await expect(signupPage.emailInput).toBeDisabled();
  });

  test('Can prefill email address that already exists', async () => {
    await signupPage.goto(constants.adminEmail);

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.captcha.setValidCaptcha();
    await signupPage.signupButton.click();
    await expect(signupPage.emailTaken).toBeVisible();
  });

  test('Can signup a new user', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(constants.unusedName);
    await signupPage.emailInput.fill(constants.unusedEmail);
    await signupPage.passwordInput.fill(constants.passwordValid);
    await signupPage.captcha.setValidCaptcha();
    await expect(signupPage.signupButton).toBeEnabled();
    await signupPage.signupButton.click();

    // Verify new user logged in and redirected to projects page
    await signupPage.page.waitForNavigation({waitUntil: "networkidle"});
    expect(signupPage.page.url()).toContain('/app/projects');
  });

  test('Redirects to projects page if already logged in', async ({ memberTab }) => {
    const signupPage = new SignupPage(memberTab);
    await signupPage.gotoExpectRedirect('/app/projects');
  });
});
