import {$, $$, browser, by, By, element, ExpectedConditions} from 'protractor';

import { ProjectsPage } from '../../../bellows/pages/projectsPage';

const projectsPage = new ProjectsPage();

export class ProjectSettingsPage {

  conditionTimeout = 3000;
  settingsMenuLink = element(by.id('settings-dropdown-button'));
  projectSettingsLink = element(by.id('dropdown-project-settings'));

  // Get the projectSettings for project projectName
  get(projectName: string) {
    projectsPage.get();
    projectsPage.clickOnProject(projectName);
    browser.wait(ExpectedConditions.visibilityOf(this.settingsMenuLink), this.conditionTimeout);
    this.settingsMenuLink.click();
    browser.wait(ExpectedConditions.visibilityOf(this.projectSettingsLink), this.conditionTimeout);
    this.projectSettingsLink.click();
  }

  tabDivs = element.all(by.className('tab-pane'));
  activePane = element(by.css('div.tab-pane.active'));

  getTabByName(tabName: string) {
    return element(by.css('ul.nav-tabs')).element(by.cssContainingText('a', tabName));
  }

  tabs = {
    project: this.getTabByName('Project Properties')
  };

  projectTab = {
    saveButton: this.tabDivs.get(0).element(by.id('project-settings-save-btn'))
  };

  /** Second parameter is optional, default false. If true, fieldName will be considered
   * a regular expression that should not be touched. If false or unspecified, fieldName
   * will be considered an exact match (so "Etymology" should not match "Etymology Comment").
   */
  getFieldByName(fieldName: string, treatAsRegex: boolean) {
    const fieldRegex: string|RegExp = (treatAsRegex ? fieldName : new RegExp('^' + fieldName + '$'));
    return element(By.css('div.tab-pane.active dl.picklists'))
      .element(By.cssContainingText('div[data-ng-repeat]', fieldRegex));
  }
}
