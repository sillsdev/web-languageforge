'use strict';

describe('Configuration Input Systems', function() {
  var constants    = require('../../../testConstants'),
      loginPage    = require('../../../bellows/pages/loginPage.js'),
      projectsPage = require('../../../bellows/pages/projectsPage.js'),
      util         = require('../../../bellows/pages/util.js'),
      dbePage      = require('../../pages/dbePage.js'),
      dbeUtil      = require('../../pages/dbeUtil.js'),
      configPage   = require('../../pages/configurationPage.js'),
      firstLanguage = 'Maori',
      lastLanguage = 'Rarotongan';
  
  it('setup: login as user, select test project, cannot configure', function() {
    loginPage.loginAsUser();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect(configPage.settingsMenuLink.isDisplayed()).toBe(false);
  });

  it('setup: login as manager, select test project, goto configuration', function() {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    configPage.get();
    expect(configPage.applyButton.isDisplayed()).toBe(true);
    expect(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('can select Input Systems tab', function() {
    configPage.tabs.inputSystems.click();
    expect(configPage.inputSystemsTab.newButton.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.moreButton.isDisplayed()).toBe(true);
  });
  
  it('can select an Input System', function() {
    var language =  'English',
      englishInputSystem = configPage.inputSystemsTab.getLanguageByName(language);
    expect(englishInputSystem.isDisplayed()).toBe(true);
    englishInputSystem.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.displayName.getText()).toEqual(language);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });
  
  it('cannot remove an existing Input System', function() {
    configPage.inputSystemsTab.moreButton.click();
    expect(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(false);
  });
  
  describe('Select a new Input System Language modal', function() {
    
    it('can open the new language modal', function() {
      expect(configPage.inputSystemsTab.newButton.isEnabled()).toBe(true);
      configPage.inputSystemsTab.newButton.click();
      expect(configPage.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
    });
    
    it('can search for a language', function() {
      expect(configPage.modal.selectLanguage.firstLanguageRow.isPresent()).toBe(false);
      configPage.modal.selectLanguage.searchLanguageInput.sendKeys(firstLanguage + protractor.Key.ENTER);
      expect(configPage.modal.selectLanguage.firstLanguageRow.isPresent()).toBe(true);
      expect(configPage.modal.selectLanguage.firstLanguageName.getText()).toEqual(firstLanguage);
      expect(configPage.modal.selectLanguage.lastLanguageRow.isPresent()).toBe(true);
      expect(configPage.modal.selectLanguage.lastLanguageName.getText()).toEqual(lastLanguage);
    });

    it('can clear language search', function() {
      expect(configPage.modal.selectLanguage.searchLanguageInput.getAttribute('value')).toEqual(firstLanguage);
      configPage.modal.selectLanguage.clearSearchButton.click();
      expect(configPage.modal.selectLanguage.searchLanguageInput.getAttribute('value')).toEqual('');
      expect(configPage.modal.selectLanguage.firstLanguageRow.isPresent()).toBe(false);
    });

    it('can select language', function() {
      configPage.modal.selectLanguage.searchLanguageInput.sendKeys(firstLanguage + protractor.Key.ENTER);
      expect(configPage.modal.selectLanguage.addButton.isPresent()).toBe(true);
      expect(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(false);
      configPage.modal.selectLanguage.lastLanguageRow.click();
      expect(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(true);
      expect(configPage.modal.selectLanguage.addButton.getText()).toEqual('Add ' + lastLanguage);
      configPage.modal.selectLanguage.firstLanguageRow.click();
      expect(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(true);
      expect(configPage.modal.selectLanguage.addButton.getText()).toEqual('Add ' + firstLanguage);
    });

    it('can add language', function() {
      configPage.modal.selectLanguage.addButton.click();
      expect(configPage.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
    });
    
  });
  
  it('new Input System is selected', function() {
    expect(configPage.inputSystemsTab.selectedInputSystem.displayName.getText()).toEqual(firstLanguage);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
  });
  
  it('can change Special to IPA', function() {
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(false);
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown, 'IPA transcription');
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(true);
  });
  
  it('can change Special to Voice', function() {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown, 'Voice');
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed()).toBe(true);
  });
  
  it('can change Special to Script / Region / Variant', function() {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown, 'Script / Region / Variant');
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(true);
  });
  
  it('can change Special to none', function() {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown, 'none');
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(false);
  });
  
  it('can add IPA variation', function() {
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addIpa.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(true);
  });
  
  it('can remove IPA variation', function() {
    configPage.inputSystemsTab.moreButton.click();
    expect(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });
  
  it('can add Voice variation', function() {
    configPage.inputSystemsTab.getLanguageByName(firstLanguage).click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addVoice.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed()).toBe(true);
  });
  
  it('can remove Voice variation', function() {
    configPage.inputSystemsTab.moreButton.click();
    expect(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });
  
  it('can add Variant variation', function() {
    configPage.inputSystemsTab.getLanguageByName(firstLanguage).click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addVariant.click();
    expect(configPage.noticeList.count()).toBe(0);
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(true);
  });
  
  it('can remove Variant variation', function() {
    configPage.inputSystemsTab.moreButton.click();
    expect(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });
  
  it('can save new Input System', function() {
    expect(configPage.noticeList.count()).toBe(0);
    configPage.applyButton.click();
    expect(configPage.noticeList.count()).toBe(1);
    expect(configPage.noticeList.get(0).getText()).toContain('configuration updated successfully');
  });
  
});
