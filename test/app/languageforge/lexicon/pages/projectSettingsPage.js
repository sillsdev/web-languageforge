'use strict';

function ProjectSettingsPage() {
  var _this = this;

  this.settingsMenuLink = $('.hdrnav a.btn i.icon-cog');
  this.projectSettingsLink = element(by.linkText('Project Settings'));
  this.get = function get() {
    this.settingsMenuLink.click();
    this.projectSettingsLink.click();
  };

  this.backToDictionaryBtn = element(by.buttonText('Dictionary'));

  this.tabDivs = element.all(by.repeater('tab in tabs'));
  this.activePane = $('div.tab-pane.active');

  this.getTabByName = function getTabByName(tabName) {
    return $('div.tabbable ul.nav-tabs').element(by.cssContainingText('a', tabName));
  };

  this.clickTabByName = function clickTabByName(tabName) {
    return _this.getTabByName(tabName).then(function(elem) { elem.click(); });
  };

  this.tabs = {
    project: this.getTabByName('Project Properties'),
    sendReceive: this.getTabByName('Send and Receive Properties'),
    communication: this.getTabByName('Communication Settings')
  };

  this.tabs.project.click = function() {
    _this.clickTabByName('Project Properties');
  };

  this.tabs.sendReceive.click = function() {
    _this.clickTabByName('Send and Receive Properties');
  };

  this.tabs.communication.click = function() {
    _this.clickTabByName('Communication Settings');
  };

  this.projectTab = {
    saveButton: this.tabDivs.get(0).element(by.buttonText('Save'))
  };

  this.sendReceiveTab = {
    formStatus:             this.tabDivs.get(1).element(by.id('form-status')),
    projectIdInput:         this.tabDivs.get(1).element(by.id('identifier')),
    loginInput:             this.tabDivs.get(1).element(by.id('login')),
    changeButton:           this.tabDivs.get(1).element(by.id('change')),
    passwordInput:          this.tabDivs.get(1).element(by.id('password')),
    visiblePasswordInput:   this.tabDivs.get(1).element(by.id('visiblePassword')),
    showCharactersCheckbox: this.tabDivs.get(1).element(by.model('showPassword')),
    updateButton:           this.tabDivs.get(1).element(by.buttonText('Update'))
  };

  this.sendReceiveTab.formStatus.expectHasNoError = function expectHasNoError() {
    expect(_this.sendReceiveTab.formStatus.getAttribute('class')).not.toContain('alert');
  };

  this.sendReceiveTab.formStatus.expectContainsError = function expectContainsError(partialMsg) {
    if (!partialMsg) partialMsg = '';
    expect(_this.sendReceiveTab.formStatus.getAttribute('class')).toContain('alert-error');
    expect(_this.sendReceiveTab.formStatus.getText()).toContain(partialMsg);
  };

  this.communicationTab = {
    saveButton: this.tabDivs.get(2).element(by.buttonText('Save'))
  };

  /** Second parameter is optional, default false. If true, fieldName will be considered
   * a regular expression that should not be touched. If false or unspecified, fieldName
   * will be considered an exact match (so "Etymology" should not match "Etymology Comment").
   */
  this.getFieldByName = function getFieldByName(fieldName, treatAsRegex) {
    var fieldRegex = (treatAsRegex ? fieldName : '^' + fieldName + '$');
    return $('div.tab-pane.active dl.picklists').element(by.elemMatches('div[data-ng-repeat]', fieldRegex));
  };
}

module.exports = new ProjectSettingsPage();
