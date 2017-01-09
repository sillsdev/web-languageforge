'use strict';

module.exports = new ProjectSettingsPage();

function ProjectSettingsPage() {
  var projectsPage = require('../../../bellows/pages/projectsPage.js');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  this.settingsMenuLink = element(by.className('btn dropdown-toggle'));
  this.projectSettingsLink = element(by.linkText('Project Settings'));

  // Get the projectSettings for project projectName
  this.get = function get(projectName) {
    projectsPage.get();
    projectsPage.clickOnProject(projectName);
    browser.wait(expectedCondition.visibilityOf(this.settingsMenuLink), CONDITION_TIMEOUT);
    this.settingsMenuLink.click();
    this.projectSettingsLink.click();
  };

  //noinspection JSUnusedGlobalSymbols
  this.backToDictionaryBtn = element(by.buttonText('Dictionary'));

  this.tabDivs = element.all(by.repeater('tab in tabs'));
  this.activePane = element(by.css('div.tab-pane.active'));

  this.getTabByName = function getTabByName(tabName) {
    return element(by.css('div.tabbable ul.nav-tabs')).element(by.cssContainingText('a', tabName));
  };

  this.tabs = {
    project: this.getTabByName('Project Properties')
  };

  this.projectTab = {
    saveButton: this.tabDivs.get(0).element(by.buttonText('Save'))
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
