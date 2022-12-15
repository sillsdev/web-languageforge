import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ChangePasswordPage } from './pages/change-password.page';
import { login, logout } from './utils';

test.describe('Change Password', () => {
  const newPassword = '12345678';

  test('Password rules', async ({userService, page}) => {
    const changePasswordPage = await test.step('Login as new user', async () => {
      const user = await userService.createRandomUser();
      expect(user.password).not.toBe(newPassword);
      await login(page, user);
      return new ChangePasswordPage(page).goto();
    });

    await test.step('Refuses to allow form submission if the confirm input does not match', async () => {
      await changePasswordPage.passwordInput.fill(newPassword);
      await changePasswordPage.confirmInput.fill('blah12345');
      await expect(changePasswordPage.submitButton).toBeDisabled();
    });

    await test.step('Allows form submission if the confirm input matches', async () => {
      await changePasswordPage.passwordInput.fill(newPassword);
      await changePasswordPage.confirmInput.fill(newPassword);
      await expect(changePasswordPage.submitButton).toBeEnabled();
    });

    await test.step('Should not allow a password less than 7 characters', async () => {
      let shortPassword = '12345';
      await changePasswordPage.passwordInput.fill(shortPassword);
      await changePasswordPage.confirmInput.fill(shortPassword);
      await expect(changePasswordPage.submitButton).toBeDisabled();
    });
  });

  test('Can successfully change user\'s password after form submission', async ({ page, userService }) => {
    const user = await test.step('Login as new user', async () => {
      const user = await userService.createRandomUser();
      expect(user.password).not.toBe(newPassword);
      await login(page, user);
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
      await login(page, {
        ...user,
        password: newPassword,
      });
    });
  });

});
