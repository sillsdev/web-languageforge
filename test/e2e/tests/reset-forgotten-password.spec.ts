import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { ForgotPasswordPage, LoginPage, ProjectsPage, ResetPasswordPage, SignupPage } from '../pages';

test.describe('Reset forgotten password', () => {

  test('User can reset password', async ({ tab, userService }) => {
    const time = Date.now();
    const user = {
      name: `Reset password user - ${time}`,
      email: `rest.password.user.${time}@example.com`,
      password: `Reset password user`,
      newPassword: `Reset password user (new)`,
    };

    const loginPage = await test.step('Create new account and sign out', async () => {
      const signupPage = await new SignupPage(tab).goto();

      await signupPage.nameInput.fill(user.name);
      await signupPage.emailInput.fill(user.email);
      await signupPage.passwordInput.fill(user.password);
      await signupPage.captcha.setValidCaptcha();

      const [, projectPage] = await Promise.all([
        signupPage.signupButton.click(),
        new ProjectsPage(tab).waitFor(),
      ]);

      await projectPage.header.userDropdownButton.click();

      const [, loginPage] = await Promise.all([
        projectPage.header.userDropdown.logout.click(),
        new LoginPage(tab).waitFor(),
      ]);

      return loginPage;
    });

    await test.step('Request password reset email', async () => {
      const [, forgotPasswordPage] = await Promise.all([
        loginPage.forgotPasswordLink.click(),
        new ForgotPasswordPage(tab).waitFor(),
      ]);

      await forgotPasswordPage.usernameOrEmailInput.type(user.email);
      await Promise.all([
        forgotPasswordPage.submitButton.click(),
        loginPage.waitFor(),
      ]);

      await expect(loginPage.alertInfo).toContainText(`Password Reset email sent`);
      await expect(loginPage.alertInfo).toContainText(user.email);
    });

    await test.step('Reset password', async () => {
      const resetKey = await userService.getResetPasswordKey(user.email);
      const resetPasswordPage = await new ResetPasswordPage(tab, resetKey).goto({ expectRedirect: true });
      await expect(resetPasswordPage.page.getByText('Please choose a new password')).toBeVisible();

      await resetPasswordPage.newPasswordField.type(user.newPassword);
      await resetPasswordPage.confirmPasswordField.type(user.newPassword);

      await Promise.all([
        resetPasswordPage.resetPasswordButton.click(),
        loginPage.waitFor(),
      ]);

      await expect(loginPage.alertInfo).toContainText('Your password has been reset');
    });

    await test.step('Login with new password', async () => {
      await loginPage.usernameInput.type(user.email);
      await loginPage.passwordInput.type(user.newPassword);

      await Promise.all([
        loginPage.submitButton.click(),
        new ProjectsPage(tab).waitFor(),
      ]);
    });
  });

  test('Can\'t reset password for non-existent account', async ({ tab }) => {
    const forgotPasswordPage = await new ForgotPasswordPage(tab).goto();
    await forgotPasswordPage.usernameOrEmailInput.type('nope I definitely do not exists hehe');
    await forgotPasswordPage.submitButton.click();
    await expect(forgotPasswordPage.errors).toContainText('User not found');
  });

  test('Can\'t use expired reset password link', async ({ tab, userService }) => {
    const user = await userService.createRandomUser();

    await test.step('Request password reset email', async () => {
      const loginPage = await new LoginPage(tab).goto();

      const [, forgotPasswordPage] = await Promise.all([
        loginPage.forgotPasswordLink.click(),
        new ForgotPasswordPage(tab).waitFor(),
      ]);

      await forgotPasswordPage.usernameOrEmailInput.type(user.username);
      await Promise.all([
        forgotPasswordPage.submitButton.click(),
        loginPage.waitFor(),
      ]);
    });

    const resetKey = await test.step('Expire reset password key', () => {
      return userService.expireAndGetResetPasswordKey(user.username);
    });

    await test.step('Try to use expired reset password key', async () => {
      const [, loginPage] = await Promise.all([
        new ResetPasswordPage(tab, resetKey).goto({ expectRedirect: true }),
        new LoginPage(tab).waitFor(),
      ])
      await expect(loginPage.errors).toContainText('Your password reset cannot be completed. It may have expired.');
    });
  });

});
