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
    project: this.getTabByName('Project Properties'),
    sendReceive: this.getTabByName('Send and Receive Properties')
  };

  this.projectTab = {
    saveButton: this.tabDivs.get(0).element(by.buttonText('Save'))
  };

  this.sendReceiveTab = {
    formStatus:             this.tabDivs.get(1).element(by.id('form-status')),
    loginInput:             this.tabDivs.get(1).element(by.id('srUsername')),
    loginUnknown:           this.tabDivs.get(1).element(by.id('usernameUnknown')),
    loginOk:                this.tabDivs.get(1).element(by.id('usernameOk')),
    passwordInput:          this.tabDivs.get(1).element(by.id('srPassword')),
    passwordUnknown:        this.tabDivs.get(1).element(by.id('passwordUnknown')),
    passwordOk:             this.tabDivs.get(1).element(by.id('passwordOk')),
    visiblePasswordInput:   this.tabDivs.get(1).element(by.id('srVisiblePassword')),
    showCharactersCheckbox: this.tabDivs.get(1).element(by.model('showPassword')),
    projectUneditable:      this.tabDivs.get(1).element(by.id('srProject')),
    saveButton:             this.tabDivs.get(1).element(by.buttonText('Save'))
  };

  this.sendReceiveTab.projectSelect = function () {
    return this.tabDivs.get(1).element(by.id('srProjectSelect'));
  }.bind(this);

  this.sendReceiveTab.projectSelectedOption = function () {
    return this.projectSelect().element(by.css('option:checked')).getText();
  };

  this.sendReceiveTab.formStatus.expectHasNoError = function () {
    expect(this.sendReceiveTab.formStatus.getAttribute('class')).not.toContain('alert');
  }.bind(this);

  this.sendReceiveTab.formStatus.expectContainsError = function (partialMsg) {
    if (!partialMsg) partialMsg = '';
    expect(this.sendReceiveTab.formStatus.getAttribute('class')).toContain('alert-error');
    expect(this.sendReceiveTab.formStatus.getText()).toContain(partialMsg);
  }.bind(this);

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
