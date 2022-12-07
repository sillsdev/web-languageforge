import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ChangePasswordPage } from './pages/change-password.page';
import { changePassword } from './utils/testSetup';
import { login, logout } from './utils/login';

test.describe('E2E Change Password app', () => {
  const newPassword = '12345678';

  test.describe('Password rules', () => {
    let changePasswordPage: ChangePasswordPage;

    test.beforeAll(async ({ memberTab }) => {
      changePasswordPage = new ChangePasswordPage(memberTab);
      await changePasswordPage.goto();
    });

    test.afterAll(async ({ member, request }) => {
      // reset password back to original
      await changePassword(request, member.username, member.password);
    });

    test('Refuses to allow form submission if the confirm input does not match', async () => {
      await changePasswordPage.passwordInput.fill(newPassword);
      await changePasswordPage.confirmInput.fill('blah12345');
      await expect(changePasswordPage.submitButton).toBeDisabled();
    });

    test('Allows form submission if the confirm input matches', async () => {
      await changePasswordPage.passwordInput.fill(newPassword);
      await changePasswordPage.confirmInput.fill(newPassword);
      await expect(changePasswordPage.submitButton).toBeEnabled();
    });

    test('Should not allow a password less than 7 characters', async () => {
      let shortPassword = '12345';
      await changePasswordPage.passwordInput.fill(shortPassword);
      await changePasswordPage.confirmInput.fill(shortPassword);
      await expect(changePasswordPage.submitButton).toBeDisabled();
    });
  });

  test('Can successfully change user\'s password after form submission', async ({ page, member, userService }) => {
    const user = await test.step('Login as new user', async () => {
      const user = await userService.createRandomUser();
      expect(user.password).not.toBe(newPassword);
      await login(page, user.username, user.password);
      return user;
    });

    await test.step('Change password and logout', async () => {
      const changePasswordPage = await new ChangePasswordPage(page).goto();
      await changePasswordPage.passwordInput.fill(newPassword);
      await changePasswordPage.confirmInput.fill(newPassword);
      await expect(changePasswordPage.passwordMatchImage).toBeVisible();
      await expect(changePasswordPage.submitButton).toBeEnabled();
      await changePasswordPage.submitButton.click();
      const messageSuccessfulUpdate = '[data-ng-bind-html="notice.message"] >> text=Password updated successfully';
      await changePasswordPage.page.waitForSelector(messageSuccessfulUpdate, { strict: false, state: 'attached' });
    });

    await test.step('Logout and login with new password', async () => {
      await logout(page);
      await login(page, user.username, newPassword);
    });
  });

});
