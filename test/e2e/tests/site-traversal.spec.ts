import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { ChangePasswordPage, ForgotPasswordPage, LoginPage, ProjectsPage, SignupPage, SiteAdminPage, UserProfilePage } from '../pages';

/**
 * page traversal without testing functionality
 */
test.describe('Page Traversal', () => {

  test('Explore signup page', async ({ tab }) => {
    const signupPage = await SignupPage.goto(tab);

    await signupPage.emailInput.fill('');
    await signupPage.nameInput.fill('');
    await signupPage.passwordInput.fill('');
    await signupPage.captcha.blueSquareButton.click();
    await signupPage.captcha.yellowCircleButton.click();
    await signupPage.captcha.redTriangleButton.click();
  });

  test('Explore forgot password page', async ({ tab }) => {
    const forgotPasswordPage = await ForgotPasswordPage.goto(tab);

    await forgotPasswordPage.usernameOrEmailInput.fill('');
    await forgotPasswordPage.submitButton.click();
  });

  test('Explore login page', async ({ tab }) => {
    const loginPage = await LoginPage.goto(tab);

    await loginPage.usernameInput.type('');
    await loginPage.passwordInput.type('');
    await loginPage.submitButton.click();
  });

  test('Explore change passsword page (admin)', async ({ adminTab }) => {
    const changePasswordPage = await ChangePasswordPage.goto(adminTab);

    await changePasswordPage.passwordInput.type('');
    await changePasswordPage.confirmInput.type('');
    await expect(changePasswordPage.submitButton).toBeDisabled();
  });

  test('Explore project page (admin)', async ({ adminTab }) => {
    const projectsPage = await ProjectsPage.goto(adminTab);

    await projectsPage.projectsList.count();
    await projectsPage.projectNames.count();
    await projectsPage.createButton.click();
  });

  test('Explore site admin page', async ({ adminTab }) => {
    const siteAdminPage = await SiteAdminPage.goto(adminTab);

    await siteAdminPage.tabs.archivedProjects.click();
    await expect(siteAdminPage.archivedProjectsTab.republishButton).toBeDisabled();
    await expect(siteAdminPage.archivedProjectsTab.deleteButton).toBeDisabled();
    await siteAdminPage.archivedProjectsTab.projectsList.count();
  });

  test('Explore user profile page (admin)', async ({ adminTab }) => {
    const userProfilePage = await UserProfilePage.goto(adminTab);

    await userProfilePage.activitiesList.count();
    await userProfilePage.tabs.aboutMe.click();
    await userProfilePage.tabs.myAccount.click();
  });

});
