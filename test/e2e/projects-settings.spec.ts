import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ProjectsPage } from './pages/projects.page';
import { ProjectSettingsPage } from './pages/project-settings.page';


import { browser, ExpectedConditions } from 'protractor';

import {BellowsLoginPage} from './shared/login.page';
import {Utils} from './shared/utils';

test.describe('E2E Project Settings app', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();

  test('Normal user cannot access projectSettings to a project of which the user is a member', async ({ memberTab }) => {
    const projectsPage = new ProjectsPage(memberTab);
    await projectsPage.clickOnProject(constants.testProjectName);
    const projectSettingsPage = new ProjectSettingsPage(memberTab);
    await expect (projectSettingsPage.settingsMenuLink).not.toBeVisible();
  });

  test('System Admin can manage project', async ({ adminTab }) => {
    const projectSettingsPage = new ProjectSettingsPage(adminTab);
    await projectSettingsPage.goto(constants.testProjectName);
    await expect (projectSettingsPage.noticeList.count()).toBe(0);

    // Archive tab currently disabled
    /*
    managementPage.tabs.archive.click();
    expect(managementPage.archiveTab.archiveButton.isDisplayed()).toBe(true);
    expect(managementPage.archiveTab.archiveButton.isEnabled()).toBe(true);
    */
    await browser.wait(ExpectedConditions.visibilityOf(settingsPage.tabs.remove), constants.conditionTimeout);
    // await browser.actions().mouseMove(settingsPage.tabs.remove).click().perform();
    await settingsPage.tabs.remove.click();
    // await browser.wait(ExpectedConditions.visibilityOf(settingsPage.deleteTab.deleteButton), constants.conditionTimeout);
    expect<boolean>(await settingsPage.deleteTab.deleteButton.isDisplayed()).toBe(true);
    expect<boolean>(await settingsPage.deleteTab.deleteButton.isEnabled()).toBe(false);
  });

  test('confirm Manager is not owner of test project', async () => {
    await loginPage.loginAsManager();
    await settingsPage.get(constants.testProjectName);
    await settingsPage.tabs.project.click();
    expect<any>(await settingsPage.projectTab.projectOwner.isDisplayed()).toBe(true);
    expect(await settingsPage.projectTab.projectOwner.getText())
      .not.toContain(constants.managerUsername);
  });

  // Archive tab is a disabled/hidden feature
  /*
  xit('Manager cannot view archive tab if not owner', function () {
    expect(settingsPage.tabs.archive.isPresent()).toBe(false);
  });
  */

  test('Manager cannot view delete tab if not owner', async ({ managerTab }) => {
    expect<any>(await settingsPage.tabs.remove.isPresent()).toBe(false);
  });

  test('confirm Manager is owner of fourth project', async () => {
    await loginPage.loginAsManager();
    await settingsPage.get(constants.fourthProjectName);
    await settingsPage.tabs.project.click();
    expect<any>(await settingsPage.projectTab.projectOwner.isDisplayed()).toBe(true);
    expect(await settingsPage.projectTab.projectOwner.getText()).toContain(constants.managerUsername);
  });

  // For Jamaican Psalms, only system admins can delete projects.
  // Project Manager is an ordinary user, so this test is ignored for Jamaican Psalms
  test('Manager can delete if owner', async () => {
    if (!browser.baseUrl.startsWith('http://jamaicanpsalms') && !browser.baseUrl.startsWith('https://jamaicanpsalms')) {
      await loginPage.loginAsManager();
      await projectsPage.get();
      expect<any>(await projectsPage.projectsList.count()).toBe(4);
      await settingsPage.get(constants.fourthProjectName);
      expect<any>(await settingsPage.noticeList.count()).toBe(0);
      await settingsPage.tabs.remove.click();
      await browser.wait(ExpectedConditions.visibilityOf(settingsPage.deleteTab.deleteButton), constants.conditionTimeout);
      expect<any>(await settingsPage.deleteTab.deleteButton.isDisplayed()).toBe(true);
      expect<any>(await settingsPage.deleteTab.deleteButton.isEnabled()).toBe(false);
      await settingsPage.deleteTab.deleteBoxText.sendKeys('DELETE');
      expect<any>(await settingsPage.deleteTab.deleteButton.isEnabled()).toBe(true);
      await settingsPage.deleteTab.deleteButton.click();
      await Utils.clickModalButton('Delete');
      // await browser.wait(() => false, constants.conditionTimeout * 10);
      await projectsPage.get();
      expect<any>(await projectsPage.projectsList.count()).toBe(3);
    }
  });

  // Since Archive tab is now disabled, ignoring Archive / re-publish tests
  /*
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
  */

});
