'use strict';

var util = require('../../bellows/pages/util');

var ConfigurationPage = function() {
  var page = this;

  this.settingsMenuLink = element(by.css('.hdrnav a.btn i.icon-cog'));
  this.configurationLink = element(by.linkText('Dictionary Configuration'));
  this.get = function get() {
    this.settingsMenuLink.click();
    this.configurationLink.click();
  };

  this.tabDivs = element.all(by.repeater('tab in tabs'));
  
  this.applyButton = element(by.buttonText('Apply'));

  this.getTabByName = function getTabByName(tabName) {
    return element(by.css('div.tabbable ul.nav-tabs')).element(by.cssContainingText('a', tabName));
  };

  this.showAllFieldsButton = element(by.buttonText('Show All Fields'));
  this.showCommonFieldsButton = element(by.buttonText('Show Only Common Fields'));

  this.activePane = element(by.css('div.tab-pane.active'));

  this.entryFields = this.activePane.all(by.repeater('fieldName in fieldOrder.entry'));
  this.senseFields = this.activePane.all(by.repeater('fieldName in fieldOrder.senses'));
  this.exampleFields = this.activePane.all(by.repeater('fieldName in fieldOrder.examples'));

  this.getFieldByName = function getFieldByName(fieldName) {
    return element(by.css('div.tab-pane.active > div > div > div.span3 dl.picklists')).element(by.cssContainingText('div[data-ng-repeat] span', fieldName));
  };

  this.hiddenIfEmpty = this.activePane.element(by.id('hideIfEmpty'));
  this.captionHiddenIfEmpty = function() {
    return this.activePane.element(by.id('captionHideIfEmpty'));
  }; 

};

module.exports = new ConfigurationPage();