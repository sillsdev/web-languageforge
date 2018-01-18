import {$, $$, browser, by, By, element, ExpectedConditions, protractor} from 'protractor';
const CONDITION_TIMEOUT = 3000;
const util = require('./utils');

export class ProjectsPage {
  url = '/app/projects';
  get() {
    browser.get(browser.baseUrl + this.url);
  }

  testProjectName = 'Test Project';
  createBtn = element(by.id('startJoinProjectButton'));
  // Or just select "100" from the per-page dropdown, then you're pretty much guaranteed the Test
  // Project will be on page 1, and you can find it.
  itemsPerPageCtrl = element(by.model('itemsPerPage'));
  projectsList = element.all(by.repeater('project in visibleProjects'));
  projectNames = element.all(by.repeater('project in visibleProjects').column('project.projectName'));
  projectTypes = element.all(by.repeater('project in visibleProjects')
      .column('$ctrl.projectTypeNames[project.appName]'));

  findProject(projectName: string) {
    let foundRow: any;
    const result = protractor.promise.defer();
    const searchName = new RegExp(projectName);
    this.projectsList.map((row: any) => {
      row.getText().then((text: string) => {
        if (searchName.test(text)) {
          foundRow = row;
        }
      });
    }).then(() => {
      if (foundRow) {
        result.fulfill(foundRow);
      } else {
        result.reject('Project ' + projectName + ' not found.');
      }
    });

    return result.promise;
  }

  clickOnProject(projectName: string) {
    this.findProject(projectName).then((projectRow: any) => {
      const projectLink = projectRow.element(by.css('a'));
      projectLink.getAttribute('href').then((url: string) => {
        browser.get(url);
      });
    });
  }

  settingsBtn = element(by.id('settingsBtn'));
  userManagementLink = (browser.baseUrl.includes('languageforge')) ?
    element(by.id('userManagementLink')) : element(by.id('dropdown-project-settings'));

  addUserToProject(projectName: any, usersName: string, roleText: string) {
    this.findProject(projectName).then((projectRow: any) => {
      const projectLink = projectRow.element(by.css('a'));
      projectLink.click();
      browser.wait(ExpectedConditions.visibilityOf(this.settingsBtn), CONDITION_TIMEOUT);
      this.settingsBtn.click();
      browser.wait(ExpectedConditions.visibilityOf(this.userManagementLink),
        CONDITION_TIMEOUT);
      this.userManagementLink.click();

      const addMembersBtn = element(by.id('addMembersButton'));
      browser.wait(ExpectedConditions.visibilityOf(addMembersBtn), CONDITION_TIMEOUT);
      addMembersBtn.click();
      const newMembersDiv = element(by.id('newMembersDiv'));
      const userNameInput = newMembersDiv.element(by.id('typeaheadInput'));
      browser.wait(ExpectedConditions.visibilityOf(userNameInput), CONDITION_TIMEOUT);
      userNameInput.sendKeys(usersName);

      const typeaheadDiv = element(by.id('typeaheadDiv'));
      const typeaheadItems = typeaheadDiv.all(by.css('ul li'));
      util.findRowByText(typeaheadItems, usersName).then((item: any) => {
        item.click();
      });

      // This should be unique no matter what
      newMembersDiv.element(by.id('addUserButton')).click();

      // Now set the user to member or manager, as needed
      const projectMemberRows = element.all(by.repeater('user in $ctrl.list.visibleUsers'));
      let foundUserRow: any;
      projectMemberRows.map((row: any) => {
        const nameColumn = row.element(by.binding('user.username'));
        nameColumn.getText().then((text: string) => {
          if (text === usersName) {
            foundUserRow = row;
          }
        });
      }).then(() => {
        if (foundUserRow) {
          const select = foundUserRow.element(by.css('select:not([disabled])'));
          util.clickDropdownByValue(select, roleText);
        }
      });

      this.get(); // After all is finished, reload projects page
    });
  }

  //noinspection JSUnusedGlobalSymbols
  addManagerToProject(projectName: string, usersName: string) {
    this.addUserToProject(projectName, usersName, 'Manager');
  }

  addMemberToProject(projectName: string, usersName: string) {
    this.addUserToProject(projectName, usersName, 'Contributor');
  }

  removeUserFromProject(projectName: string, userName: string) {
    this.findProject(projectName).then((projectRow: any) => {
      const projectLink = projectRow.element(by.css('a'));
      projectLink.click();

      this.settingsBtn.click();
      this.userManagementLink.click();

      let userFilter: any;
      let projectMemberRows: any;
      if (browser.baseUrl.includes('scriptureforge')) {
        userFilter = element(by.model('userFilter'));
        userFilter.sendKeys(userName);
        projectMemberRows = element.all(by.repeater('user in list.visibleUsers'));
      } else if (browser.baseUrl.includes('languageforge')) {
        userFilter = element(by.model('$ctrl.userFilter'));
        userFilter.sendKeys(userName);
        projectMemberRows = element.all(by.repeater('user in $ctrl.list.visibleUsers'));
      }

      const foundUserRow = projectMemberRows.first();
      const rowCheckbox = foundUserRow.element(by.css('input[type="checkbox"]'));
      util.setCheckbox(rowCheckbox, true);
      const removeMembersBtn = element(by.id('removeMembersBtn'));
      removeMembersBtn.click();

      this.get(); // After all is finished, reload projects page
    });
  }
}
