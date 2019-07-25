import {browser, by, ExpectedConditions, element} from 'protractor';
import {ElementFinder, ElementArrayFinder} from 'protractor/built/element';

import {EditorPage} from '../languageforge/lexicon/shared/editor.page';
import {BellowsLoginPage} from './shared/login.page';
import {ProjectsPage} from './shared/projects.page';
import {UserManagementPage} from './shared/user-management.page';

describe('Bellows E2E User Management App', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const userManagementPage = new UserManagementPage();
  const editorPage = new EditorPage();
  const projectNameLabel = element(by.className('page-name ng-binding'));

  it('Add users to project', () => {
    loginPage.loginAsAdmin();
    projectsPage.get();
    projectsPage.findProject(constants.otherProjectName).then((projectRow: ElementFinder) => {
      // Now add the admin back to the project
      projectRow.element(by.id('techSupportButton')).click();
    });

  });

  it('Tech Support user can change own role', () => {
    projectsPage.clickOnProject(constants.otherProjectName);
    projectsPage.settingsBtn.click();
    projectsPage.userManagementLink.click();
    userManagementPage.changeUserRole(constants.adminUsername, 'Manager');
    userManagementPage.findUserRow(constants.adminUsername).then( (row: ElementFinder) => {
      row.getText().then( text => {
        console.log(text);
      });
      browser.sleep(1000);
      const select = row.element(by.id('defaultDropdown')).element(by.css('option[selected]'));
      // select.getText().then( text => {
      //   expect<any>(text).toBe('Manager');
      // });
    });
    // userManagementPage.findUserRow2(constants.adminUsername).then( (row: ElementArrayFinder) => {
    //   expect<any>(row.all(by.tagName('td')).get(3).element(by.tagName('select')).isEnabled()).toBe(true);
    // });
  });

  // it('Non admin cannot add Tech Support user', () => {
  //   loginPage.loginAsManager();
  //   projectsPage.get();
  //   projectsPage.addUserToProject(constants.otherProjectName, constants.memberUserName, 'tech_support'); // Add expecting
  // });

  // it('Non admin cannot remove Tech Support user', () => {
  //   userManagementPage.findUserRow2(constants.adminUsername).then( (row: ElementArrayFinder) => {
  //     expect<any>(row.all(by.tagName('td')).get(3).element(by.tagName('select')).isEnabled()).toBe(false);
  //   });
  // });
});
