import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ChangePasswordPage } from './pages/change-password.page';
import { changePassword } from './utils/testSetup';
import { LoginPage } from './pages/login.page';
import { PageHeader } from './components/page-header.component';

test.describe('E2E Change Password app', () => {
  const newPassword = '12345678';
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
    await expect (changePasswordPage.submitButton).toBeDisabled();
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
    await expect (changePasswordPage.submitButton).toBeDisabled();
  });

  test('Can successfully change user\'s password after form submission', async ({ page, member }) => {
    await changePasswordPage.passwordInput.fill(newPassword);
    await changePasswordPage.confirmInput.fill(newPassword);
    await expect (changePasswordPage.passwordMatchImage).toBeVisible();
    await expect (changePasswordPage.submitButton).toBeEnabled();
    await changePasswordPage.submitButton.click();
    // when password is changed successfully, a notice appears on the page
    const messageSuccessfulUpdate = '[data-ng-bind-html="notice.message"] >> text=Password updated successfully';
    await changePasswordPage.page.waitForSelector(messageSuccessfulUpdate, {strict: false, state: 'attached'});
    expect (await changePasswordPage.noticeList.locator(messageSuccessfulUpdate).count()
    ).toBeGreaterThan(0);

    // test login with new password

    // await logout(memberTab); // CANNOT do this as it invalidates the session stored in storageState.json! - 2022-03 RM
    // await login(memberTab, memberTab.username, newPassword);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(member.username, newPassword);
    const pageHeader = new PageHeader(page);
    await expect(pageHeader.myProjects.button).toBeVisible(); // TODO: is flaky, fix it
  });

});
