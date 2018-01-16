'use strict';

describe('Bellows E2E Page Traversal', function () {
  // Better way to import all files from directory, might want node module like require-all?
  var activityPage        = require('../pages/activityPage.js');
  var changePasswordPage  = require('../pages/changePasswordPage.js');
  var forgotPasswordPage  = require('../pages/forgotPasswordPage.js');
  var loginPage           = require('../pages/loginPage.js');
  var projectSettingsPage = require('../pages/projectSettingsPage.js');
  var projectsPage        = require('../pages/projectsPage.js');
  var resetPasswordPage   = require('../pages/resetPasswordPage.js');
  var signupPage          = require('../pages/signupPage.js');
  var siteAdminPage       = require('../pages/siteAdminPage.js');
  var userProfilePage     = require('../pages/userProfilePage.js');
  var constants           = require('../../testConstants.json');

  it('Explore signup page' , function () {
    signupPage.get();
    signupPage.emailInput.clear();
    signupPage.nameInput.clear();
    signupPage.passwordInput.clear();
    signupPage.captcha.blueSquareButton.click();
    signupPage.captcha.yellowCircleButton.click();
    signupPage.captcha.redTriangleButton.click();
  });

  it('Explore forgot password page', function () {
    forgotPasswordPage.get();
    forgotPasswordPage.usernameInput.clear();
    forgotPasswordPage.submitButton.click();
  });

  it('Explore reset password page', function () {
    resetPasswordPage.get(constants.resetPasswordKey);
    resetPasswordPage.passwordInput.clear();
    resetPasswordPage.confirmPasswordInput.clear();
    resetPasswordPage.resetButton.click();
  });

  it('Explore login page', function () {
    loginPage.get();
    loginPage.loginAsAdmin();
  });

  it('Explore change password page', function () {
    changePasswordPage.get();
    changePasswordPage.password.clear();
    changePasswordPage.confirm.clear();
    changePasswordPage.submitButton.click();
  });

  it('Explore activity page', function () {
    activityPage.get();
    activityPage.activitiesList.count();
  });

  it('Explore project page', function () {
    projectsPage.get();
    projectsPage.projectsList.count();
    projectsPage.projectNames.count();
    projectsPage.projectTypes.count();
    projectsPage.createBtn.click();
  });

  // TODO Not sure if we want to test project settings since they seem quite different in lf and sf
  xit('Explore project settings page', function () {
    projectSettingsPage.get(constants.testProjectName);
    projectSettingsPage.noticeList.count();
    projectSettingsPage.tabDivs.count();
    projectSettingsPage.tabs.project.click();
    projectSettingsPage.tabs.remove.click();
  });

  it('Explore site admin page', function() {
    siteAdminPage.get();
    siteAdminPage.tabs.archivedProjects.click();
    siteAdminPage.archivedProjectsTab.republishButton.click();
    siteAdminPage.archivedProjectsTab.deleteButton.click();
    siteAdminPage.archivedProjectsTab.projectsList.count();
  });

  it('Explore user profile page', function () {
    userProfilePage.get();
    userProfilePage.activitiesList.count();
    userProfilePage.tabs.aboutMe.click();
    userProfilePage.tabs.myAccount.click();
  });

  // TODO this seems to be a lf specific view
  xit('Explore user management page', function() {
    userManagementPage.get();
    // TODO click on things
  });
});
