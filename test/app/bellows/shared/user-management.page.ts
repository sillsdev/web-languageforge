import { browser, by, element, ElementArrayFinder, ElementFinder, protractor } from 'protractor';
import { ProjectsPage } from './projects.page';
import { Utils } from './utils';

export class UserManagementPage {
  static get(projectId: string) {
    return browser.get(browser.baseUrl + '/app/usermanagement/' + projectId );
  }

  static async getByProjectName(projectName: string) {
    const projectsPage = new ProjectsPage();
    await projectsPage.get();
    return projectsPage.findProject(projectName).then((projectRow: ElementFinder) => {
      const projectLink = projectRow.element(by.css('a'));
      return projectLink.getAttribute('href').then((href: string) => {
        const results = /app\/lexicon\/([0-9a-fA-F]+)\//.exec(href);
        expect(results).not.toBeNull();
        expect(results.length).toBeGreaterThan(1);
        const projectId = results[1];
        return UserManagementPage.get(projectId);
      });
    });
  }

  addMembersBtn = element(by.id('addMembersButton'));
  newMembersDiv = element(by.id('newMembersDiv'));
  projectMemberRows = element.all(by.repeater('user in $ctrl.list.visibleUsers'));
  typeaheadDiv = element(by.id('typeaheadDiv'));
  typeaheadItems = this.typeaheadDiv.all(by.css('ul li'));
  userNameInput = this.newMembersDiv.element(by.id('typeaheadInput'));

  changeUserRole(userName: string, roleText: string) {
    return this.getUserRow(userName).then( (row: ElementFinder) => {
      if (row) {
        const select = row.element(by.css('select'));
        return Utils.clickDropdownByValue(select, roleText);
      }
    });
  }

  getUserRow(userName: string) {
    const result = protractor.promise.defer();
    let foundUserRow: ElementFinder;
    this.projectMemberRows.map((row: any) => {
      const nameColumn = row.element(by.binding('user.username'));
      nameColumn.getText().then( (text: string) => {
        if (text === userName) {
          foundUserRow = row;
        }
      });
    }).then(() => {
      if (foundUserRow) {
        result.fulfill(foundUserRow);
      } else {
        result.reject('User ' + userName + ' not found.');
      }
    });

    return result.promise;
  }
}
