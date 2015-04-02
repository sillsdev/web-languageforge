'use strict';

describe('Configuration Fields', function() {
  var constants     = require('../../../../testConstants');
  var loginPage     = require('../../../../bellows/pages/loginPage.js');
  var projectsPage  = require('../../../../bellows/pages/projectsPage.js');
  var configPage    = require('../../pages/configurationPage.js');
  
  it('setup: login as manager, select test project, goto configuration', function() {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    configPage.get();
    expect(configPage.applyButton.isDisplayed()).toBe(true);
    expect(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('can select Fields tab', function() {
    configPage.tabs.fields.click();
    expect(configPage.fieldsTab.newCustomFieldButton.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.fieldSetupLabel.isDisplayed()).toBe(true);
  });

  it('can select POS Field; appropriate controls shown', function() {
    configPage.getFieldByName('Part of Speech').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Part of Speech Field Setup');
    expect(configPage.fieldsTab.hiddenIfEmptyCheckbox.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.displayMultilineCheckbox.isPresent()).toBe(false);
    expect(configPage.fieldsTab.widthInput.isPresent()).toBe(false);
    expect(configPage.fieldsTab.captionHiddenIfEmptyCheckbox.isPresent()).toBe(false);
    expect(configPage.fieldsTab.inputSystemTags.count()).toBe(0);    
  });

  it('can select Word Field; appropriate controls shown', function() {
    configPage.getFieldByName('Word').click();
    expect(configPage.fieldsTab.fieldSetupLabel.getText()).toEqual('Word Field Setup');
    expect(configPage.fieldsTab.hiddenIfEmptyCheckbox.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.displayMultilineCheckbox.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.widthInput.isDisplayed()).toBe(true);
    expect(configPage.fieldsTab.captionHiddenIfEmptyCheckbox.isPresent()).toBe(false);
    expect(configPage.fieldsTab.inputSystemTags.count()).toBe(3);    
  });

  it('can move an Input System upwards', function() {
    expect(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('th');
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('tipa');
    expect(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('en');
    expect(configPage.fieldsTab.inputSystemCheckboxes.first().isSelected()).toBe(true);
    expect(configPage.fieldsTab.inputSystemCheckboxes.get(1).isSelected()).toBe(true);
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
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('en');
    expect(configPage.applyButton.isEnabled()).toBe(true);
    configPage.fieldsTab.inputSystemUpButton.click();
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(false);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('en');
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('th');
    expect(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('tipa');
  });

  it('can move an Input System downwards', function() {
    configPage.fieldsTab.inputSystemDownButton.click();
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('en');
    expect(configPage.applyButton.isEnabled()).toBe(true);
    configPage.fieldsTab.inputSystemDownButton.click();
    expect(configPage.fieldsTab.inputSystemUpButton.isEnabled()).toBe(true);
    expect(configPage.fieldsTab.inputSystemDownButton.isEnabled()).toBe(false);
    expect(configPage.fieldsTab.inputSystemTags.first().getText()).toEqual('th');
    expect(configPage.fieldsTab.inputSystemTags.get(1).getText()).toEqual('tipa');
    expect(configPage.fieldsTab.inputSystemTags.last().getText()).toEqual('en');
  });
  
  it('can save changed field settings', function() {
    expect(configPage.noticeList.count()).toBe(0);
    configPage.applyButton.click();
    expect(configPage.noticeList.count()).toBe(1);
    expect(configPage.noticeList.get(0).getText()).toContain('configuration updated successfully');
  });
  
});
