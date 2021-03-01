import {browser, by, By, element, ExpectedConditions} from 'protractor';

import {ProjectsPage} from '../../../bellows/shared/projects.page';

export class ProjectSettingsPage {
  private readonly projectsPage = new ProjectsPage();

  conditionTimeout = 3000;
  settingsMenuLink = element(by.id('settings-dropdown-button'));
  projectSettingsLink = element(by.id('dropdown-project-settings'));

  // Get the projectSettings for project projectName
  async get(projectName: string) {
    await this.projectsPage.get();
    await this.projectsPage.clickOnProject(projectName);
    return this.getByLink();
  }

  async getByLink() {
    await browser.wait(ExpectedConditions.visibilityOf(this.settingsMenuLink), this.conditionTimeout);
    await this.settingsMenuLink.click();
    await browser.wait(ExpectedConditions.visibilityOf(this.projectSettingsLink), this.conditionTimeout);
    return this.projectSettingsLink.click();
  }

  tabDivs = element.all(by.className('tab-pane'));
  activePane = element(by.css('div.tab-pane.active'));

  static getTabByName(tabName: string) {
    return element(by.css('ul.nav-tabs')).element(by.cssContainingText('a', tabName));
  }

  tabs = {
    project: ProjectSettingsPage.getTabByName('Project Properties')
  };

  projectTab = {
    saveButton: this.tabDivs.get(0).element(by.id('project-settings-save-btn')),
    defaultLanguageSelect: element(by.id('language')),
    defaultLanguageSelected: element(by.css('#language option:checked'))
  };

  /** Second parameter is optional, default false. If true, fieldName will be considered
   * a regular expression that should not be touched. If false or unspecified, fieldName
   * will be considered an exact match (so "Etymology" should not match "Etymology Comment").
   */
  static getFieldByName(fieldName: string, treatAsRegex: boolean) {
    const fieldRegex: string|RegExp = (treatAsRegex ? fieldName : new RegExp('^' + fieldName + '$'));
    return element(By.css('div.tab-pane.active dl.picklists'))
      .element(By.cssContainingText('div[data-ng-repeat]', fieldRegex));
  }
}
