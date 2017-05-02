'use strict';

module.exports = new BellowsProjectSettingsPage();

function BellowsProjectSettingsPage() {
  var util = require('./util.js');
  var projectsPage   = require('./projectsPage.js');
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
    browser.wait(expectedCondition.visibilityOf(this.projectSettingsLink), CONDITION_TIMEOUT);
    this.projectSettingsLink.click();
  };

  this.noticeList = element.all(by.repeater('notice in notices()'));
  this.firstNoticeCloseButton = this.noticeList.first().element(by.buttonText('×'));

  this.backButton = element(by.linkText('Back'));

  this.tabDivs = element.all(by.className('tab-pane'));
  this.activePane = element(by.css('div.tab-pane.active'));

  this.tabs = {
    project: element(by.linkText('Project Properties')),
    reports: element(by.linkText('Reports')),
    archive: element(by.linkText('Archive')),
    remove: element(by.linkText('Delete'))
  };

  this.projectTab = {
    name: element(by.model('project.projectName')),
    code: element(by.model('project.projectCode')),
    projectOwner: element(by.binding('project.ownerRef.username')),
    saveButton: this.tabDivs.get(0).element(by.buttonText('Save'))

    //button: element(by.id('project_properties_save_button'))
  };

  // placeholder since we don't have Reports tests
  this.reportsTab = {
  };

  // Archive tab currently disabled
  this.archiveTab = {
    archiveButton: this.activePane.element(by.buttonText('Archive this project'))
  };

  this.deleteTab = {
    deleteBoxText: this.activePane.element(by.model('deleteBoxText')),
    deleteButton: this.activePane.element(by.buttonText('Delete this project'))
  };

}

