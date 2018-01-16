import {browser, element, by, By, $, $$, ExpectedConditions, protractor} from 'protractor';
const CONDITION_TIMEOUT = 3000;
const util = require('./util');

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

  findProject(projectName: string) {
    let foundRow: any;
    let result = protractor.promise.defer();
    let searchName = new RegExp(projectName);
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
      let projectLink = projectRow.element(by.css('a'));
      projectLink.getAttribute('href').then((url: string) => {
        browser.get(url);
      });
    });
  }

  settingsBtn = element(by.id('settingsBtn'));
  userManagementLink = (browser.baseUrl.includes('languageforge')) ? element(by.id('userManagementLink')) : element(by.id('dropdown-project-settings'));

  addUserToProject(projectName: any, usersName: string, roleText: string) {
    this.findProject(projectName).then((projectRow: any) => {
      let projectLink = projectRow.element(by.css('a'));
      projectLink.click();
      browser.wait(ExpectedConditions.visibilityOf(this.settingsBtn), CONDITION_TIMEOUT);
      this.settingsBtn.click();
      browser.wait(ExpectedConditions.visibilityOf(this.userManagementLink),
        CONDITION_TIMEOUT);
      this.userManagementLink.click();

      let addMembersBtn = element(by.id('addMembersButton'));
      browser.wait(ExpectedConditions.visibilityOf(addMembersBtn), CONDITION_TIMEOUT);
      addMembersBtn.click();
      let newMembersDiv = element(by.id('newMembersDiv'));
      let userNameInput = newMembersDiv.element(by.id('typeaheadInput'));
      browser.wait(ExpectedConditions.visibilityOf(userNameInput), CONDITION_TIMEOUT);
      userNameInput.sendKeys(usersName);

      let typeaheadDiv = element(by.id('typeaheadDiv'));
      let typeaheadItems = typeaheadDiv.all(by.css('ul li'));
      util.findRowByText(typeaheadItems, usersName).then((item: any) => {
        item.click();
      });

      // This should be unique no matter what
      newMembersDiv.element(by.id('addUserButton')).click();

      // Now set the user to member or manager, as needed
      let projectMemberRows = element.all(by.repeater('user in $ctrl.list.visibleUsers'));
      let foundUserRow: any;
      projectMemberRows.map((row: any) => {
        let nameColumn = row.element(by.binding('user.username'));
        nameColumn.getText().then((text: string) => {
          if (text === usersName) {
            foundUserRow = row;
          }
        });
      }).then(() => {
        if (foundUserRow) {
          let select = foundUserRow.element(by.css('select:not([disabled])'));
          util.clickDropdownByValue(select, roleText);
        }
      })

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
      let projectLink = projectRow.element(by.css('a'));
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

      let foundUserRow = projectMemberRows.first();
      let rowCheckbox = foundUserRow.element(by.css('input[type="checkbox"]'));
      util.setCheckbox(rowCheckbox, true);
      let removeMembersBtn = element(by.id('removeMembersBtn'));
      removeMembersBtn.click();

      this.get(); // After all is finished, reload projects page
    });
  }
}

module.exports = new ProjectsPage();
