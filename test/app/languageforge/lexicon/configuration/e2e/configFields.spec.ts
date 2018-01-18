import {} from 'jasmine';
// Importing protractor to make usages of protractor.Key work - Ben Kastner 2018-01-18
import { protractor } from 'protractor';

describe('Configuration Fields', () => {
  const constants     = require('../../../../testConstants');
  const loginPage     = require('../../../../bellows/pages/loginPage.js');
  const projectsPage  = require('../../../../bellows/pages/projectsPage.js');
  const util          = require('../../../../bellows/pages/utils.js');
  const configPage    = require('../../pages/configurationPage.js');
  const displayName = 'cust_name';

  it('setup: login as manager, select test project, goto configuration', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    configPage.get();
    expect(configPage.applyButton.isDisplayed()).toBe(true);
    expect(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('can select Fields tab', () => {
    configPage.tabs.fields.click();
    expect(configPage.fieldsTab.newCustomFieldButton.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.fieldSetupLabel.isDisplayed()).toBe(true);
  });

  it('can select POS Field; appropriate controls shown', () => {
    configPage.getFieldByName('Part of Speech').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Part of Speech Field Setup');
    expect(configPage.fieldsTab.hiddenIfEmptyCheckbox.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.widthInput.isPresent()).toBe(false);
    expect(configPage.fieldsTab.captionHiddenIfEmptyCheckbox.isPresent()).toBe(false);
    expect(configPage.fieldsTab.inputSystemTags.count()).toBe(0);
  });

  it('can select Word Field; appropriate controls shown', () => {
    configPage.getFieldByName('Word').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Word Field Setup');
    expect(configPage.fieldsTab.hiddenIfEmptyCheckbox.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.widthInput.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.captionHiddenIfEmptyCheckbox.isPresent()).toBe(false);
    expect(configPage.fieldsTab.inputSystemTags.count()).toBe(4);
  });

  it('can move an Input System upwards', () => {
    expect(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('th');
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('tipa');
    expect(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('taud');
    expect(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('en');
    expect(configPage.fieldsTab.inputSystemCheckboxes.first().isSelected()).toBe(true);
    expect(configPage.fieldsTab.inputSystemCheckboxes.get(1).isSelected()).toBe(true);
    expect(configPage.fieldsTab.inputSystemCheckboxes.get(2).isSelected()).toBe(true);
    expect(configPage.fieldsTab.inputSystemCheckboxes.last().isSelected()).toBe(false);
    expect(configPage.fieldsTab.inputSystemUpButton.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(false);
    expect(configPage.fieldsTab.inputSystemDownButton.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(false);
    expect(configPage.applyButton.isEnabled()).toBe(false);
    configPage.fieldsTab.inputSystemTags.last().click();
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(false);
    configPage.fieldsTab.inputSystemUpButton.click();
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('en');
    expect(configPage.applyButton.isEnabled()).toBe(true);
    configPage.fieldsTab.inputSystemUpButton.click();
    configPage.fieldsTab.inputSystemUpButton.click();
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(false);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('en');
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('th');
    expect(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('tipa');
    expect(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('taud');
  });

  it('can move an Input System downwards', () => {
    configPage.fieldsTab.inputSystemDownButton.click();
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('en');
    expect(configPage.applyButton.isEnabled()).toBe(true);
    configPage.fieldsTab.inputSystemDownButton.click();
    configPage.fieldsTab.inputSystemDownButton.click();
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(false);
    expect(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('th');
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('tipa');
    expect(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('taud');
    expect(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('en');
  });

  it('can save changed field settings', () => {
    expect(configPage.noticeList.count()).toBe(0);
    configPage.applyButton.click();
    expect(configPage.noticeList.count()).toBe(1);
    expect(configPage.noticeList.get(0).getText()).toContain('Configuration updated successfully');
  });

  describe('Add a new Custom Field modal', () => {

    it('can open the new custom field modal', () => {
      expect(configPage.fieldsTab.removeCustomFieldButton.isDisplayed()).toBe(false);
      expect(configPage.fieldsTab.newCustomFieldButton.isEnabled()).toBe(true);
      configPage.fieldsTab.newCustomFieldButtonClick();
      expect(configPage.modal.customField.displayNameInput.isDisplayed()).toBe(true);
      expect(configPage.modal.customField.levelDropdown.isDisplayed()).toBe(true);
      expect(configPage.modal.customField.typeDropdown.isDisplayed()).toBe(true);
      expect(configPage.modal.customField.listCodeDropdown.isPresent()).toBe(false);
      expect(configPage.modal.customField.addButton.isPresent()).toBe(true);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field name', () => {
      expect(configPage.modal.customField.fieldCodeExists.isPresent()).toBe(true);
      expect(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      configPage.modal.customField.displayNameInput.sendKeys(displayName + protractor.Key.ENTER);
      expect(configPage.modal.customField.addButton.getText()).toEqual('Add ' + displayName);
      expect(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field level', () => {
      util.clickDropdownByValue(configPage.modal.customField.levelDropdown, 'Entry Level');
      expect(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field type', () => {
      util.clickDropdownByValue(configPage.modal.customField.typeDropdown,
        'Multi-input-system Text');
      expect(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(true);
    });

    it('can add custom field', () => {
      configPage.modal.customField.addButton.click();
      expect(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual(displayName + ' Field Setup');
      expect(configPage.fieldsTab.removeCustomFieldButton.isDisplayed()).toBe(true);
      expect(configPage.applyButton.isEnabled()).toBe(true);
    });

    it('can re-open the new custom field modal', () => {
      configPage.fieldsTab.newCustomFieldButtonClick();
      expect(configPage.modal.customField.displayNameInput.isDisplayed()).toBe(true);
    });

    it('cannot add a duplicate field name', () => {
      expect(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      configPage.modal.customField.displayNameInput.sendKeys(displayName + protractor.Key.ENTER);
      expect(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(false);
      util.clickDropdownByValue(configPage.modal.customField.levelDropdown, 'Entry Level');
      expect(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(true);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can add a duplicate field name at a different level', () => {
      util.clickDropdownByValue(configPage.modal.customField.levelDropdown, 'Meaning Level');
      expect(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('list code only shows when a list type is selected', () => {
      util.clickDropdownByValue(configPage.modal.customField.typeDropdown,
        'Multi-input-system Text');
      expect(configPage.modal.customField.listCodeDropdown.isPresent()).toBe(false);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(true);
      util.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Multi-option List');
      expect(configPage.modal.customField.listCodeDropdown.isDisplayed()).toBe(true);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(false);
      util.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Option List');
      expect(configPage.modal.customField.listCodeDropdown.isDisplayed()).toBe(true);
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a list code', () => {
      util.clickDropdownByValue(configPage.modal.customField.listCodeDropdown, 'Part of Speech');
      expect(configPage.modal.customField.addButton.isEnabled()).toBe(true);
    });

    it('can cancel custom field modal', () => {
      configPage.modal.customField.displayNameInput.sendKeys(protractor.Key.ESCAPE);
      expect(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      expect(configPage.applyButton.isEnabled()).toBe(true);
    });

  });

  it('can delete a newly created custom field', () => {
    configPage.fieldsTab.removeCustomFieldButton.click();
    expect(configPage.fieldsTab.removeCustomFieldButton.isDisplayed()).toBe(false);
  });

  it('can re-create custom field and save configuration', () => {
    configPage.fieldsTab.newCustomFieldButtonClick();
    configPage.modal.customField.displayNameInput.sendKeys(displayName + protractor.Key.ENTER);
    util.clickDropdownByValue(configPage.modal.customField.levelDropdown, 'Entry Level');
    util.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Multi-input-system Text');
    configPage.modal.customField.addButton.click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual(displayName + ' Field Setup');
    configPage.applyButton.click();
  });

  it('cannot delete a newly saved custom field', () => {
    expect(configPage.fieldsTab.removeCustomFieldButton.isDisplayed()).toBe(false);
  });

  // this regression test added because the code has been fixed at least once before. IJH 2016-05
  it('does not regress Input System selection', () => {
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Sentence').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Sentence Field Setup');
    configPage.getFieldByName('Translation').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Translation Field Setup');
    configPage.getFieldByName('Literal Meaning').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Literal Meaning Field Setup');
    expect(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('en');
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('th');
    expect(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('tipa');
    expect(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('taud');
    expect(configPage.fieldsTab.inputSystemCheckboxes.first().isSelected()).toBe(true);
    expect(configPage.fieldsTab.inputSystemCheckboxes.get(1).isSelected()).toBe(false);
    expect(configPage.fieldsTab.inputSystemCheckboxes.last().isSelected()).toBe(false);
    configPage.getFieldByName('Sentence').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Sentence Field Setup');
    configPage.getFieldByName('Literal Meaning').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Literal Meaning Field Setup');
    expect(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('en');
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('th');
    expect(configPage.fieldsTab.inputSystemTags.get(2).getText()).toEqual('tipa');
    expect(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('taud');
    expect(configPage.fieldsTab.inputSystemCheckboxes.first().isSelected()).toBe(true);
    expect(configPage.fieldsTab.inputSystemCheckboxes.get(1).isSelected()).toBe(false);
    expect(configPage.fieldsTab.inputSystemCheckboxes.last().isSelected()).toBe(false);
  });

});
