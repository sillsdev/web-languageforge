import 'jasmine';

import {SfActivityPage} from './shared/activity.page';
import {BellowsChangePasswordPage} from './shared/change-password.page';
import {BellowsForgotPasswordPage} from './shared/forgot-password.page';
import {BellowsLoginPage} from './shared/login.page';
import {ProjectsPage} from './shared/projects.page';
import {BellowsResetPasswordPage} from './shared/reset-password.page';
import {SignupPage} from './shared/signup.page';
import {SiteAdminPage} from './shared/site-admin.page';
import {SfUserProfilePage} from './shared/user-profile.page';

describe('Bellows E2E Page Traversal', () => {
  const constants = require('../testConstants.json');
  const activityPage = new SfActivityPage();
  const changePasswordPage = new BellowsChangePasswordPage();
  const forgotPasswordPage = new BellowsForgotPasswordPage();
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const resetPasswordPage = new BellowsResetPasswordPage();
  const signupPage = new SignupPage();
  const siteAdminPage = new SiteAdminPage();
  const userProfilePage = new SfUserProfilePage();

  it('Explore signup page' , async () => {
    await BellowsLoginPage.logout();
    await SignupPage.get();
    await signupPage.emailInput.clear();
    await signupPage.nameInput.clear();
    await signupPage.passwordInput.clear();
    await signupPage.captcha.blueSquareButton.click();
    await signupPage.captcha.yellowCircleButton.click();
    await signupPage.captcha.redTriangleButton.click();
  });

  it('Explore forgot password page', async () => {
    await BellowsForgotPasswordPage.get();
    await forgotPasswordPage.usernameInput.clear();
    await forgotPasswordPage.submitButton.click();
  });

  it('Explore reset password page', async () => {
    await BellowsResetPasswordPage.get(constants.resetPasswordKey);
    await resetPasswordPage.passwordInput.clear();
    await resetPasswordPage.confirmPasswordInput.clear();
    await resetPasswordPage.resetButton.click();
  });

  it('Explore login page', async () => {
    await BellowsLoginPage.get();
    await loginPage.loginAsAdmin();
  });

  it('Explore change password page', async () => {
    await changePasswordPage.get();
    await changePasswordPage.password.clear();
    await changePasswordPage.confirm.clear();
    await changePasswordPage.submitButton.click();
  });

  it('Explore activity page', async () => {
    await activityPage.get();
    await activityPage.activitiesList.count();
  });

  it('Explore project page', async () => {
    await projectsPage.get();
    await projectsPage.projectsList.count();
    await projectsPage.projectNames.count();
    await projectsPage.createBtn.click();
  });

  it('Explore site admin page', async () => {
    await siteAdminPage.get();
    await siteAdminPage.tabs.archivedProjects.click();
    await siteAdminPage.archivedProjectsTab.republishButton.click();
    await siteAdminPage.archivedProjectsTab.deleteButton.click();
    await siteAdminPage.archivedProjectsTab.projectsList.count();
  });

  it('Explore user profile page', async () => {
    await userProfilePage.get();
    await userProfilePage.activitiesList.count();
    await userProfilePage.tabs.aboutMe.click();
    await userProfilePage.tabs.myAccount.click();
  });
});
