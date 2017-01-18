'use strict';

module.exports = new ConfigurationPage();

function ConfigurationPage() {
  var modal = require('./lexModals.js');

  this.noticeList = element.all(by.repeater('notice in notices()'));
  this.firstNoticeCloseButton = this.noticeList.first().element(by.buttonText('×'));

  this.settingsMenuLink = element(by.className('fa-cog'));
  this.configurationLink = element(by.linkText('Configuration'));
  this.get = function get() {
    this.settingsMenuLink.click();
    this.configurationLink.click();
  };

  this.applyButton = element(by.buttonText('Apply'));

  this.tabDivs = element.all(by.repeater('tab in tabs'));

  this.activePane = element(by.css('div.tab-pane.active'));

  this.getTabByName = function getTabByName(tabName) {
    return element(by.css('div.tabbable ul.nav-tabs')).element(by.cssContainingText('a', tabName));
  };

  this.tabs = {
    inputSystems: element(by.linkText('Input Systems')),
    fields:       element(by.linkText('Fields')),
    tasks:        element(by.linkText('Tasks')),
    optionlists:  element(by.linkText('Option Lists'))
  };

  this.inputSystemsTab = {
    newButton:    this.tabDivs.first().element(by.partialButtonText('New')),
    moreButton:   this.tabDivs.first().element(by.css('.btn-group a.btn')),
    moreButtonGroup: {
      addIpa:     this.tabDivs.first().element(by.partialLinkText('Add IPA')),
      addVoice:   this.tabDivs.first().element(by.partialLinkText('Add Voice')),
      addVariant: this.tabDivs.first().element(by.partialLinkText('Add a variant'))
    },
    getLanguageByName: function getLanguageByName(languageName) {
      return element(by.css('div.tab-pane.active div.span3 dl.picklists'))
        .element(by.cssContainingText('div[data-ng-repeat] span', languageName));
    },

    selectedInputSystem: {
      displayName:    this.tabDivs.first().element(by.id('languageDisplayName')),
      tag:            this.tabDivs.first()
        .element(by.binding('inputSystemViewModels[selectedInputSystemId].inputSystem.tag')),
      abbreviationInput: this.tabDivs.first()
        .element(by.model('inputSystemViewModels[selectedInputSystemId].inputSystem.abbreviation')),
      rightToLeftCheckbox: this.tabDivs.first().element(by
        .model('inputSystemViewModels[selectedInputSystemId].inputSystem.isRightToLeft')),
      specialDropdown: this.tabDivs.first().element(by.id('special')),
      purposeDropdown: this.tabDivs.first().element(by.id('purpose')),
      ipaVariantInput: this.tabDivs.first().element(by.id('ipaVariant')),
      voiceVariantInput: this.tabDivs.first().element(by.id('voiceVariant')),
      scriptDropdown: this.tabDivs.first().element(by.id('script')),
      regionDropdown: this.tabDivs.first().element(by.id('region')),
      variantInput:   this.tabDivs.first().element(by.id('variant'))
    }
  };

  // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
  this.inputSystemsTab.newButtonClick = function () {
    this.inputSystemsTab.newButton.click();
    browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
  }.bind(this);

  this.fieldsTab = {
    fieldSetupLabel: this.activePane.element(by.id('fieldSetupLabel')),
    hiddenIfEmptyCheckbox: this.activePane
      .element(by.model('fieldConfig[currentField.name].hideIfEmpty')),
    widthInput: this.activePane.element(by.model('fieldConfig[currentField.name].width')),
    captionHiddenIfEmptyCheckbox: this.activePane
      .element(by.model('fieldConfig[currentField.name].captionHideIfEmpty')),
    inputSystemTags: this.activePane
      .all(by.repeater('inputSystemTag in currentField.inputSystems.fieldOrder')),
    inputSystemCheckboxes: this.activePane
      .all(by.model('currentField.inputSystems.selecteds[inputSystemTag]')),
    inputSystemUpButton: this.activePane.element(by.id('upButton')),
    inputSystemDownButton: this.activePane.element(by.id('downButton')),
    newCustomFieldButton: this.activePane.element(by.buttonText('New Custom Field')),
    removeCustomFieldButton: this.activePane.element(by.buttonText('Remove Custom Field'))
  };

  // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
  this.fieldsTab.newCustomFieldButtonClick = function () {
    this.fieldsTab.newCustomFieldButton.click();
    browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
  }.bind(this);

  this.showAllFieldsButton = element(by.buttonText('Show All Fields'));
  this.showCommonFieldsButton = element(by.buttonText('Show Only Common Fields'));

  this.entryFields = this.activePane.all(by.repeater('fieldName in fieldOrder.entry'));
  this.senseFields = this.activePane.all(by.repeater('fieldName in fieldOrder.senses'));
  this.exampleFields = this.activePane.all(by.repeater('fieldName in fieldOrder.examples'));

  this.getFieldByName = function getFieldByName(fieldName) {
    return element(by.css('div.tab-pane.active > div > div > div.span3 dl.picklists'))
      .element(by.cssContainingText('div[data-ng-repeat] > span', fieldName));
  };

  this.hiddenIfEmpty = this.activePane.element(by.id('hideIfEmpty'));
  this.captionHiddenIfEmpty = function () {
    return this.activePane.element(by.id('captionHideIfEmpty'));
  };

  // select language and custom field modals
  this.modal = modal;

}
