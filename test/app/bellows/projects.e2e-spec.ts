import {browser, by, ExpectedConditions} from 'protractor';
import {ElementFinder} from 'protractor/built/element';

import {BellowsLoginPage} from './shared/login.page';
import {ProjectsPage} from './shared/projects.page';

describe('Bellows E2E Projects List app', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();

  describe('for Normal User', () => {

    it('should list the project of which the user is a member', async () => {
      await loginPage.loginAsMember();
      await projectsPage.get();
      await expect(projectsPage.projectNames.get(0).getText()).toBe(constants.testProjectName);
    });

    it('should not list projects the user is not a member of', async () => {
      await projectsPage.get();
      await expect<any>(projectsPage.projectsList.count()).toBe(1);
    });

    it('can list two projects of which the user is a member', async () => {
      await loginPage.loginAsAdmin();
      await projectsPage.get();
      await browser.wait(ExpectedConditions.visibilityOf(projectsPage.createBtn), constants.conditionTimeout);
      await projectsPage.addMemberToProject(constants.otherProjectName, constants.memberName);
      await loginPage.loginAsMember();
      await projectsPage.get();
      await browser.wait(ExpectedConditions.visibilityOf(projectsPage.createBtn), constants.conditionTimeout);
      await expect<any>(projectsPage.projectsList.count()).toBe(2);
    });
  });

  // Two helper functions to avoid duplicating the same checks in admin test below
  const shouldProjectBeLinked = async (projectName: string, projectRow: ElementFinder, bool: boolean) => {
    await expect<any>(projectRow.element(by.cssContainingText('a', projectName)).isDisplayed()).toBe(bool);
  };

  const shouldProjectHaveButtons = async (projectRow: ElementFinder, bool: boolean) => {
    const addAsManagerBtn = projectRow.element(by.id('managerButton'));
    await expect<any>(addAsManagerBtn.isDisplayed()).toBe(bool);
  };

  describe('for System Admin User', () => {

    it('should list all projects', async () => {
      await loginPage.loginAsAdmin();
      await projectsPage.get();
      await expect(projectsPage.projectsList.count()).toBeGreaterThan(0);
      // Check that the test project is around
      await projectsPage.findProject(constants.testProjectName).then(async (projectRow: ElementFinder) => {
        await shouldProjectBeLinked(constants.testProjectName, projectRow, true);
      });
    });

    it('should show add and delete buttons', async () => {
      // projectsPage.createBtn.getOuterHtml().then(console.log);
      await expect(projectsPage.createBtn.isDisplayed()).toBeTruthy();
    });

    it('should allow the admin to add themselves to the project as member or manager', async () => {

      // First remove the admin from the project (must be a project admin is not the owner of)
      await loginPage.loginAsManager();
      await projectsPage.get();

      // The admin should not see "Add myself to project" buttons when he's already a project member
      // or manager, and the project name should be a clickable link
      await projectsPage.findProject(constants.otherProjectName).then(async (projectRow: ElementFinder) => {
        await shouldProjectBeLinked(constants.otherProjectName, projectRow, true);
        await shouldProjectHaveButtons(projectRow, false);
      });

      await projectsPage.removeUserFromProject(constants.otherProjectName, constants.adminUsername);
      await loginPage.loginAsAdmin();
      await projectsPage.get();

      // Now the admin should have "Add myself to project" buttons
      // And the project name should NOT be a clickable link
      await projectsPage.findProject(constants.otherProjectName).then(async (projectRow: ElementFinder) => {
        await shouldProjectBeLinked(constants.otherProjectName, projectRow, false);
        await shouldProjectHaveButtons(projectRow, true);

        // Now add the admin back to the project
        await projectRow.element(by.id('managerButton')).click();
      });

      // And the buttons should go away after one of them is clicked
      await projectsPage.findProject(constants.otherProjectName).then(async (projectRow: ElementFinder) => {
        await shouldProjectBeLinked(constants.otherProjectName, projectRow, true);
        await shouldProjectHaveButtons(projectRow, false);
      });
    });

  });

});
