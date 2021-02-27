import {browser, by, element} from 'protractor';
import { Utils } from './utils';

export class SiteAdminPage {
  private readonly util = new Utils();

  url = browser.baseUrl + '/app/siteadmin';
  get() {
    // todo: refactor this to be a click recipe (as a user would click on the menu to navigate)
    return browser.get(this.url);
  }

  activePane = element(by.css('div.tab-pane.active'));

  tabs = {
    reports: element(by.id('users')),
    archivedProjects: element(by.id('archivedprojects'))
  };

  archivedProjectsTab = {
    republishButton: element(by.id('site-admin-republish-btn')),
    deleteButton: element(by.id('site-admin-delete-btn')),
    projectsList: element.all(by.repeater('project in visibleProjects')),
    setCheckbox: (row: number, value: boolean) => {
      const projectRow = this.archivedProjectsTab.projectsList.get(row);
      const rowCheckbox = projectRow.element(by.css('input[type="checkbox"]'));
      return this.util.setCheckbox(rowCheckbox, value);
    }
  };

  //noinspection JSUnusedGlobalSymbols
  addBtn = element(by.id('site-admin-add-new-btn'));

  //noinspection JSUnusedGlobalSymbols
  userFilterInput = element(by.model('filterUsers'));
  usernameInput = element(by.model('record.username'));
  nameInput = element(by.model('record.name'));
  emailInput = element(by.model('record.email'));

  //noinspection JSUnusedGlobalSymbols
  roleInput = element(by.model('record.role'));

  //noinspection JSUnusedGlobalSymbols
  activeCheckbox = element(by.model('record.active'));
  passwordInput = element(by.model('record.password'));

  //noinspection JSUnusedGlobalSymbols
  async clearForm() {
    await this.usernameInput.clear();
    await this.nameInput.clear();
    await this.emailInput.clear();
    return this.passwordInput.clear();

    // this.activeCheckbox.clear();
  }
}
