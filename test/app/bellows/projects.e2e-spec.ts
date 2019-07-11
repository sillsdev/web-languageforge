import {browser, by, ExpectedConditions, element} from 'protractor';
import {ElementFinder} from 'protractor/built/element';

import {EditorPage} from '../languageforge/lexicon/shared/editor.page';
import {BellowsLoginPage} from './shared/login.page';
import {ProjectsPage} from './shared/projects.page';

describe('Bellows E2E Projects List app', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const editorPage = new EditorPage();
  const projectNameLabel = element(by.className('page-name ng-binding'));

  describe('for Normal User', () => {

    it('should list the project of which the user is a member', () => {
      loginPage.loginAsMember();
      projectsPage.get();
      expect(projectsPage.projectNames.get(0).getText()).toBe(constants.testProjectName);
    });

    it('should not list projects the user is not a member of', () => {
      projectsPage.get();
      expect<any>(projectsPage.projectsList.count()).toBe(1);
    });

    it('can list two projects of which the user is a member', () => {
      loginPage.loginAsAdmin();
      projectsPage.get();
      browser.wait(ExpectedConditions.visibilityOf(projectsPage.createBtn), constants.conditionTimeout);
      projectsPage.addMemberToProject(constants.otherProjectName, constants.memberName);
      loginPage.loginAsMember();
      projectsPage.get();
      browser.wait(ExpectedConditions.visibilityOf(projectsPage.createBtn), constants.conditionTimeout);
      expect<any>(projectsPage.projectsList.count()).toBe(2);
    });
  });

  // Two helper functions to avoid duplicating the same checks in admin test below
  const shouldProjectBeLinked = (projectName: string, projectRow: ElementFinder, bool: boolean) => {
    expect<any>(projectRow.element(by.cssContainingText('a', projectName)).isDisplayed()).toBe(bool);
  };

  const shouldProjectHaveButtons = (projectRow: ElementFinder, bool: boolean) => {
    const addAsManagerBtn = projectRow.element(by.id('managerButton'));
    expect<any>(addAsManagerBtn.isDisplayed()).toBe(bool);
  };

  describe('for System Admin User', () => {

    it('should list all projects', () => {
      loginPage.loginAsAdmin();
      projectsPage.get();
      expect(projectsPage.projectsList.count()).toBeGreaterThan(0);

      // Check that the test project is around
      projectsPage.findProject(constants.testProjectName).then((projectRow: ElementFinder) => {
        shouldProjectBeLinked(constants.testProjectName, projectRow, true);
      });
    });

    it('should show add and delete buttons', () => {
      // projectsPage.createBtn.getOuterHtml().then(console.log);
      expect(projectsPage.createBtn.isDisplayed()).toBeTruthy();
    });

    it('should allow the admin to add themselves to the project as member or manager', () => {

      // First remove the admin from the project (must be a project admin is not the owner of)
      loginPage.loginAsManager();
      projectsPage.get();

      // The admin should not see "Add myself to project" buttons when he's already a project member
      // or manager, and the project name should be a clickable link
      projectsPage.findProject(constants.otherProjectName).then((projectRow: ElementFinder) => {
        shouldProjectBeLinked(constants.otherProjectName, projectRow, true);
        shouldProjectHaveButtons(projectRow, false);
      });

      projectsPage.removeUserFromProject(constants.otherProjectName, constants.adminUsername);
      loginPage.loginAsAdmin();
      projectsPage.get();

      // Now the admin should have "Add myself to project" buttons
      // And the project name should NOT be a clickable link
      projectsPage.findProject(constants.otherProjectName).then((projectRow: ElementFinder) => {
        shouldProjectBeLinked(constants.otherProjectName, projectRow, false);
        shouldProjectHaveButtons(projectRow, true);

        // Now add the admin back to the project
        projectRow.element(by.id('managerButton')).click();
      });

      // And the buttons should go away after one of them is clicked
      projectsPage.findProject(constants.otherProjectName).then((projectRow: ElementFinder) => {
        shouldProjectBeLinked(constants.otherProjectName, projectRow, true);
        shouldProjectHaveButtons(projectRow, false);
      });
    });

  });

  describe('Lexicon E2E Project Access', () => {

    it('Admin added to project when accessing without membership', () => {
      loginPage.loginAsManager();
      browser.getCurrentUrl().then(url => {
        projectNameLabel.getText().then( projectName => {
          projectsPage.get();
          browser.wait(ExpectedConditions.visibilityOf(projectsPage.createBtn), constants.conditionTimeout);
          projectsPage.removeUserFromProject(projectName, constants.adminUsername);
          loginPage.loginAsAdmin();
          browser.get(url);
          browser.wait(ExpectedConditions.visibilityOf(editorPage.browseDiv), constants.conditionTimeout);
          expect<any>(editorPage.browseDiv.isPresent()).toBe(true);
        });
      });
    });

    it('User redirected to projects app when accessing without membership', () => {
        loginPage.loginAsManager();
        browser.getCurrentUrl().then(url => {
          loginPage.loginAsSecondUser();
          browser.get(url);
          browser.wait(ExpectedConditions.visibilityOf(projectsPage.createBtn), constants.conditionTimeout);
          expect<any>(projectsPage.createBtn.isPresent()).toBe(true);
        });
    });

  });

});
