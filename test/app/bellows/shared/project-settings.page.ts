import {browser, by, element, ExpectedConditions} from 'protractor';

import { ProjectsPage } from './projects.page';

export class BellowsProjectSettingsPage {
  private readonly projectsPage = new ProjectsPage();

  conditionTimeout: number = 3000;

  settingsMenuLink = element(by.id('settings-dropdown-button'));
  projectSettingsLink = element(by.id('dropdown-project-settings'));

  // Get the projectSettings for project projectName
  async get(projectName: string) {
    await this.projectsPage.get();
    await this.projectsPage.clickOnProject(projectName);
    await browser.wait(ExpectedConditions.visibilityOf(this.settingsMenuLink), this.conditionTimeout);
    await this.settingsMenuLink.click();
    await browser.wait(ExpectedConditions.visibilityOf(this.projectSettingsLink), this.conditionTimeout);
    await this.projectSettingsLink.click();
  }

  noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  awaitfirstNoticeCloseButton = this.noticeList.first().element(by.buttonText('×'));

  tabDivs = element.all(by.className('tab-pane'));
  activePane = element(by.css('div.tab-pane.active'));

  /*
  Would like to use id locators, but the pui-tab directive that is used in the project settingsPage
  in scripture forge is currently making it hard to assign an id to the tab element. This should be
  updated, but due to time shortage, it will be left as is. - Mark W 2018-01-15
  */
  tabs = {
    project: element(by.linkText('Project Properties')),
    // reports: element(by.linkText('Reports')), // This feature is never tested
    // archive: element(by.linkText('Archive')), // This is a disabled feature
    remove: element(by.linkText('Delete'))
  };

  projectTab = {
    name: element(by.model('project.projectName')),
    code: element(by.model('project.projectCode')),
    projectOwner: element(by.binding('project.ownerRef.username')),
    saveButton: element(by.id('project-properties-save-button'))
  };

  // placeholder since we don't have Reports tests
  reportsTab = {
  };

  // Archive tab currently disabled
  // this.archiveTab = {
  //  archiveButton: this.activePane.element(by.buttonText('Archive this project'))
  // };

  deleteTab = {
    deleteBoxText: this.activePane.element(by.id('deletebox')),
    deleteButton: this.activePane.element(by.id('deleteProject'))
   };
}
