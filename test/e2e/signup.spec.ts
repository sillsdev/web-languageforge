import { expect } from '@playwright/test';
import { users } from './constants';
import { ProjectsPage } from './pages/projects.page';
import { SignupPage } from './pages/signup.page';
import { test } from './utils/fixtures';

test.describe('Signup', () => {
  let signupPage: SignupPage;
  const validPassword = 'languageforge';
  const unusedName = 'Super amazing unused name';
  const unusedEmail = 'unused-email@valuable-but-unnoticed.com';

  test.beforeEach(async ({ tab }) => {
    signupPage = new SignupPage(tab);
  })

  test('Cannot submit if email is invalid', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(unusedName);
    await signupPage.emailInput.fill('email-without-at');
    await signupPage.passwordInput.fill(validPassword);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.emailInvalid).toBeVisible();
    await expect(signupPage.signupButton).toBeDisabled();
  });

  test('Cannot submit if password is weak', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(unusedName);
    await signupPage.emailInput.fill(unusedEmail);
    await signupPage.passwordInput.fill(validPassword);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.signupButton).toBeEnabled();
    const passwordTooShort = '123456';
    await signupPage.passwordInput.fill(passwordTooShort);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.passwordIsWeak).toBeVisible();
    await expect(signupPage.signupButton).not.toBeEnabled();
  });

  test('Can submit if the password is strong', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(unusedName);
    await signupPage.emailInput.fill(unusedEmail);
    await signupPage.passwordInput.fill(validPassword);
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.passwordIsWeak).not.toBeVisible();
    await expect(signupPage.signupButton).toBeEnabled();
  });

  test('Can submit if password is showing and not weak', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(unusedName);
    await signupPage.emailInput.fill(unusedEmail);
    await signupPage.passwordInput.fill(validPassword);
    await signupPage.showPassword.click();
    await signupPage.captcha.setInvalidCaptcha();
    await expect(signupPage.passwordIsWeak).not.toBeVisible();
    await expect(signupPage.signupButton).toBeEnabled();
  });

  test('Cannot submit if captcha not selected', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(unusedName);
    await signupPage.emailInput.fill(unusedEmail);
    await signupPage.passwordInput.fill(validPassword);
    await expect(signupPage.signupButton).toBeDisabled();
  });

  test('Captcha is invalid but user can still submit form', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(unusedName);
    await signupPage.emailInput.fill(unusedEmail);
    await signupPage.passwordInput.fill(validPassword);
    await signupPage.captcha.setInvalidCaptcha();
    await signupPage.signupButton.click();
    await expect(signupPage.captchaInvalid).toBeVisible();
  });

  test('Finds the admin user (case insensitive) already exists', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(unusedName);
    await signupPage.emailInput.fill(users.admin.email.toUpperCase());
    await signupPage.passwordInput.fill(validPassword);
    await signupPage.captcha.setValidCaptcha();
    await expect(signupPage.signupButton).toBeEnabled();
    await signupPage.signupButton.click();
    await expect(signupPage.emailTaken).toBeVisible();
  });

  test('Can prefill email address that can\'t be changed', async () => {
    await signupPage.goto({ email: unusedEmail });

    await expect(signupPage.emailInput).toBeDisabled();
  });

  test('Can prefill email address that already exists', async () => {
    await signupPage.goto({ email: users.admin.email });

    await signupPage.nameInput.fill(unusedName);
    await signupPage.passwordInput.fill(validPassword);
    await signupPage.captcha.setValidCaptcha();
    await signupPage.signupButton.click();
    await expect(signupPage.emailTaken).toBeVisible();
  });

  test('Can signup a new user', async () => {
    await signupPage.goto();

    await signupPage.nameInput.fill(unusedName);
    await signupPage.emailInput.fill(unusedEmail);
    await signupPage.passwordInput.fill(validPassword);
    await signupPage.captcha.setValidCaptcha();
    await expect(signupPage.signupButton).toBeEnabled();
    await signupPage.signupButton.click();

    // Verify new user logged in and redirected to projects page
    await new ProjectsPage(signupPage.page).waitFor();
  });

  test('Redirects to projects page if already logged in', async ({ memberTab }) => {
    const signupPageMember = new SignupPage(memberTab);
    await Promise.all([
      new ProjectsPage(memberTab).waitFor(),
      signupPageMember.goto(),
    ]);
  });
});
