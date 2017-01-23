'use strict';

module.exports = new ViewSettingsPage();

function ViewSettingsPage() {
  this.settingsMenuLink = element(by.css('.hdrnav a.btn i.fa-cog'));
  this.viewSettingsLink = element(by.linkText('View Settings'));
  this.get = function get() {
    this.settingsMenuLink.click();
    this.viewSettingsLink.click();
  };

  //noinspection JSUnusedGlobalSymbols
  this.backToDictionaryBtn = element(by.buttonText('Dictionary'));

  this.tabDivs = element.all(by.repeater('tab in tabs'));
  this.applyButton = element(by.buttonText('Apply'));

  this.getTabByName = function getTabByName(tabName) {
    return element(by.css('div.tabbable ul.nav-tabs')).element(by.cssContainingText('a', tabName));
  };

  this.tabs = {
    observer: {
      go: function () {
        this.getTabByName('Observer').click();
      }.bind(this)
    },
    contributor: {
      go: function () {
        this.getTabByName('Contributor').click();
      }.bind(this)
    },
    manager: {
      showAllFieldsBtn: this.tabDivs.get(3).element(by.buttonText('Show All Fields')),
      go: function () {
        this.getTabByName('Manager').click();
      }.bind(this)
    }
  };

  //noinspection JSUnusedGlobalSymbols
  this.observerTab = {
    showAllFieldsBtn: this.tabDivs.get(0).element(by.buttonText('Show All Fields'))
  };

  //noinspection JSUnusedGlobalSymbols
  this.managerTab = {
  };

  this.showAllFieldsBtn = element(by.buttonText('Show All Fields'));

  //noinspection JSUnusedGlobalSymbols
  this.showCommonFieldsBtn = element(by.buttonText('Show Only Common Fields'));

  this.activePane = element(by.css('div.tab-pane.active'));

  this.accordionDiv = this.activePane.element(by.css('div.accordion'));
  this.accordionEnabledFields = this.accordionDiv
    .element(by.elemMatches('div.accordion-heading a', '^Enabled Fields for'));

  //noinspection JSUnusedGlobalSymbols
  this.accordionEnabledTasks = this.accordionDiv
    .element(by.elemMatches('div.accordion-heading a', '^Enabled Tasks'));

  //noinspection JSUnusedGlobalSymbols
  this.entryFields = this.activePane.all(by.repeater('fieldName in fieldOrder.entry'));

  //noinspection JSUnusedGlobalSymbols
  this.senseFields = this.activePane.all(by.repeater('fieldName in fieldOrder.senses'));

  //noinspection JSUnusedGlobalSymbols
  this.exampleFields = this.activePane.all(by.repeater('fieldName in fieldOrder.examples'));

  /** Second parameter is optional, default false. If true, fieldName will be considered
   * a regular expression that should not be touched. If false or unspecified, fieldName
   * will be considered an exact match (so "Etymology" should not match "Etymology Comment").
   */
  this.getFieldByName = function getFieldByName(fieldName, treatAsRegex) {
    var fieldRegex = (treatAsRegex ? fieldName : '^' + fieldName + '$');
    return element(by.css('div.tab-pane.active dl.picklists'))
      .element(by.elemMatches('div[data-ng-repeat]', fieldRegex));
  };

  this.getFieldByNameIconClass = function getFieldByNameIconClass(fieldName, treatAsRegex) {
    return this.getFieldByName(fieldName, treatAsRegex).element(by.css('i')).getAttribute('class');
  };

  this.showField = this.activePane.element(by.cssContainingText('label.checkbox', 'Show field'))
    .element(by.css('input[type="checkbox"]'));

  //noinspection JSUnusedGlobalSymbols
  this.overrideInputSystems = this.activePane
    .element(by.cssContainingText('label.checkbox', 'Override Input Systems'))
    .element(by.css('input[type="checkbox"]'));

  this.usersWithViewSettings = this.activePane.element(by.css('#userSelectList'));
  this.addViewSettingsForMember = function addViewSettingsForMember(memberName) {
    this.activePane.element(by.css('div.typeahead input')).sendKeys(memberName);
    this.activePane.element(by.css('div.typeahead')).all(by.repeater('user in typeahead.users'))
      .first().click();
    this.activePane.element(by.buttonText('Add Member Specific Settings')).click();
  };

  this.pickMemberWithViewSettings = function pickMemberWithViewSettings(memberName) {
    this.usersWithViewSettings
      .element(by.elemMatches('div.picklists > ul.unstyled > li', memberName)).click();
  };

  //noinspection JSUnusedGlobalSymbols
  this.selectMemberBtn = this.activePane.element(by.buttonText('Select Member'));

  //noinspection JSUnusedGlobalSymbols
  this.removeMemberViewSettingsBtn = this.activePane
    .element(by.buttonText('Remove Member Specific Settings'));
}
