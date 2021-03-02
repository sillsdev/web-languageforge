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

  it('Can add admin as Tech Support', async () => {
    // Remove admin from Other Project for Testing
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.removeUserFromProject(constants.otherProjectName, constants.adminUsername);

    await loginPage.loginAsAdmin();
    await projectsPage.get();

    // Click "+ Tech Support" button
    await projectsPage.findProject(constants.otherProjectName).then((projectRow: ElementFinder) => {
      return projectRow.element(by.id('techSupportButton')).click();
    });

    return UserManagementPage.getByProjectName(constants.otherProjectName).then(async () => {
      await browser.wait(ExpectedConditions.visibilityOf(userManagementPage.projectMemberRows.first()), Utils.conditionTimeout);
      return userManagementPage.getUserRow(constants.adminUsername).then(async (row: ElementFinder) => {
        const selector = row.element(by.css('select'));
        expect<any>(await selector.isEnabled()).toBe(true);
        return selector.element(by.css('option[selected=selected]')).getText().then( text => {
          expect<any>(text).toBe('Tech Support');
        });
      });
    });
  });

  it('Other user cannot assign Tech Support user\'s role', async () => {
    await loginPage.loginAsManager();
    return UserManagementPage.getByProjectName(constants.otherProjectName).then(async () => {
      await browser.wait(ExpectedConditions.visibilityOf(userManagementPage.projectMemberRows.first()), Utils.conditionTimeout);
      return userManagementPage.getUserRow(constants.adminUsername).then(async (row: ElementFinder) => {
        const selector = row.element(by.css('select'));
        expect<any>(await selector.isEnabled()).toBe(false);
        return selector.element(by.css('option[selected=selected]')).getText().then( text => {
          expect<any>(text).toBe('Tech Support');
        });
      });
    });

  });

  it('Tech Support user can assign their own role', async () => {
    await loginPage.loginAsAdmin();
    await UserManagementPage.getByProjectName(constants.otherProjectName).then(async () => {
      await browser.wait(ExpectedConditions.visibilityOf(userManagementPage.projectMemberRows.first()), Utils.conditionTimeout);
      return userManagementPage.changeUserRole(constants.adminUsername, 'Manager');
    });
    // Now verify
    return UserManagementPage.getByProjectName(constants.otherProjectName).then(async () => {
      await browser.wait(ExpectedConditions.visibilityOf(userManagementPage.projectMemberRows.first()), Utils.conditionTimeout);
      userManagementPage.getUserRow(constants.adminUsername).then(async (row: ElementFinder) => {
        const selector = row.element(by.css('select'));
        expect<any>(await selector.isEnabled()).toBe(true);
        return selector.element(by.css('option[selected=selected]')).getText().then( text => {
          expect<any>(text).toBe('Manager');
        });
      });
    });
  });

  it('User cannot assign member to Tech Support role', async () => {
    await loginPage.loginAsManager();
    await UserManagementPage.getByProjectName(constants.otherProjectName);
    const row = await userManagementPage.getUserRow(constants.adminUsername) as ElementFinder;
    const text = await row.element(by.css('select')).getText();
    expect<string>(text).toContain('Manager');
    expect<string>(text).toContain('Contributor');
    expect<string>(text).toContain('Observer');
    expect<string>(text).toContain('Observer with comment');
    expect<string>(text).not.toContain('Tech Support');
  });
});
