'use strict';

describe('Bellows E2E Project Settings App', function () {
  var constants      = require('../../../testConstants.json');
  var util           = require('../../pages/util.js');
  var loginPage      = require('../../pages/loginPage.js');
  var projectsPage   = require('../../pages/projectsPage.js');
  var siteAdminPage  = require('../../pages/siteAdminPage.js');
  var settingsPage = require('../../pages/projectSettingsPage.js');

  it('Normal user cannot access projectSettings to a project of which the user is a member',
    function () {
    loginPage.loginAsMember();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect(settingsPage.settingsMenuLink.isDisplayed()).toBe(false);
  });

  it('System Admin can manage project', function () {
    loginPage.loginAsAdmin();
    settingsPage.get(constants.testProjectName);
    expect(settingsPage.noticeList.count()).toBe(0);

    // Archive tab currently disabled
    /*
    managementPage.tabs.archive.click();
    expect(managementPage.archiveTab.archiveButton.isDisplayed()).toBe(true);
    expect(managementPage.archiveTab.archiveButton.isEnabled()).toBe(true);
    */
    settingsPage.tabs.remove.click();
    expect(settingsPage.deleteTab.deleteButton.isDisplayed()).toBe(true);
    expect(settingsPage.deleteTab.deleteButton.isEnabled()).toBe(false);
  });

  it('confirm Manager is not owner of test project', function () {
    loginPage.loginAsManager();
    settingsPage.get(constants.testProjectName);
    settingsPage.tabs.project.click();
    expect(settingsPage.projectTab.projectOwner.isDisplayed()).toBe(true);
    expect(settingsPage.projectTab.projectOwner.getText())
      .not.toContain(constants.managerUsername);
  });

  it('Manager cannot view archive tab if not owner', function () {
    expect(settingsPage.tabs.archive.isPresent()).toBe(false);
  });

  it('Manager cannot view delete tab if not owner', function () {
    expect(settingsPage.tabs.remove.isPresent()).toBe(false);
  });

  it('confirm Manager is owner of fourth project', function () {
    loginPage.loginAsManager();
    settingsPage.get(constants.fourthProjectName);
    settingsPage.tabs.project.click();
    expect(settingsPage.projectTab.projectOwner.isDisplayed()).toBe(true);
    expect(settingsPage.projectTab.projectOwner.getText())
      .toContain(constants.managerUsername);
  });

  // For Jamaican Psalms, only system admins can delete projects.
  // Project Manager is an ordinary user, so this test is ignored for Jamaican Psalms
  it('Manager can delete if owner', function () {
    if (!browser.baseUrl.startsWith('http://jamaicanpsalms') &&
      !browser.baseUrl.startsWith('https://jamaicanpsalms')
  ) {
      loginPage.loginAsManager();
      settingsPage.get(constants.fourthProjectName);
      expect(settingsPage.noticeList.count()).toBe(0);
      settingsPage.tabs.remove.click();
      expect(settingsPage.deleteTab.deleteButton.isDisplayed()).toBe(true);
      expect(settingsPage.deleteTab.deleteButton.isEnabled()).toBe(false);
      settingsPage.deleteTab.deleteBoxText.sendKeys('DELETE');
      expect(settingsPage.deleteTab.deleteButton.isEnabled()).toBe(true);
      settingsPage.deleteTab.deleteButton.click();
      util.clickModalButton('Delete');
      projectsPage.get();
      expect(projectsPage.projectsList.count()).toBe(3);
    }
  });

  // Since Archive tab is now disabled, ignoring Archive / re-publish tests
  xit('Manager can archive if owner', function () {
    loginPage.loginAsManager();
    settingsPage.get(constants.testProjectName);
    expect(settingsPage.noticeList.count()).toBe(0);
    settingsPage.tabs.archive.click();
    expect(settingsPage.archiveTab.archiveButton.isDisplayed()).toBe(true);
    expect(settingsPage.archiveTab.archiveButton.isEnabled()).toBe(true);
    settingsPage.archiveTab.archiveButton.click();
    util.clickModalButton('Archive');
    expect(projectsPage.projectsList.count()).toBe(2);
  }).pend('Archive tab is currently disabled');

  xit('System Admin can re-publish project', function () {
    loginPage.loginAsAdmin();
    siteAdminPage.get();
    siteAdminPage.tabs.archivedProjects.click();
    expect(siteAdminPage.tabs.archivedProjects.republishButton.isDisplayed()).toBe(true);
    expect(siteAdminPage.tabs.archivedProjects.republishButton.isEnabled()).toBe(false);
    expect(siteAdminPage.tabs.archivedProjects.deleteButton.isDisplayed()).toBe(true);
    expect(siteAdminPage.tabs.archivedProjects.deleteButton.isEnabled()).toBe(false);
    expect(siteAdminPage.tabs.archivedProjects.projectsList.count()).toBe(1);
    siteAdminPage.tabs.archivedProjects.setCheckbox(0, true);
    expect(siteAdminPage.tabs.archivedProjects.republishButton.isEnabled()).toBe(true);
    expect(siteAdminPage.tabs.archivedProjects.deleteButton.isEnabled()).toBe(true);
    siteAdminPage.tabs.archivedProjects.republishButton.click();
    projectsPage.get();
    expect(projectsPage.projectsList.count()).toBe(3);
  }).pend('Archive tab is currently disabled');

  xit('System Admin can archive', function () {
    loginPage.loginAsAdmin();
    settingsPage.get(constants.testProjectName);
    expect(settingsPage.noticeList.count()).toBe(0);
    settingsPage.tabs.archive.click();
    expect(settingsPage.archiveTab.archiveButton.isDisplayed()).toBe(true);
    expect(settingsPage.archiveTab.archiveButton.isEnabled()).toBe(true);
    settingsPage.archiveTab.archiveButton.click();
    util.clickModalButton('Archive');
    expect(projectsPage.projectsList.count()).toBe(2);
  }).pend('Archive tab is currently disabled');

  xit('System Admin can re-publish project', function () {
    siteAdminPage.get();
    siteAdminPage.tabs.archivedProjects.click();
    expect(siteAdminPage.tabs.archivedProjects.republishButton.isDisplayed()).toBe(true);
    expect(siteAdminPage.tabs.archivedProjects.republishButton.isEnabled()).toBe(false);
    expect(siteAdminPage.tabs.archivedProjects.deleteButton.isDisplayed()).toBe(true);
    expect(siteAdminPage.tabs.archivedProjects.deleteButton.isEnabled()).toBe(false);
    expect(siteAdminPage.tabs.archivedProjects.projectsList.count()).toBe(1);
    siteAdminPage.tabs.archivedProjects.setCheckbox(0, true);
    expect(siteAdminPage.tabs.archivedProjects.republishButton.isEnabled()).toBe(true);
    expect(siteAdminPage.tabs.archivedProjects.deleteButton.isEnabled()).toBe(true);
    siteAdminPage.tabs.archivedProjects.republishButton.click();
    projectsPage.get();
    expect(projectsPage.projectsList.count()).toBe(3);
  }).pend('Archive tab is currently disabled');

});
