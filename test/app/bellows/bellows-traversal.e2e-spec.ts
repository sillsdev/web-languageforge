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

  it('Explore signup page' , () => {
    BellowsLoginPage.logout();
    SignupPage.get();
    signupPage.emailInput.clear();
    signupPage.nameInput.clear();
    signupPage.passwordInput.clear();
    signupPage.captcha.blueSquareButton.click();
    signupPage.captcha.yellowCircleButton.click();
    signupPage.captcha.redTriangleButton.click();
  });

  it('Explore forgot password page', () => {
    BellowsForgotPasswordPage.get();
    forgotPasswordPage.usernameInput.clear();
    forgotPasswordPage.submitButton.click();
  });

  it('Explore reset password page', () => {
    BellowsResetPasswordPage.get(constants.resetPasswordKey);
    resetPasswordPage.passwordInput.clear();
    resetPasswordPage.confirmPasswordInput.clear();
    resetPasswordPage.resetButton.click();
  });

  it('Explore login page', () => {
    BellowsLoginPage.get();
    loginPage.loginAsAdmin();
  });

  it('Explore change password page', () => {
    changePasswordPage.get();
    changePasswordPage.password.clear();
    changePasswordPage.confirm.clear();
    changePasswordPage.submitButton.click();
  });

  it('Explore activity page', () => {
    activityPage.get();
    activityPage.activitiesList.count();
  });

  it('Explore project page', () => {
    projectsPage.get();
    projectsPage.projectsList.count();
    projectsPage.projectNames.count();
    projectsPage.projectTypes.count();
    projectsPage.createBtn.click();
  });

  it('Explore site admin page', () => {
    siteAdminPage.get();
    siteAdminPage.tabs.archivedProjects.click();
    siteAdminPage.archivedProjectsTab.republishButton.click();
    siteAdminPage.archivedProjectsTab.deleteButton.click();
    siteAdminPage.archivedProjectsTab.projectsList.count();
  });

  it('Explore user profile page', () => {
    userProfilePage.get();
    userProfilePage.activitiesList.count();
    userProfilePage.tabs.aboutMe.click();
    userProfilePage.tabs.myAccount.click();
  });
});
