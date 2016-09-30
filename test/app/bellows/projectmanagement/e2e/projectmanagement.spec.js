'use strict';

describe('E2E Project Management App', function () {
  var constants      = require('../../../testConstants.json');
  var util           = require('../../pages/util.js');
  var loginPage      = require('../../pages/loginPage.js');
  var projectsPage   = require('../../pages/projectsPage.js');
  var siteAdminPage  = require('../../pages/siteAdminPage.js');
  var managementPage = require('../../pages/projectManagementPage.js');

  it('Normal user cannot manage project of which the user is a member', function () {
    loginPage.loginAsMember();
    managementPage.get();
    expect(managementPage.noticeList.count()).toBe(1);
    expect(managementPage.noticeList.first().getText())
      .toContain('You don\'t have sufficient privileges.');
    managementPage.expectConsoleError();
    managementPage.firstNoticeCloseButton.click();
    expect(managementPage.noticeList.count()).toBe(0);
  });

  it('System Admin can manage project', function () {
    loginPage.loginAsAdmin();
    managementPage.get();
    expect(managementPage.noticeList.count()).toBe(0);
    // Archive tab currently disabled
    /*
    managementPage.tabs.archive.click();
    expect(managementPage.archiveTab.archiveButton.isDisplayed()).toBe(true);
    expect(managementPage.archiveTab.archiveButton.isEnabled()).toBe(true);
    */
    managementPage.tabs.remove.click();
    expect(managementPage.deleteTab.deleteButton.isDisplayed()).toBe(true);
    expect(managementPage.deleteTab.deleteButton.isEnabled()).toBe(false);
  });

  it('confirm Manager is not owner of test project', function () {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    managementPage.settings.button.click();
    managementPage.settings.projectSettingsLink.click();
    managementPage.settings.tabs.projectProperties.click();
    expect(managementPage.settings.projectPropertiesTab.projectOwner.isDisplayed()).toBe(true);
    expect(managementPage.settings.projectPropertiesTab.projectOwner.getText())
      .not.toContain(constants.managerUsername);
  });

  it('Manager cannot view archive tab if not owner', function () {
    managementPage.get();
    expect(managementPage.noticeList.count()).toBe(0);
    expect(managementPage.tabs.archive.isPresent()).toBe(false);
  });

  it('Manager cannot view delete tab if not owner', function () {
    managementPage.get();
    expect(managementPage.noticeList.count()).toBe(0);
    expect(managementPage.tabs.remove.isPresent()).toBe(false);
  });

  it('confirm Manager is owner of fourth project', function () {
    loginPage.loginAsManager();

    projectsPage.get();
    expect(projectsPage.projectsList.count()).toBe(4);
    projectsPage.clickOnProject(constants.fourthProjectName);
    managementPage.settings.button.click();
    managementPage.settings.projectSettingsLink.click();
    managementPage.settings.tabs.projectProperties.click();
    expect(managementPage.settings.projectPropertiesTab.projectOwner.isDisplayed()).toBe(true);
    expect(managementPage.settings.projectPropertiesTab.projectOwner.getText())
      .toContain(constants.managerUsername);
  });

  // For JP, only system admin's can delete projects.  Project Manager is an ordinary user, so this test is stubbed out for JP.
  it('Manager can delete if owner', function () {
    if (!browser.baseUrl.startsWith("https://jamaicanpsalms")) {
      managementPage.get();
      expect(managementPage.noticeList.count()).toBe(0);
      managementPage.tabs.remove.click();
      expect(managementPage.deleteTab.deleteButton.isDisplayed()).toBe(true);
      expect(managementPage.deleteTab.deleteButton.isEnabled()).toBe(false);
      managementPage.deleteTab.deleteBoxText.sendKeys("DELETE");
      expect(managementPage.deleteTab.deleteButton.isEnabled()).toBe(true);
      managementPage.deleteTab.deleteButton.click();
      util.clickModalButton('Delete');
      projectsPage.get();
      expect(projectsPage.projectsList.count()).toBe(3);
    }
  });

  // Since Archive tab is now disabled, ignoring Archive / re-publish tests
  xit('Manager can archive if owner', function () {
    managementPage.get();
    expect(managementPage.noticeList.count()).toBe(0);
    managementPage.tabs.archive.click();
    expect(managementPage.archiveTab.archiveButton.isDisplayed()).toBe(true);
    expect(managementPage.archiveTab.archiveButton.isEnabled()).toBe(true);
    managementPage.archiveTab.archiveButton.click();
    util.clickModalButton('Archive');
    expect(projectsPage.projectsList.count()).toBe(2);
  });

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
  });

  xit('System Admin can archive', function () {
    managementPage.get();
    expect(managementPage.noticeList.count()).toBe(0);
    managementPage.tabs.archive.click();
    expect(managementPage.archiveTab.archiveButton.isDisplayed()).toBe(true);
    expect(managementPage.archiveTab.archiveButton.isEnabled()).toBe(true);
    managementPage.archiveTab.archiveButton.click();
    util.clickModalButton('Archive');
    expect(projectsPage.projectsList.count()).toBe(2);
  });

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
  });

});
