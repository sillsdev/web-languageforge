'use strict';

module.exports = new ConfigurationPage();

function ConfigurationPage() {
  var modal = require('./lexModals.js');
  var util = require('../../../bellows/pages/util.js');

  this.noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  this.firstNoticeCloseButton = this.noticeList.first().element(by.className('close'));

  this.settingsMenuLink = element(by.id('settingsDropdownButton'));
  this.configurationLink = element(by.id('dropdown-configuration'));
  this.get = function get() {
    util.scrollTop();
    this.settingsMenuLink.click();
    this.configurationLink.click();
  };

  this.applyButton = element(by.id('configuration-apply-btn'));

  var tabElements = element.all(by.tagName('pui-tab'));
  this.tab = function () {
    return tabElements.first();
  };

  this.activePane = element(by.css('div.tab-pane.active'));

  this.getTabByName = function getTabByName(tabName) {
    return element(by.cssContainingText('pui-tabset .tab-links .tab-link', tabName));
  };

  // These will be updated once the pui-tab is updated to support unique id
  this.tabs = {
    inputSystems: element(by.linkText('Input Systems')),
    fields:       element(by.linkText('Fields')),
    tasks:        element(by.linkText('Tasks')),
    optionlists:  element(by.linkText('Option Lists'))
  };

  this.inputSystemsTab = {
    newButton:    this.activePane.element(by.id('configuration-new-btn')),
    moreButton:   this.activePane.element(by.id('configuration-dropdown-btn')),
    moreButtonGroup: {
      addIpa:     this.activePane.element(by.id('configuration-add-ipa-btn')),
      addVoice:   this.activePane.element(by.id('configuration-add-voice-btn')),
      addVariant: this.activePane.element(by.id('configuration-add-variant-btn')),
      remove:     this.activePane.element(by.id('configuration-remove-btn'))
    },
    getLanguageByName: function getLanguageByName(languageName) {
      return element(by.css('div.tab-pane.active div.col-md-3 dl.picklists'))
        .element(by.cssContainingText('div[data-ng-repeat] span', languageName));
    },

    selectedInputSystem: {
      displayName:    this.activePane.element(by.id('languageDisplayName')),
      tag:            this.activePane.element(by.binding(
        '$ctrl.iscInputSystemViewModels[$ctrl.selectedInputSystemId].inputSystem.tag')),
      abbreviationInput: this.activePane.element(by.model(
        '$ctrl.iscInputSystemViewModels[$ctrl.selectedInputSystemId].inputSystem.abbreviation')),
      rightToLeftCheckbox: this.activePane.element(by.model(
        '$ctrl.iscInputSystemViewModels[$ctrl.selectedInputSystemId].inputSystem.isRightToLeft')),
      specialDropdown: this.activePane.element(by.id('special')),
      purposeDropdown: this.activePane.element(by.id('purpose')),
      ipaVariantInput: this.activePane.element(by.id('ipaVariant')),
      voiceVariantInput: this.activePane.element(by.id('voiceVariant')),
      scriptDropdown: this.activePane.element(by.id('script')),
      regionDropdown: this.activePane.element(by.id('region')),
      variantInput:   this.activePane.element(by.id('variant'))
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
      .element(by.model('$ctrl.fccFieldConfig[$ctrl.fccCurrentField.name].hideIfEmpty')),
    widthInput: this.activePane
      .element(by.model('$ctrl.fccFieldConfig[$ctrl.fccCurrentField.name].width')),
    captionHiddenIfEmptyCheckbox: this.activePane
      .element(by.model('$ctrl.fccFieldConfig[$ctrl.fccCurrentField.name].captionHideIfEmpty')),
    inputSystemTags: this.activePane
      .all(by.repeater('inputSystemTag in $ctrl.fccCurrentField.inputSystems.fieldOrder')),
    inputSystemCheckboxes: this.activePane
      .all(by.model('$ctrl.fccCurrentField.inputSystems.selecteds[inputSystemTag]')),
    inputSystemUpButton: this.activePane.element(by.id('upButton')),
    inputSystemDownButton: this.activePane.element(by.id('downButton')),
    newCustomFieldButton: this.activePane.element(by.id('configuration-new-field-btn')),
    removeCustomFieldButton: this.activePane.element(by.id('configuration-remove-field-btn'))
  };

  // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
  this.fieldsTab.newCustomFieldButtonClick = function () {
    this.fieldsTab.newCustomFieldButton.click();
    browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
  }.bind(this);

  this.showAllFieldsButton = element(by.id('configuration-show-fields-btn'));

  this.entryFields = this.activePane
    .all(by.repeater('fieldName in $ctrl.fccConfigDirty.entry.fieldOrder'));
  this.senseFields = this.activePane
    .all(by.repeater('fieldName in $ctrl.fccConfigDirty.entry.fields.senses.fieldOrder'));
  this.exampleFields = this.activePane.all(by
    .repeater('fieldName in $ctrl.fccConfigDirty.entry.fields.senses.fields.examples.fieldOrder'));

  this.getFieldByName = function getFieldByName(fieldName) {
    return element(by
      .css('div.tab-pane.active > div > lsc-fields > div > div.col-md-3 dl.picklists'))
      .element(by.cssContainingText('div[data-ng-repeat] > span', fieldName));
  };

  this.hiddenIfEmpty = this.activePane.element(by.id('hideIfEmpty'));
  this.captionHiddenIfEmpty = function () {
    return this.activePane.element(by.id('captionHideIfEmpty'));
  };

  // select language and custom field modals
  this.modal = modal;

}
