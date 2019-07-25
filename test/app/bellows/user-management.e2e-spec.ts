import {browser, by, element} from 'protractor';
import {ElementFinder} from 'protractor/built/element';

import {BellowsLoginPage} from './shared/login.page';
import {ProjectsPage} from './shared/projects.page';
import {UserManagementPage} from './shared/user-management.page';

describe('Bellows E2E User Management App', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const userManagementPage = new UserManagementPage();

  it('Can add admin as Tech Support', () => {
    loginPage.loginAsAdmin();
    projectsPage.get();
    // Click "+ Tech Support" button
    projectsPage.findProject(constants.otherProjectName).then((projectRow: ElementFinder) => {
      projectRow.element(by.id('techSupportButton')).click();
    });
    // Assert admin is Tech Support
    projectsPage.clickOnProject(constants.otherProjectName);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    userManagementPage.findUserRow(constants.adminUsername).then( (row: ElementFinder) => {
      expect<any>(element(by.id('admin-dropdown')).isDisplayed()).toBe(true);
      expect<any>(element(by.id('admin-dropdown')).isEnabled()).toBe(true);
    });
  });

  it('Non admin cannot remove Tech Support user', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.otherProjectName);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    userManagementPage.findUserRow(constants.adminUsername).then( (row: ElementFinder) => {
      expect<any>(element(by.id('tech-support-dropdown')).isDisplayed()).toBe(true);
      expect<any>(element(by.id('tech-support-dropdown')).isEnabled()).toBe(false);
    });
  });

  it('Tech Support user can change own role', () => {
    loginPage.loginAsAdmin();
    projectsPage.get();
    projectsPage.clickOnProject(constants.otherProjectName);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    userManagementPage.changeUserRole(constants.adminUsername, 'Manager');
    userManagementPage.findUserRow(constants.adminUsername).then( (row: ElementFinder) => {
      const selectedRole = row.element(by.css('select:not([disabled])')).element(by.css('option[selected=selected]'));
      selectedRole.getText().then( text => {
        expect<any>(text).toBe('Manager');
      });
    });
  });

  it('Non admin cannot add Tech Support user', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.otherProjectName);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    userManagementPage.findUserRow(constants.adminUsername).then( (row: ElementFinder) => {
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
