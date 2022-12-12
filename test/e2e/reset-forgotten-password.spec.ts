import { test } from './utils/fixtures';
import { SignupPage } from './pages/signup.page';
import { ProjectsPage } from './pages/projects.page';
import { LoginPage } from './pages/login.page';
import { ForgotPasswordPage } from './pages/forgot-password.page';
import { expect } from '@playwright/test';
import { ResetPasswordPage } from './pages/reset-password.page';

test.describe('Reset forgotten password', () => {

  test('User can reset password', async ({ anonTab, userService }) => {
    const time = Date.now();
    const user = {
      name: `Reset password user - ${time}`,
      email: `rest.password.user.${time}@example.com`,
      password: `Reset password user`,
      newPassword: `Reset password user (new)`,
    };

    const loginPage = await test.step('Create new account and sign out', async () => {
      const signupPage = await new SignupPage(anonTab).goto();

      await signupPage.nameInput.fill(user.name);
      await signupPage.emailInput.fill(user.email);
      await signupPage.passwordInput.fill(user.password);
      await signupPage.captcha.setValidCaptcha();

      const [, projectPage] = await Promise.all([
        signupPage.signupButton.click(),
        new ProjectsPage(anonTab).waitForPage(),
      ]);

      await projectPage.header.userDropdownButton.click();

      const [, loginPage] = await Promise.all([
        projectPage.header.userDropdown.logout.click(),
        new LoginPage(anonTab).waitForPage(),
      ]);

      return loginPage;
    });

    await test.step('Request password reset email', async () => {
      const [, forgotPasswordPage] = await Promise.all([
        loginPage.forgotPasswordLink.click(),
        new ForgotPasswordPage(anonTab).waitForPage(),
      ]);

      await forgotPasswordPage.usernameOrEmailInput.type(user.email);
      await Promise.all([
        forgotPasswordPage.submitButton.click(),
        loginPage.waitForPage(),
      ]);

      await expect(loginPage.alertInfo).toContainText(`Password Reset email sent`);
      await expect(loginPage.alertInfo).toContainText(user.email);
    });

    await test.step('Reset password', async () => {
      const resetKey = await userService.getResetPasswordKey(user.email);
      const resetPasswordPage = await new ResetPasswordPage(anonTab, resetKey).goto({expectRedirect: true});
      await expect(resetPasswordPage.page.getByText('Please choose a new password')).toBeVisible();

      await resetPasswordPage.newPasswordField.type(user.newPassword);
      await resetPasswordPage.confirmPasswordField.type(user.newPassword);

      await Promise.all([
        resetPasswordPage.resetPasswordButton.click(),
        loginPage.waitForPage(),
      ]);

      await expect(loginPage.alertInfo).toContainText('Your password has been reset');
    });

    await test.step('Login with new password', async () => {
      await loginPage.usernameInput.type(user.email);
      await loginPage.passwordInput.type(user.newPassword);

      await Promise.all([
        loginPage.submitButton.click(),
        new ProjectsPage(anonTab).waitForPage(),
      ]);
    });
  });

  test('Can\'t reset password for non-existent account', async ({ anonTab }) => {
    const forgotPasswordPage = await new ForgotPasswordPage(anonTab).goto();
    await forgotPasswordPage.usernameOrEmailInput.type('nope I definitely do not exists hehe');
    await forgotPasswordPage.submitButton.click();
    await expect(forgotPasswordPage.errors).toContainText('User not found');
  });

  test('Can\'t use expired reset password link', async ({ anonTab, userService }) => {
    const user = await userService.createRandomUser();

    await test.step('Request password reset email', async () => {
      const loginPage = await new LoginPage(anonTab).goto();

      const [, forgotPasswordPage] = await Promise.all([
        loginPage.forgotPasswordLink.click(),
        new ForgotPasswordPage(anonTab).waitForPage(),
      ]);

      await forgotPasswordPage.usernameOrEmailInput.type(user.username);
      await Promise.all([
        forgotPasswordPage.submitButton.click(),
        loginPage.waitForPage(),
      ]);
    });

    const resetKey = await test.step('Expire reset password key', () => {
      return userService.expireAndGetResetPasswordKey(user.username);
    });

    await test.step('Try to use expired reset password key', async () => {
      const [, loginPage] = await Promise.all([
        new ResetPasswordPage(anonTab, resetKey).goto({expectRedirect: true}),
        new LoginPage(anonTab).waitForPage(),
      ])
      await expect(loginPage.errors).toContainText('Your password reset cannot be completed. It may have expired.');
    });
  });

});
