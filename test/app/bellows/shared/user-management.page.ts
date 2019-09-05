import { browser, by, element, ElementArrayFinder, ElementFinder, protractor } from 'protractor';
import { Utils } from './utils';

export class UserManagementPage {
  static get(projectId: string) {
    browser.get(browser.baseUrl + '/app/usermanagement/' + projectId );
  }

  addMembersBtn = element(by.id('addMembersButton'));
  newMembersDiv = element(by.id('newMembersDiv'));
  projectMemberRows = element.all(by.repeater('user in $ctrl.list.visibleUsers'));
  typeaheadDiv = element(by.id('typeaheadDiv'));
  typeaheadItems = this.typeaheadDiv.all(by.css('ul li'));
  userNameInput = this.newMembersDiv.element(by.id('typeaheadInput'));

  changeUserRole(userName: string, roleText: string) {
    this.getUserRow(userName).then( (row: ElementFinder) => {
      if (row) {
        const select = row.element(by.css('select'));
        Utils.clickDropdownByValue(select, roleText);
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
