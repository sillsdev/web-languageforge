'use strict';

describe('Configuration Input Systems', function () {
  var constants     = require('../../../../testConstants');
  var loginPage     = require('../../../../bellows/pages/loginPage.js');
  var projectsPage  = require('../../../../bellows/pages/projectsPage.js');
  var util          = require('../../../../bellows/pages/util.js');
  var configPage    = require('../../pages/configurationPage.js');
  var firstLanguage = 'Maori';
  var lastLanguage  = 'Rarotongan';

  it('setup: login as user, select test project, cannot configure', function () {
    loginPage.loginAsUser();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect(configPage.settingsMenuLink.isDisplayed()).toBe(false);
  });

  it('setup: login as manager, select test project, goto configuration', function () {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    configPage.get();
    expect(configPage.applyButton.isDisplayed()).toBe(true);
    expect(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('can select Input Systems tab', function () {
    configPage.tabs.inputSystems.click();
    expect(configPage.inputSystemsTab.newButton.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.moreButton.isDisplayed()).toBe(true);
  });

  it('can select an existing Input System', function () {
    var language = 'Thai (IPA)';
    var inputSystem = configPage.inputSystemsTab.getLanguageByName(language);
    expect(inputSystem.isDisplayed()).toBe(true);
    inputSystem.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.displayName.getText()).toEqual(language);
    expect(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('cannot change Special for an existing Input System', function () {
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('th-fonipa');
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isEnabled()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isEnabled()).toBe(false);
  });

  it('cannot add another IPA variation, but can add Voice and Variant', function () {
    configPage.inputSystemsTab.moreButton.click();
    expect(util.parent(configPage.inputSystemsTab.moreButtonGroup.addIpa).getAttribute('class'))
      .toContain('disabled');
    expect(util.parent(configPage.inputSystemsTab.moreButtonGroup.addVoice).getAttribute('class'))
      .toContain('disabled');
    expect(util.parent(configPage.inputSystemsTab.moreButtonGroup.addVariant).getAttribute('class'))
      .not.toContain('disabled');
  });

  it('cannot remove an existing Input System', function () {
    expect(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(false);
  });

  describe('Select a new Input System Language modal', function () {

    it('can open the new language modal', function () {
      expect(configPage.inputSystemsTab.newButton.isEnabled()).toBe(true);
      configPage.inputSystemsTab.newButtonClick();
      expect(configPage.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
    });

    it('can search for a language', function () {
      expect(configPage.modal.selectLanguage.languageRows.count()).toBe(0);
      configPage.modal.selectLanguage.searchLanguageInput
        .sendKeys(firstLanguage + protractor.Key.ENTER);
      expect(configPage.modal.selectLanguage.firstLanguageRow.isPresent()).toBe(true);
      expect(configPage.modal.selectLanguage.firstLanguageName.getText()).toEqual(firstLanguage);
      expect(configPage.modal.selectLanguage.lastLanguageRow.isPresent()).toBe(true);
      expect(configPage.modal.selectLanguage.lastLanguageName.getText()).toEqual(lastLanguage);
    });

    it('can clear language search', function () {
      expect(configPage.modal.selectLanguage.searchLanguageInput.getAttribute('value'))
        .toEqual(firstLanguage);
      configPage.modal.selectLanguage.clearSearchButton.click();
      expect(configPage.modal.selectLanguage.searchLanguageInput.getAttribute('value')).toEqual('');
      expect(configPage.modal.selectLanguage.languageRows.count()).toBe(0);
    });

    it('can select language', function () {
      configPage.modal.selectLanguage.searchLanguageInput
        .sendKeys(firstLanguage + protractor.Key.ENTER);
      expect(configPage.modal.selectLanguage.addButton.isPresent()).toBe(true);
      expect(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(false);
      configPage.modal.selectLanguage.lastLanguageRow.click();
      expect(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(true);
      expect(configPage.modal.selectLanguage.addButton.getText()).toEqual('Add ' + lastLanguage);
      configPage.modal.selectLanguage.firstLanguageRow.click();
      expect(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(true);
      expect(configPage.modal.selectLanguage.addButton.getText()).toEqual('Add ' + firstLanguage);
    });

    it('can add language', function () {
      configPage.modal.selectLanguage.addButton.click();
      expect(configPage.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
      expect(configPage.applyButton.isEnabled()).toBe(true);
    });

  });

  it('new Input System is selected', function () {
    expect(configPage.inputSystemsTab.selectedInputSystem.displayName.getText())
      .toEqual(firstLanguage);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
  });

  it('can change Special to IPA', function () {
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed())
      .toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed())
      .toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed())
      .toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed())
      .toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(false);
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown,
      'IPA transcription');
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('can change IPA Variant', function () {
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-ngati');
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to Etic', function () {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown,
      'Etic');
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-etic');
  });

  it('can change IPA Variant', function () {
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-etic-ngati');
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to Emic', function () {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown,
      'Emic');
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-emic');
  });

  it('can change IPA Variant', function () {
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-emic-ngati');
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to unspecified', function () {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown,
      'unspecified');
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('can change Special to Voice', function () {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown,
      'Voice');
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed())
      .toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed())
      .toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed())
      .toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-Zxxx-x-audio');
  });

  it('can change Voice Variant', function () {
    configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-Zxxx-x-audio-ngati');
    configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.clear();
  });

  it('can change Special to Script / Region / Variant', function () {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown,
      'Script / Region / Variant');
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed())
      .toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-unspecified');
  });

  it('can not add unspecified Variant', function () {
    expect(configPage.noticeList.count()).toBe(0);
    configPage.applyButton.click();
    expect(configPage.noticeList.count()).toBe(1);
    expect(configPage.noticeList.get(0).getText())
      .toContain('Specify at least one Script, Region or Variant');
    configPage.firstNoticeCloseButton.click();
  });

  it('can change Script', function () {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown,
      'Latin$');
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-Latn');
  });

  it('can change Region', function () {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.regionDropdown,
      'Cook Islands');
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-Latn-CK');
  });

  it('can change Variant', function () {
    configPage.inputSystemsTab.selectedInputSystem.variantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-Latn-CK-x-ngati');
  });

  it('can change Special to none', function () {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown,
      'none');
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(false);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
  });

  it('can add IPA variation', function () {
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addIpa.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isEnabled()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('cannot add another IPA variation', function () {
    configPage.inputSystemsTab.moreButton.click();
    expect(util.parent(configPage.inputSystemsTab.moreButtonGroup.addIpa).getAttribute('class'))
      .toContain('disabled');
  });

  it('can remove IPA variation', function () {
    expect(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can add Voice variation', function () {
    configPage.inputSystemsTab.getLanguageByName(firstLanguage).click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addVoice.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed())
      .toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-Zxxx-x-audio');
  });

  it('cannot add another Voice variation', function () {
    configPage.inputSystemsTab.moreButton.click();
    expect(util.parent(configPage.inputSystemsTab.moreButtonGroup.addVoice).getAttribute('class'))
      .toContain('disabled');
  });

  it('can remove Voice variation', function () {
    expect(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can add Variant variation', function () {
    configPage.inputSystemsTab.getLanguageByName(firstLanguage).click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addVariant.click();
    expect(configPage.noticeList.count()).toBe(0);
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isEnabled()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isEnabled()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.variantInput.isEnabled()).toBe(true);
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-unspecified');
  });

  it('can always add another Variant variation', function () {
    configPage.inputSystemsTab.moreButton.click();
    expect(util.parent(configPage.inputSystemsTab.moreButtonGroup.addVariant).getAttribute('class'))
      .not.toContain('disabled');
  });

  it('can remove Variant variation', function () {
    expect(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can save new Input System', function () {
    expect(configPage.noticeList.count()).toBe(0);
    configPage.applyButton.click();
    expect(configPage.noticeList.count()).toBe(1);
    expect(configPage.noticeList.get(0).getText()).toContain('configuration updated successfully');
  });

});
