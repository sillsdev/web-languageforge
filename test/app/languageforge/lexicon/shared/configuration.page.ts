import {browser, by, element} from 'protractor';

import {Utils} from '../../../bellows/shared/utils';
import {LexModals} from './lex-modals.util';

export class ConfigurationPage {
  modal = new LexModals();

  noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  firstNoticeCloseButton = this.noticeList.first().element(by.className('close'));

  settingsMenuLink = element(by.id('settings-dropdown-button'));
  configurationLink = element(by.id('dropdown-configuration'));

  async get() {
    await Utils.scrollTop();
    await this.settingsMenuLink.click();
    return this.configurationLink.click();
  }

  applyButton = element(by.id('configuration-apply-btn'));

  private readonly activePane = element(by.css('div.tab-pane.active'));

  // These will be updated once the pui-tab is updated to support unique id
  tabs = {
    unified:      element(by.linkText('Fields')),
    inputSystems: element(by.linkText('Input Systems')),
    optionlists:  element(by.linkText('Option Lists'))
  };

  unifiedPane = {
    inputSystem: {
      addGroupButton: this.activePane.element(by.id('add-group-input-system-btn')),
      selectAll: {
        observer: this.activePane.element(by.id('input-system-select-all-observer-checkbox')),
        commenter: this.activePane.element(by.id('input-system-select-all-commenter-checkbox')),
        contributor: this.activePane.element(by.id('input-system-select-all-contributor-checkbox')),
        manager: this.activePane.element(by.id('input-system-select-all-manager-checkbox')),
        groups: () => {
          return this.activePane.all(by.className('input-system-select-all-group-checkbox'));
        }
      },
      rows: () => {
        return this.activePane.all(by.repeater('inputSystem in $ctrl.unifiedViewModel.inputSystems.settings'));
      },
      rowLabel: (rowIndex: number) => {
        return this.unifiedPane.inputSystem.rows().get(rowIndex).element(by.className('row-label'));
      },
      columnCheckboxes: (column: string) => {
        // column values: 'select-row', 'observer', 'commenter', 'contributor', 'manager'.
        return this.unifiedPane.inputSystem.rows().all(by.className(column + '-checkbox'));
      },
      groupColumnCheckboxes: (groupIndex: number) => {
        return this.unifiedPane.inputSystem.rows().all(by.className('checkbox-group-' + groupIndex));
      },
      removeGroupButton: (groupIndex: number) => {
        return this.activePane.element(by.id('table-header'))
          .element(by.className('remove-button-group-' + groupIndex));
      },
      addInputSystemButton: this.activePane.element(by.id('add-input-system-btn'))
    },
    entry: {
      addGroupButton: this.activePane.element(by.id('add-group-entry-btn')),
      selectAll: {
        observer: this.activePane.element(by.id('entry-select-all-observer-checkbox')),
        commenter: this.activePane.element(by.id('entry-select-all-commenter-checkbox')),
        contributor: this.activePane.element(by.id('entry-select-all-contributor-checkbox')),
        manager: this.activePane.element(by.id('entry-select-all-manager-checkbox')),
        groups: () => {
          return this.activePane.all(by.className('entry-select-all-group-checkbox'));
        }
      },
      rows: () => {
        return this.activePane.all(by.repeater('entryField in $ctrl.unifiedViewModel.entryFields.settings'));
      },
      rowLabel: (rowIndex: number) => {
        return this.unifiedPane.entry.rows().get(rowIndex).element(by.className('row-label'));
      },
      rowLabelCustomInput: (rowIndex: number) => {
        return this.unifiedPane.entry.rowLabel(rowIndex).element(by.tagName('input'));
      },
      columnCheckboxes: (column: string) => {
        // column values: 'select-row', 'observer', 'commenter', 'contributor', 'manager'.
        return this.unifiedPane.entry.rows().all(by.className(column + '-checkbox'));
      },
      groupColumnCheckboxes: (groupIndex: number) => {
        return this.unifiedPane.entry.rows().all(by.className('checkbox-group-' + groupIndex));
      },
      removeGroupButton: (groupIndex: number) => {
        return this.activePane.element(by.id('entry-header'))
          .element(by.className('remove-button-group-' + groupIndex));
      },
      fieldSpecificInputSystemCheckbox: (label: string|RegExp, inputSystemIndex: number) => {
        return this.getRowByLabel(label).element(by.xpath('..')).element(by.className('field-specific-input-systems'))
          .all(by.repeater('inputSystemSettings in entryField.inputSystems'))
          .get(inputSystemIndex).element(by.className('checkbox'));
      },
      addCustomEntryButton: this.activePane.element(by.id('add-custom-entry-btn'))
    },
    sense: {
      addGroupButton: this.activePane.element(by.id('add-group-sense-btn')),
      selectAll: {
        observer: this.activePane.element(by.id('sense-select-all-observer-checkbox')),
        commenter: this.activePane.element(by.id('sense-select-all-commenter-checkbox')),
        contributor: this.activePane.element(by.id('sense-select-all-contributor-checkbox')),
        manager: this.activePane.element(by.id('sense-select-all-manager-checkbox')),
        groups: () => {
          return this.activePane.all(by.className('sense-select-all-group-checkbox'));
        }
      },
      rows: () => {
        return this.activePane.all(by.repeater('senseField in $ctrl.unifiedViewModel.senseFields.settings'));
      },
      rowLabel: (rowIndex: number) => {
        return this.unifiedPane.sense.rows().get(rowIndex).element(by.className('row-label'));
      },
      rowLabelCustomInput: (rowIndex: number) => {
        return this.unifiedPane.sense.rowLabel(rowIndex).element(by.tagName('input'));
      },
      columnCheckboxes: (column: string) => {
        // column values: 'select-row', 'observer', 'commenter', 'contributor', 'manager'.
        return this.unifiedPane.sense.rows().all(by.className(column + '-checkbox'));
      },
      groupColumnCheckboxes: (groupIndex: number) => {
        return this.unifiedPane.sense.rows().all(by.className('checkbox-group-' + groupIndex));
      },
      removeGroupButton: (groupIndex: number) => {
        return this.activePane.element(by.id('sense-header'))
          .element(by.className('remove-button-group-' + groupIndex));
      },
      fieldSpecificInputSystemCheckbox: (label: string|RegExp, inputSystemIndex: number) => {
        return this.getRowByLabel(label).element(by.xpath('..')).element(by.className('field-specific-input-systems'))
          .all(by.repeater('inputSystemSettings in senseField.inputSystems'))
          .get(inputSystemIndex).element(by.className('checkbox'));
      },
      addCustomSenseButton: this.activePane.element(by.id('add-custom-sense-btn'))
    },
    example: {
      addGroupButton: this.activePane.element(by.id('add-group-example-btn')),
      selectAll: {
        observer: this.activePane.element(by.id('example-select-all-observer-checkbox')),
        commenter: this.activePane.element(by.id('example-select-all-commenter-checkbox')),
        contributor: this.activePane.element(by.id('example-select-all-contributor-checkbox')),
        manager: this.activePane.element(by.id('example-select-all-manager-checkbox')),
        groups: () => {
          return this.activePane.all(by.className('example-select-all-group-checkbox'));
        }
      },
      rows: () => {
        return this.activePane.all(by.repeater('exampleField in $ctrl.unifiedViewModel.exampleFields.settings'));
      },
      rowLabel: (rowIndex: number) => {
        return this.unifiedPane.example.rows().get(rowIndex).element(by.className('row-label'));
      },
      rowLabelCustomInput: (rowIndex: number) => {
        return this.unifiedPane.example.rowLabel(rowIndex).element(by.tagName('input'));
      },
      columnCheckboxes: (column: string) => {
        // column values: 'select-row', 'observer', 'commenter', 'contributor', 'manager'.
        return this.unifiedPane.example.rows().all(by.className(column + '-checkbox'));
      },
      groupColumnCheckboxes: (groupIndex: number) => {
        return this.unifiedPane.example.rows().all(by.className('checkbox-group-' + groupIndex));
      },
      removeGroupButton: (groupIndex: number) => {
        return this.activePane.element(by.id('example-header'))
          .element(by.className('remove-button-group-' + groupIndex));
      },
      fieldSpecificInputSystemCheckbox: (label: string|RegExp, inputSystemIndex: number) => {
        return this.getRowByLabel(label).element(by.xpath('..')).element(by.className('field-specific-input-systems'))
          .all(by.repeater('inputSystemSettings in exampleField.inputSystems'))
          .get(inputSystemIndex).element(by.className('checkbox'));
      },
      addCustomExampleButton: this.activePane.element(by.id('add-custom-example-btn'))
    },
    hiddenIfEmptyCheckbox: (label: string|RegExp) => {
      return this.getRowByLabel(label).element(by.className('hidden-if-empty-checkbox'));
    },
    selectRowCheckbox: (label: string|RegExp) => {
      return this.getRowByLabel(label).element(by.className('select-row-checkbox'));
    },
    observerCheckbox: (label: string|RegExp) => {
      return this.getRowByLabel(label).element(by.className('observer-checkbox'));
    },
    commenterCheckbox: (label: string|RegExp) => {
      return this.getRowByLabel(label).element(by.className('commenter-checkbox'));
    },
    contributorCheckbox: (label: string|RegExp) => {
      return this.getRowByLabel(label).element(by.className('contributor-checkbox'));
    },
    managerCheckbox: (label: string|RegExp) => {
      return this.getRowByLabel(label).element(by.className('manager-checkbox'));
    },
    rowCheckboxes: (label: string|RegExp) => {
      return this.getRowByLabel(label).all(by.css('input[type="checkbox"]:not(.hidden-if-empty-checkbox)'));
    },
    fieldSpecificButton: (label: string|RegExp) => {
      return this.getRowByLabel(label).element(by.className('field-specific-btn'));
    },
    fieldSpecificIcon: (label: string|RegExp) => {
      return this.unifiedPane.fieldSpecificButton(label).element(by.tagName('i'));
    },
    fieldSpecificCaptionHiddenIfEmptyCheckbox: (label: string|RegExp) => {
      return this.getRowByLabel(label).all(by.xpath('following-sibling::tr')).get(0)
        .element(by.className('caption-hidden-if-empty-checkbox'));
    },
    addGroupModal: {
      usernameTypeaheadInput: element(by.id('typeaheadInput')),
      usernameTypeaheadResults: element.all(by.repeater('user in $ctrl.typeahead.users')),
      addMemberSpecificSettingsButton: element(by.id('add-member-specific-settings-btn'))
    }
  };

  inputSystemsPane = {
    newButton:    this.activePane.element(by.id('configuration-new-btn')),
    moreButton:   this.activePane.element(by.id('configuration-dropdown-btn')),
    moreButtonGroup: {
      addIpa:     this.activePane.element(by.id('configuration-add-ipa-btn')),
      addVoice:   this.activePane.element(by.id('configuration-add-voice-btn')),
      addVariant: this.activePane.element(by.id('configuration-add-variant-btn')),
      remove:     this.activePane.element(by.id('configuration-remove-btn')),
      // tslint:disable-next-line:max-line-length
      // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
      newButtonClick: async () => {
        await this.inputSystemsPane.newButton.click();
        return browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
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

  private getRowByLabel(label: string|RegExp) {
    return this.activePane.element(by.cssContainingText('td', label)).element(by.xpath('..'));
  }
}
