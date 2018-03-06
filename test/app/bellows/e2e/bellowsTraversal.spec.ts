import {SfActivityPage} from '../pages/activityPage';
import {BellowsChangePasswordPage} from '../pages/changePasswordPage';
import {BellowsForgotPasswordPage} from '../pages/forgotPasswordPage';
import {BellowsLoginPage} from '../pages/loginPage';
import {BellowsProjectSettingsPage} from '../pages/projectSettingsPage';
import {ProjectsPage} from '../pages/projectsPage';
import {BellowsResetPasswordPage} from '../pages/resetPasswordPage';
import {SignupPage} from '../pages/signupPage';
import {SiteAdminPage} from '../pages/siteAdminPage';
import {SfUserProfilePage} from '../pages/userProfilePage';

describe('Bellows E2E Page Traversal', () => {
  const activityPage = new SfActivityPage();
  const changePasswordPage = new BellowsChangePasswordPage();
  const forgotPasswordPage = new BellowsForgotPasswordPage();
  const loginPage = new BellowsLoginPage();
  const projectSettingsPage = new BellowsProjectSettingsPage();
  const projectsPage = new ProjectsPage();
  const resetPasswordPage = new BellowsResetPasswordPage();
  const signupPage = new SignupPage();
  const siteAdminPage = new SiteAdminPage();
  const userProfilePage = new SfUserProfilePage();
  const constants = require('../../testConstants');

  it('Explore signup page' , () => {
    signupPage.get();
    signupPage.emailInput.clear();
    signupPage.nameInput.clear();
    signupPage.passwordInput.clear();
    signupPage.captcha.blueSquareButton.click();
    signupPage.captcha.yellowCircleButton.click();
    signupPage.captcha.redTriangleButton.click();
  });

  it('Explore forgot password page', () => {
    forgotPasswordPage.get();
    forgotPasswordPage.usernameInput.clear();
    forgotPasswordPage.submitButton.click();
  });

  it('Explore reset password page', () => {
    resetPasswordPage.get(constants.resetPasswordKey);
    resetPasswordPage.passwordInput.clear();
    resetPasswordPage.confirmPasswordInput.clear();
    resetPasswordPage.resetButton.click();
  });

  it('Explore login page', () => {
    loginPage.get();
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
