'use strict';

var util = require('../../bellows/pages/util');

var ConfigurationPage = function() {
  var page = this;

  this.settingsMenuLink = $('.hdrnav a.btn i.icon-cog');
  this.configurationLink = element(by.linkText('Dictionary Configuration'));
  this.get = function get() {
    this.settingsMenuLink.click();
    this.configurationLink.click();
  };

  this.tabDivs = element.all(by.repeater('tab in tabs'));
  this.applyButton = element(by.buttonText('Apply'));

  this.getTabByName = function getTabByName(tabName) {
    return $('div.tabbable ul.nav-tabs').element(by.cssContainingText('a', tabName));
  };
  this.clickTabByName = function clickTabByName(tabName) {
    return page.getTabByName(tabName).then(function(elem) { elem.click(); });
  };

  this.showAllFieldsButton = element(by.buttonText('Show All Fields'));
  this.showCommonFieldsButton = element(by.buttonText('Show Only Common Fields'));

  this.activePane = $('div.tab-pane.active');

  this.entryFields = this.activePane.all(by.repeater('fieldName in fieldOrder.entry'));
  this.senseFields = this.activePane.all(by.repeater('fieldName in fieldOrder.senses'));
  this.exampleFields = this.activePane.all(by.repeater('fieldName in fieldOrder.examples'));
  this.getFieldByName = function getFieldByName(fieldName, treatAsRegex) {
    // Second parameter is optional, default false. If true, fieldName will be considered
    // a regular expression that should not be touched. If false or unspecified, fieldName
    // will be considered an exact match (so "Etymology" should not match "Etymology Comment").
    var fieldRegex = (treatAsRegex ? fieldName : '^'+fieldName+'$');
    return $('div.tab-pane.active dl.picklists').element(by.elemMatches('div[data-ng-repeat]', fieldRegex));
  };
  this.clickFieldByName = function clickFieldByName(fieldName, treatAsRegex) {
    // Second parameter just as in getFieldByName()
    return this.getFieldByName(fieldName, treatAsRegex).then(function(elem) { elem.click(); });
  };

  this.hiddenIfEmpty = this.activePane.element(by.model('fieldConfig[currentField.name].hideIfEmpty'));
  this.captionHiddenIfEmpty = this.activePane.element(by.model('fieldConfig[currentField.name].captionHideIfEmpty'));

  this.usersWithViewSettings = this.activePane.$('#userSelectList');
  this.addViewSettingsForMember = function addViewSettingsForMember(memberName) {
    this.activePane.$('div.typeahead input').sendKeys(memberName);
    this.activePane.$('div.typeahead').all(by.repeater('user in typeahead.users')).first().click();
    this.activePane.element(by.buttonText('Add Member Specific Settings')).click();
  };
  this.pickMemberWithViewSettings = function pickMemberWithViewSettings(memberName) {
    this.usersWithViewSettings.element(by.elemMatches('div.picklists > ul.unstyled > li', memberName)).click();
  };
  this.selectMemberBtn = this.activePane.element(by.buttonText('Select Member'));
  this.removeMemberViewSettingsBtn = this.activePane.element(by.buttonText('Remove Member Specific Settings'));
};

module.exports = new ConfigurationPage();