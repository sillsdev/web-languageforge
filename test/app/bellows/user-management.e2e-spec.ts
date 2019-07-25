import {by, element, browser, ExpectedConditions} from 'protractor';
import {ElementFinder} from 'protractor/built/element';

import {BellowsLoginPage} from './shared/login.page';
import {ProjectsPage} from './shared/projects.page';
import {UserManagementPage} from './shared/user-management.page';
import { Utils } from './shared/utils';

describe('Bellows E2E User Management App', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const userManagementPage = new UserManagementPage();

  it('Can add admin as Tech Support', () => {
    // Remove admin from Other Project for Testing
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.removeUserFromProject(constants.otherProjectName, constants.adminUsername);

    loginPage.loginAsAdmin();
    projectsPage.get();

    // Click "+ Tech Support" button
    projectsPage.findProject(constants.otherProjectName).then((projectRow: ElementFinder) => {
      projectRow.element(by.id('techSupportButton')).click();
    });

    // Assert admin is Tech Support
    projectsPage.clickOnProject(constants.otherProjectName);
    browser.wait(ExpectedConditions.visibilityOf(projectsPage.settingsBtn), Utils.conditionTimeout);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    browser.wait(ExpectedConditions.visibilityOf(userManagementPage.usersList.first()), Utils.conditionTimeout);

    userManagementPage.getUserRow(constants.adminUsername).then( (row: ElementFinder) => {
      expect<any>(row.element(by.id('admin-role-select')).isDisplayed()).toBe(true);
      expect<any>(row.element(by.id('admin-role-select')).isEnabled()).toBe(true);
    });
  });

  it('Other user cannot assign Tech Support user\'s role', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.otherProjectName);

    browser.wait(ExpectedConditions.visibilityOf(projectsPage.settingsBtn), Utils.conditionTimeout);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    browser.wait(ExpectedConditions.visibilityOf(userManagementPage.usersList.first()), Utils.conditionTimeout);

    userManagementPage.getUserRow(constants.adminUsername).then( (row: ElementFinder) => {
      expect<any>(row.element(by.id('tech-support-role-select')).isDisplayed()).toBe(true);
      expect<any>(row.element(by.id('tech-support-role-select')).isEnabled()).toBe(false);
    });
  });

  it('Tech Support user can assign their own role', () => {
    loginPage.loginAsAdmin();
    projectsPage.get();
    projectsPage.clickOnProject(constants.otherProjectName);

    browser.wait(ExpectedConditions.visibilityOf(projectsPage.settingsBtn), Utils.conditionTimeout);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    userManagementPage.changeUserRole(constants.adminUsername, 'Manager');

    browser.wait(ExpectedConditions.visibilityOf(userManagementPage.usersList.first()), Utils.conditionTimeout);
    userManagementPage.getUserRow(constants.adminUsername).then( (row: ElementFinder) => {
      const selectedRole = row.element(by.css('select:not([disabled])')).element(by.css('option[selected=selected]'));
      selectedRole.getText().then( text => {
        expect<any>(text).toBe('Manager');
      });
    });
  });

  it('User cannot assign member to Tech Support role', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.otherProjectName);

    browser.wait(ExpectedConditions.visibilityOf(projectsPage.settingsBtn), Utils.conditionTimeout);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    browser.wait(ExpectedConditions.visibilityOf(userManagementPage.usersList.first()), Utils.conditionTimeout);

    userManagementPage.getUserRow(constants.adminUsername).then( (row: ElementFinder) => {
      row.element(by.css('select:not([disabled])')).getText().then( text => {
        expect<any>(text).toContain('Manager');
        expect<any>(text).toContain('Contributor');
        expect<any>(text).toContain('Observer');
        expect<any>(text).toContain('Observer with comment');
        expect<any>(text).not.toContain('Tech Support');
      });
    });
  });
});
