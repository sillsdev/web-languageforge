import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ForgotPasswordPage } from './pages/forgot-password.page';
import { SignupPage } from './pages/signup.page';
import { LoginPage } from './pages/login.page';
import { ChangePasswordPage } from './pages/change-password.page';
import { ActivityPage } from './pages/activity.page';
import { ProjectsPage } from './pages/projects.page';
import { SiteAdminPage } from './pages/site-admin.page';
import { UserProfilePage } from './pages/user-profile.page';

/**
 * page traversal without testing functionality
 */
test.describe('E2E Page Traversal', () => {
  // let signupPage: SignupPage;
  // let forgotPasswordPage: ForgotPasswordPage;
  // let loginPage: LoginPage;
  let changePasswordPage: ChangePasswordPage;
  let activityPage: ActivityPage;
  let projectsPage: ProjectsPage;
  let siteAdminPage: SiteAdminPage;
  let userProfilePage: UserProfilePage;

  test.beforeAll(async ({ adminTab }) => {
    // signupPage = new SignupPage(adminTab);
    // forgotPasswordPage = new ForgotPasswordPage(adminTab);
    // loginPage = new LoginPage(adminTab);
    changePasswordPage = new ChangePasswordPage(adminTab);
    activityPage = new ActivityPage(adminTab);
    projectsPage = new ProjectsPage(adminTab);
    siteAdminPage = new SiteAdminPage(adminTab);
    userProfilePage = new UserProfilePage(adminTab);
  })

  test('Explore signup page', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await signupPage.emailInput.fill('');
    await signupPage.nameInput.fill('');
    await signupPage.passwordInput.fill('');
    await signupPage.captcha.blueSquareButton.click();
    await signupPage.captcha.yellowCircleButton.click();
    await signupPage.captcha.redTriangleButton.click();
  });

  test('Explore forgot password page', async ({ page }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();

    await forgotPasswordPage.usernameInput.fill('');
    await forgotPasswordPage.submitButton.click();
  });

  test('Explore login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.usernameInput.type('');
    await loginPage.passwordInput.type('');
    await loginPage.submitButton.click();
  });

  test('Explore change passsword page (admin)', async () => {
    await changePasswordPage.goto();

    await changePasswordPage.passwordInput.type('');
    await changePasswordPage.confirmInput.type('');
    await expect(changePasswordPage.submitButton).toBeDisabled();
  });

  test('Explore activity page (admin)', async () => {
    await activityPage.goto();

    await activityPage.activitiesList.count();
  });

  test('Explore project page (admin)', async () => {
    await projectsPage.goto();

    await projectsPage.projectsList.count();
    await projectsPage.projectNames.count();
    await projectsPage.createButton.click();
  });

  test('Explore site admin page', async () => {
    await siteAdminPage.goto();

    await siteAdminPage.tabs.archivedProjects.click();
    await expect(siteAdminPage.archivedProjectsTab.republishButton).toBeDisabled();
    await expect(siteAdminPage.archivedProjectsTab.deleteButton).toBeDisabled();
    await siteAdminPage.archivedProjectsTab.projectsList.count();
  });

  test('Explore user profile page (admin)', async () => {
    await userProfilePage.goto();

    await userProfilePage.activitiesList.count();
    await userProfilePage.tabs.aboutMe.click();
    await userProfilePage.tabs.myAccount.click();
  });

});
