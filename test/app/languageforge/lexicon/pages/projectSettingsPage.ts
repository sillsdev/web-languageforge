import {browser, element, by, By, $, $$, ExpectedConditions} from 'protractor';

export class ProjectSettingsPage {
  private readonly projectsPage = require('../../../bellows/pages/projectsPage.js');
  private readonly CONDITION_TIMEOUT = 3000;

  settingsMenuLink = element(by.id('settingsDropdownButton'));
  projectSettingsLink = element(by.id('dropdown-project-settings'));

  // Get the projectSettings for project projectName
  get(projectName: string) {
    this.projectsPage.get();
    this.projectsPage.clickOnProject(projectName);
    browser.wait(ExpectedConditions.visibilityOf(this.settingsMenuLink),this.CONDITION_TIMEOUT);
    this.settingsMenuLink.click();
    browser.wait(ExpectedConditions.visibilityOf(this.projectSettingsLink),this.CONDITION_TIMEOUT);
    this.projectSettingsLink.click();
  };

  tabDivs = element.all(by.className('tab-pane'));
  activePane = element(by.css('div.tab-pane.active'));

  getTabByName(tabName: string) {
    return element(by.css('ul.nav-tabs')).element(by.cssContainingText('a', tabName));
  };

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
    var fieldRegex = (treatAsRegex ? fieldName : '^' + fieldName + '$');
    return element(by.css('div.tab-pane.active dl.picklists'))
      .element(by.elemMatches('div[data-ng-repeat]', fieldRegex));
  };
}

module.exports = new ProjectSettingsPage();
