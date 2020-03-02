import {browser, by, element, ExpectedConditions, protractor} from 'protractor';
import {UserManagementPage} from './user-management.page';
import {Utils} from './utils';

export class ProjectsPage {
  private readonly utils = new Utils();
  private readonly userManagementPage = new UserManagementPage();

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
      projectLink.getAttribute('href').then((href: string) => {
        const results = /app\/lexicon\/([0-9a-fA-F]+)\//.exec(href);
        expect(results).not.toBeNull();
        expect(results.length).toBeGreaterThan(1);
        const projectId = results[1];
        UserManagementPage.get(projectId);
      });

      browser.wait(ExpectedConditions.visibilityOf(this.userManagementPage.addMembersBtn), Utils.conditionTimeout);
      this.userManagementPage.addMembersBtn.click();
      browser.wait(ExpectedConditions.visibilityOf(this.userManagementPage.userNameInput), Utils.conditionTimeout);
      this.userManagementPage.userNameInput.sendKeys(usersName);

      this.utils.findRowByText(this.userManagementPage.typeaheadItems, usersName).then((item: any) => {
        item.click();
      });

      // This should be unique no matter what
      this.userManagementPage.newMembersDiv.element(by.id('addUserButton')).click();

      // Now set the user to member or manager, as needed
      let foundUserRow: any;
      this.userManagementPage.projectMemberRows.map((row: any) => {
        const nameColumn = row.element(by.binding('user.username'));
        nameColumn.getText().then((text: string) => {
          if (text === usersName) {
            foundUserRow = row;
          }
        });
      }).then(() => {
        if (foundUserRow) {
          const select = foundUserRow.element(by.css('select'));
          Utils.clickDropdownByValue(select, roleText);
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
      projectLink.getAttribute('href').then((href: string) => {
        const results = /app\/lexicon\/([0-9a-fA-F]+)\//.exec(href);
        expect(results).not.toBeNull();
        expect(results.length).toBeGreaterThan(1);
        const projectId = results[1];
        UserManagementPage.get(projectId);
      });
      browser.wait(ExpectedConditions.visibilityOf(this.userManagementPage.addMembersBtn), Utils.conditionTimeout);

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
      this.utils.setCheckbox(rowCheckbox, true);
      const removeMembersBtn = element(by.id('remove-members-button'));
      removeMembersBtn.click();

      this.get(); // After all is finished, reload projects page
    });
  }
}
