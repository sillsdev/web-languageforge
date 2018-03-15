import { protractor } from 'protractor';

import { BellowsLoginPage } from '../../../../bellows/pages/loginPage.js';
import { ProjectsPage } from '../../../../bellows/pages/projectsPage.js';
import { Utils } from '../../../../bellows/pages/utils.js';
import { ConfigurationPage } from '../../pages/configurationPage.js';

describe('Configuration Fields', () => {
  const constants     = require('../../../../testConstants');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const util = new Utils();
  const configPage = new ConfigurationPage();
  const displayName = 'cust_name';

  it('setup: login as manager, select test project, goto configuration', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect<any>(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    configPage.get();
    expect<any>(configPage.applyButton.isDisplayed()).toBe(true);
    expect<any>(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('can select Fields tab', () => {
    configPage.tabs.fields.click();
    expect<any>(configPage.fieldsTab.newCustomFieldButton.isDisplayed()).toBe(true);
    expect<any>(configPage.fieldsTab.fieldSetupLabel.isDisplayed()).toBe(true);
  });

  it('can select POS Field; appropriate controls shown', () => {
    configPage.getFieldByName('Part of Speech').click();
    expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Part of Speech Field Setup');
    expect<any>(configPage.fieldsTab.hiddenIfEmptyCheckbox.isDisplayed()).toBe(true);
    expect<any>(configPage.fieldsTab.widthInput.isPresent()).toBe(false);
    expect<any>(configPage.fieldsTab.captionHiddenIfEmptyCheckbox.isPresent()).toBe(false);
    expect<any>(configPage.fieldsTab.inputSystemTags.count()).toBe(0);
  });

  it('can select Word Field; appropriate controls shown', () => {
    configPage.getFieldByName('Word').click();
    expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Word Field Setup');
    expect<any>(configPage.fieldsTab.hiddenIfEmptyCheckbox.isDisplayed()).toBe(true);
    expect<any>(configPage.fieldsTab.widthInput.isDisplayed()).toBe(true);
    expect<any>(configPage.fieldsTab.captionHiddenIfEmptyCheckbox.isPresent()).toBe(false);
    expect<any>(configPage.fieldsTab.inputSystemTags.count()).toBe(4);
  });

  it('can move an Input System upwards', () => {
    expect<any>(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('th');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('tipa');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('taud');
    expect<any>(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('en');
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.first().isSelected()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.get(1).isSelected()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.get(2).isSelected()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.last().isSelected()).toBe(false);
    expect<any>(configPage.fieldsTab.inputSystemUpButton.isDisplayed()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(false);
    expect<any>(configPage.fieldsTab.inputSystemDownButton.isDisplayed()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(false);
    expect<any>(configPage.applyButton.isEnabled()).toBe(false);
    configPage.fieldsTab.inputSystemTags.last().click();
    expect<any>(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(false);
    configPage.fieldsTab.inputSystemUpButton.click();
    expect<any>(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('en');
    expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    configPage.fieldsTab.inputSystemUpButton.click();
    configPage.fieldsTab.inputSystemUpButton.click();
    expect<any>(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(false);
    expect<any>(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('en');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('th');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('tipa');
    expect<any>(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('taud');
  });

  it('can move an Input System downwards', () => {
    configPage.fieldsTab.inputSystemDownButton.click();
    expect<any>(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('en');
    expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    configPage.fieldsTab.inputSystemDownButton.click();
    configPage.fieldsTab.inputSystemDownButton.click();
    expect<any>(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(false);
    expect<any>(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('th');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('tipa');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('taud');
    expect<any>(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('en');
  });

  it('can save changed field settings', () => {
    expect<any>(configPage.noticeList.count()).toBe(0);
    configPage.applyButton.click();
    expect<any>(configPage.noticeList.count()).toBe(1);
    expect(configPage.noticeList.get(0).getText()).toContain('Configuration updated successfully');
  });

  describe('Add a new Custom Field modal', () => {

    it('can open the new custom field modal', () => {
      expect<any>(configPage.fieldsTab.removeCustomFieldButton.isDisplayed()).toBe(false);
      expect<any>(configPage.fieldsTab.newCustomFieldButton.isEnabled()).toBe(true);
      configPage.fieldsTab.newCustomFieldButtonClick();
      expect<any>(configPage.modal.customField.displayNameInput.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.levelDropdown.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.typeDropdown.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.listCodeDropdown.isPresent()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isPresent()).toBe(true);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field name', () => {
      expect<any>(configPage.modal.customField.fieldCodeExists.isPresent()).toBe(true);
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      configPage.modal.customField.displayNameInput.sendKeys(displayName + protractor.Key.ENTER);
      expect<any>(configPage.modal.customField.addButton.getText()).toEqual('Add ' + displayName);
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field level', () => {
      util.clickDropdownByValue(configPage.modal.customField.levelDropdown, 'Entry Level');
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field type', () => {
      util.clickDropdownByValue(configPage.modal.customField.typeDropdown,
        'Multi-input-system Text');
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
    });

    it('can add custom field', () => {
      configPage.modal.customField.addButton.click();
      expect<any>(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual(displayName + ' Field Setup');
      expect<any>(configPage.fieldsTab.removeCustomFieldButton.isDisplayed()).toBe(true);
      expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

    it('can re-open the new custom field modal', () => {
      configPage.fieldsTab.newCustomFieldButtonClick();
      expect<any>(configPage.modal.customField.displayNameInput.isDisplayed()).toBe(true);
    });

    it('cannot add a duplicate field name', () => {
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      configPage.modal.customField.displayNameInput.sendKeys(displayName + protractor.Key.ENTER);
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
      util.clickDropdownByValue(configPage.modal.customField.levelDropdown, 'Entry Level');
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can add a duplicate field name at a different level', () => {
      util.clickDropdownByValue(configPage.modal.customField.levelDropdown, 'Meaning Level');
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('list code only shows when a list type is selected', () => {
      util.clickDropdownByValue(configPage.modal.customField.typeDropdown,
        'Multi-input-system Text');
      expect<any>(configPage.modal.customField.listCodeDropdown.isPresent()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
      util.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Multi-option List');
      expect<any>(configPage.modal.customField.listCodeDropdown.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
      util.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Option List');
      expect<any>(configPage.modal.customField.listCodeDropdown.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a list code', () => {
      util.clickDropdownByValue(configPage.modal.customField.listCodeDropdown, 'Part of Speech');
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
    });

    it('can cancel custom field modal', () => {
      configPage.modal.customField.displayNameInput.sendKeys(protractor.Key.ESCAPE);
      expect<any>(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

  });

  it('can delete a newly created custom field', () => {
    configPage.fieldsTab.removeCustomFieldButton.click();
    expect<any>(configPage.fieldsTab.removeCustomFieldButton.isDisplayed()).toBe(false);
  });

  it('can re-create custom field and save configuration', () => {
    configPage.fieldsTab.newCustomFieldButtonClick();
    configPage.modal.customField.displayNameInput.sendKeys(displayName + protractor.Key.ENTER);
    util.clickDropdownByValue(configPage.modal.customField.levelDropdown, 'Entry Level');
    util.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Multi-input-system Text');
    configPage.modal.customField.addButton.click();
    expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual(displayName + ' Field Setup');
    configPage.applyButton.click();
  });

  it('cannot delete a newly saved custom field', () => {
    expect<any>(configPage.fieldsTab.removeCustomFieldButton.isDisplayed()).toBe(false);
  });

  // this regression test added because the code has been fixed at least once before. IJH 2016-05
  it('does not regress Input System selection', () => {
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Sentence').click();
    expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Sentence Field Setup');
    configPage.getFieldByName('Translation').click();
    expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Translation Field Setup');
    configPage.getFieldByName('Literal Meaning').click();
    expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Literal Meaning Field Setup');
    expect<any>(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('en');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('th');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('tipa');
    expect<any>(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('taud');
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.first().isSelected()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.get(1).isSelected()).toBe(false);
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.last().isSelected()).toBe(false);
    configPage.getFieldByName('Sentence').click();
    expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Sentence Field Setup');
    configPage.getFieldByName('Literal Meaning').click();
    expect<any>(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Literal Meaning Field Setup');
    expect<any>(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('en');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('th');
    expect<any>(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('tipa');
    expect<any>(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('taud');
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.first().isSelected()).toBe(true);
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.get(1).isSelected()).toBe(false);
    expect<any>(configPage.fieldsTab.inputSystemCheckboxes.last().isSelected()).toBe(false);
  });

});
