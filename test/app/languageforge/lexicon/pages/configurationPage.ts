import {browser, by, element} from 'protractor';

import {Utils} from '../../../bellows/pages/utils';
import {LexModals} from './lexModals';

export class ConfigurationPage {
  private readonly utils = new Utils();

  modal = new LexModals();

  noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  firstNoticeCloseButton = this.noticeList.first().element(by.className('close'));

  settingsMenuLink = element(by.id('settings-dropdown-button'));
  configurationLink = element(by.id('dropdown-configuration'));

  get() {
    this.utils.scrollTop();
    this.settingsMenuLink.click();
    this.configurationLink.click();
  }

  applyButton = element(by.id('configuration-apply-btn'));

  private readonly tabElements = element.all(by.tagName('pui-tab'));

  tab() {
    return this.tabElements.first();
  }

  activePane = element(by.css('div.tab-pane.active'));

  getTabByName(tabName: string) {
    return element(by.cssContainingText('pui-tabset .tab-links .tab-link', tabName));
  }

  // These will be updated once the pui-tab is updated to support unique id
  tabs = {
    unified:      element(by.linkText('Unified')),
    fields:       element(by.linkText('Fields')),
    inputSystems: element(by.linkText('Input Systems')),
    optionlists:  element(by.linkText('Option Lists'))
  };

  unifiedTab = {
    inputSystem: {
      addGroupButton: this.activePane.element(by.id('add-group-input-system-btn')),
      addInputSystemButton: this.activePane.element(by.id('add-input-system-btn'))
    },
    entry: {
      addGroupButton: this.activePane.element(by.id('add-group-entry-btn')),
      fieldSpecificInputSystemCheckbox: (label: string, inputSystemIndex: number) => {
        return this.getRowByLabel(label).element(by.xpath('..')).element(by.className('field-specific-input-systems'))
          .all(by.repeater('inputSystemSettings in entryField.inputSystems'))
          .get(inputSystemIndex).element(by.className('checkbox'));
      },
      addCustomEntryButton: this.activePane.element(by.id('add-custom-entry-btn'))
    },
    sense: {
      addGroupButton: this.activePane.element(by.id('add-group-sense-btn')),
      fieldSpecificInputSystemCheckbox: (label: string, inputSystemIndex: number) => {
        return this.getRowByLabel(label).element(by.xpath('..')).element(by.className('field-specific-input-systems'))
          .all(by.repeater('inputSystemSettings in senseField.inputSystems'))
          .get(inputSystemIndex).element(by.className('checkbox'));
      },
      addCustomSenseButton: this.activePane.element(by.id('add-custom-sense-btn'))
    },
    example: {
      addGroupButton: this.activePane.element(by.id('add-group-example-btn')),
      fieldSpecificInputSystemCheckbox: (label: string, inputSystemIndex: number) => {
        return this.getRowByLabel(label).element(by.xpath('..')).element(by.className('field-specific-input-systems'))
          .all(by.repeater('inputSystemSettings in exampleField.inputSystems'))
          .get(inputSystemIndex).element(by.className('checkbox'));
      },
      addCustomExampleButton: this.activePane.element(by.id('add-custom-example-btn'))
    },
    fieldSpecificButton: (label: string) => {
      return this.getRowByLabel(label).element(by.className('member-specific-entry-btn'));
    }
  };

  inputSystemsTab = {
    newButton:    this.activePane.element(by.id('configuration-new-btn')),
    moreButton:   this.activePane.element(by.id('configuration-dropdown-btn')),
    moreButtonGroup: {
      addIpa:     this.activePane.element(by.id('configuration-add-ipa-btn')),
      addVoice:   this.activePane.element(by.id('configuration-add-voice-btn')),
      addVariant: this.activePane.element(by.id('configuration-add-variant-btn')),
      remove:     this.activePane.element(by.id('configuration-remove-btn')),
      // tslint:disable-next-line:max-line-length
      // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
      newButtonClick: () => {
        this.inputSystemsTab.newButton.click();
        browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
      }
    },
    getLanguageByName: (languageName: string) =>
      element(by.css('div.tab-pane.active div.col-md-3 dl.picklists'))
        .element(by.cssContainingText('div[data-ng-repeat] span', languageName)),

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

  fieldsTab = {
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
    removeCustomFieldButton: this.activePane.element(by.id('configuration-remove-field-btn')),
    // tslint:disable-next-line:max-line-length
    // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
    newCustomFieldButtonClick: () => {
      this.fieldsTab.newCustomFieldButton.click();
      browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
    }
  };

  showAllFieldsButton = element(by.id('configuration-show-fields-btn'));

  entryFields = this.activePane
    .all(by.repeater('fieldName in $ctrl.fccConfigDirty.entry.fieldOrder'));
  senseFields = this.activePane
    .all(by.repeater('fieldName in $ctrl.fccConfigDirty.entry.fields.senses.fieldOrder'));
  exampleFields = this.activePane.all(by
    .repeater('fieldName in $ctrl.fccConfigDirty.entry.fields.senses.fields.examples.fieldOrder'));

  getFieldByName(fieldName: string) {
    return element(by
      .css('div.tab-pane.active > div > lsc-fields > div > div.col-md-3 dl.picklists'))
      .element(by.cssContainingText('div[data-ng-repeat] > span', fieldName));
  }

  hiddenIfEmpty = this.activePane.element(by.id('hideIfEmpty'));
  captionHiddenIfEmpty() {
    return this.activePane.element(by.id('captionHideIfEmpty'));
  }

  private getRowByLabel(label: string) {
    return this.activePane.element(by.cssContainingText('td', label)).element(by.xpath('..'));
  }
}
