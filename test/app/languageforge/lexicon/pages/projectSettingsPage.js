'use strict';

module.exports = new ProjectSettingsPage();

function ProjectSettingsPage() {
  var projectsPage = require('../../../bellows/pages/projectsPage.js');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  this.settingsMenuLink = element(by.id('settingsDropdownButton'));
  this.projectSettingsLink = element(by.id('dropdown-project-settings'));

  // Get the projectSettings for project projectName
  this.get = function get(projectName) {
    projectsPage.get();
    projectsPage.clickOnProject(projectName);
    browser.wait(expectedCondition.visibilityOf(this.settingsMenuLink), CONDITION_TIMEOUT);
    this.settingsMenuLink.click();
    browser.wait(expectedCondition.visibilityOf(this.projectSettingsLink), CONDITION_TIMEOUT);
    this.projectSettingsLink.click();
  };

  this.tabDivs = element.all(by.className('tab-pane'));
  this.activePane = element(by.css('div.tab-pane.active'));

  this.getTabByName = function getTabByName(tabName) {
    return element(by.css('ul.nav-tabs')).element(by.cssContainingText('a', tabName));
  };

  this.tabs = {
    project: this.getTabByName('Project Properties')
  };

  this.projectTab = {
    saveButton: this.tabDivs.get(0).element(by.id('project-settings-save-btn'))
  };

  /** Second parameter is optional, default false. If true, fieldName will be considered
   * a regular expression that should not be touched. If false or unspecified, fieldName
   * will be considered an exact match (so "Etymology" should not match "Etymology Comment").
   */
  this.getFieldByName = function getFieldByName(fieldName, treatAsRegex) {
    var fieldRegex = (treatAsRegex ? fieldName : '^' + fieldName + '$');
    return element(by.css('div.tab-pane.active dl.picklists'))
      .element(by.elemMatches('div[data-ng-repeat]', fieldRegex));
  };
}
