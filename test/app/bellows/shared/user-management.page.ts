import { browser, element, by, ElementFinder, ElementArrayFinder, protractor } from "protractor";
import { Utils } from "./utils";


export class UserManagementPage {
  static get(projectId: string) {
    browser.get(browser.baseUrl + '/app/usermanagement' + projectId );
  }

  usersList = element.all(by.repeater('user in $ctrl.list.visibleUsers'));

  changeUserRole(userName: string, roleText: string) {
    let foundUserRow: any;
    this.usersList.map((row: any) => {
      const nameColumn = row.element(by.binding('user.username'));
      nameColumn.getText().then((text: string) => {
        if (text === userName) {
          foundUserRow = row;
        }
      });
    }).then(() => {
      if (foundUserRow) {
        const select = foundUserRow.element(by.css('select:not([disabled])'));
        Utils.clickDropdownByValue(select, roleText);
      }
    });
  }

  findUserRow(userName: string) {
    const result = protractor.promise.defer();
    let foundUserRow: any;
    this.usersList.map((row: any) => {
      const nameColumn = row.element(by.binding('user.username'));
      nameColumn.getText().then((text: string) => {
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
