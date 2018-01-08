'use strict';

module.exports = new BellowsProjectSettingsPage();

function BellowsProjectSettingsPage() {
  var util = require('./util.js');
  var projectsPage   = require('./projectsPage.js');
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

  this.noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  this.firstNoticeCloseButton = this.noticeList.first().element(by.buttonText('×'));

  this.tabDivs = element.all(by.className('tab-pane'));
  this.activePane = element(by.css('div.tab-pane.active'));

  /*
  Would like to use id locators, but the pui-tab directive that is used in the project settingsPage
  in scripture forge is currently making it hard to assign an id to the tab element. This should be
  updated, but due to time shortage, it will be left as is.
  */
  this.tabs = {
    project: element(by.linkText('Project Properties')),
    //reports: element(by.linkText('Reports')), // This feature is never tested
    //archive: element(by.linkText('Archive')), // This is a disabled feature
    remove: element(by.linkText('Delete'))
  };

  this.projectTab = {
    name: element(by.model('project.projectName')),
    code: element(by.model('project.projectCode')),
    projectOwner: element(by.binding('project.ownerRef.username')),
    saveButton: element(by.id('project-properties-save-button'))

    //button: element(by.id('project-properties-save-button'))
  };

  // placeholder since we don't have Reports tests
  this.reportsTab = {
  };

  // Archive tab currently disabled
  // this.archiveTab = {
  //  archiveButton: this.activePane.element(by.buttonText('Archive this project'))
  // };

  this.deleteTab = {
    deleteBoxText: this.activePane.element(by.id('deletebox')),
    deleteButton: this.activePane.element(by.id('deleteProject'))
  };
}
