import {} from 'jasmine';
import { protractor} from 'protractor';
import { BellowsLoginPage } from '../../../../bellows/pages/loginPage.js';
import { ProjectsPage } from '../../../../bellows/pages/projectsPage.js';
import { Utils } from '../../../../bellows/pages/utils.js';
import { ConfigurationPage } from '../../pages/configurationPage.js';

describe('Configuration Input Systems', () => {
  const constants     = require('../../../../testConstants');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const util = new Utils();
  const configPage  = new ConfigurationPage();
  const firstLanguage = 'Maori';
  const lastLanguage  = 'Rarotongan';

  it('setup: login as user, select test project, cannot configure', () => {
    loginPage.loginAsUser();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect<any>(configPage.settingsMenuLink.isDisplayed()).toBe(false);
  });

  it('setup: login as manager, select test project, goto configuration', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    expect<any>(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    configPage.get();
    expect<any>(configPage.applyButton.isDisplayed()).toBe(true);
    expect<any>(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('can select Input Systems tab', () => {
    configPage.tabs.inputSystems.click();
    expect<any>(configPage.inputSystemsTab.newButton.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.moreButton.isDisplayed()).toBe(true);
  });

  it('can select an existing Input System', () => {
    const language = 'Thai (IPA)';
    const inputSystem = configPage.inputSystemsTab.getLanguageByName(language);
    expect<any>(inputSystem.isDisplayed()).toBe(true);
    inputSystem.click();
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.displayName.getText()).toEqual(language);
    expect<any>(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('cannot change Special for an existing Input System', () => {
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('th-fonipa');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isEnabled()).toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isEnabled()).toBe(false);
  });

  it('cannot add another IPA variation, but can add Voice and Variant', () => {
    configPage.inputSystemsTab.moreButton.click();
    expect(configPage.inputSystemsTab.moreButtonGroup.addIpa.getAttribute('class'))
      .toContain('disabled');
    expect(configPage.inputSystemsTab.moreButtonGroup.addVoice.getAttribute('class'))
      .toContain('disabled');
    expect(configPage.inputSystemsTab.moreButtonGroup.addVariant.getAttribute('class'))
      .not.toContain('disabled');
  });

  it('cannot remove an existing Input System', () => {
    expect<any>(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(false);
  });

  describe('Select a new Input System Language modal', () => {

    it('can open the new language modal', () => {
      expect<any>(configPage.inputSystemsTab.newButton.isEnabled()).toBe(true);
      configPage.inputSystemsTab.newButton.click();
      expect<any>(configPage.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
    });

    it('can search for a language', () => {
      expect<any>(configPage.modal.selectLanguage.languageRows.count()).toBe(0);
      configPage.modal.selectLanguage.searchLanguageInput
        .sendKeys(firstLanguage + protractor.Key.ENTER);
      expect<any>(configPage.modal.selectLanguage.languageRows.first().isPresent()).toBe(true);
      expect<any>(configPage.modal.selectLanguage.firstLanguageName.getText()).toEqual(firstLanguage);
      expect<any>(configPage.modal.selectLanguage.languageRows.last().isPresent()).toBe(true);
      expect<any>(configPage.modal.selectLanguage.lastLanguageName.getText()).toEqual(lastLanguage);
    });

    it('can clear language search', () => {
      expect<any>(configPage.modal.selectLanguage.searchLanguageInput.getAttribute('value'))
        .toEqual(firstLanguage);
      configPage.modal.selectLanguage.clearSearchButton.click();
      expect<any>(configPage.modal.selectLanguage.searchLanguageInput.getAttribute('value')).toEqual('');
      expect<any>(configPage.modal.selectLanguage.languageRows.count()).toBe(0);
    });

    it('can select language', () => {
      configPage.modal.selectLanguage.searchLanguageInput
        .sendKeys(firstLanguage + protractor.Key.ENTER);
      expect<any>(configPage.modal.selectLanguage.addButton.isPresent()).toBe(true);
      expect<any>(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(false);
      configPage.modal.selectLanguage.languageRows.last().click();
      expect<any>(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(true);
      expect<any>(configPage.modal.selectLanguage.addButton.getText()).toEqual('Add ' + lastLanguage);
      configPage.modal.selectLanguage.languageRows.first().click();
      expect<any>(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(true);
      expect<any>(configPage.modal.selectLanguage.addButton.getText()).toEqual('Add ' + firstLanguage);
    });

    it('can add language', () => {
      configPage.modal.selectLanguage.addButton.click();
      expect<any>(configPage.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
      expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

  });

  it('new Input System is selected', () => {
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.displayName.getText())
      .toEqual(firstLanguage);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
  });

  it('can change Special to IPA', () => {
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed())
      .toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed())
      .toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed())
      .toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed())
      .toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(false);
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown,
      'IPA transcription');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('can change IPA Variant', () => {
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-ngati');
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to Etic', () => {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown,
      'Etic');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-etic');
  });

  it('can change IPA Variant', () => {
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-etic-ngati');
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to Emic', () => {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown,
      'Emic');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-emic');
  });

  it('can change IPA Variant', () => {
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-fonipa-x-emic-ngati');
    configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to unspecified', () => {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown,
      'unspecified');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('can change Special to Voice', () => {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown,
      'Voice');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed())
      .toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed())
      .toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed())
      .toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-Zxxx-x-audio');
  });

  it('can change Voice Variant', () => {
    configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-Zxxx-x-audio-ngati');
    configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.clear();
  });

  it('can change Special to Script / Region / Variant', () => {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown,
      'Script / Region / Variant');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed())
      .toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-unspecified');
  });

  it('can not add unspecified Variant', () => {
    expect<any>(configPage.noticeList.count()).toBe(0);
    util.scrollTop();
    configPage.applyButton.click();
    expect<any>(configPage.noticeList.count()).toBe(1);
    expect(configPage.noticeList.get(0).getText())
      .toContain('Specify at least one Script, Region or Variant');
    configPage.firstNoticeCloseButton.click();
  });

  it('can change Script', () => {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown,
      new RegExp('Latin$'));
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-Latn');
  });

  it('can change Region', () => {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.regionDropdown,
      'Cook Islands');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-Latn-CK');
  });

  it('can change Variant', () => {
    configPage.inputSystemsTab.selectedInputSystem.variantInput
      .sendKeys('ngati' + protractor.Key.TAB);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText())
      .toEqual('mi-Latn-CK-x-ngati');
  });

  it('can change Special to none', () => {
    util.clickDropdownByValue(configPage.inputSystemsTab.selectedInputSystem.specialDropdown,
      'none');
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(false);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
  });

  it('can add IPA variation', () => {
    util.scrollTop();
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addIpa.click();
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.purposeDropdown.isEnabled()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('cannot add another IPA variation', () => {
    configPage.inputSystemsTab.moreButton.click();
    expect(configPage.inputSystemsTab.moreButtonGroup.addIpa.getAttribute('class'))
      .toContain('disabled');
  });

  it('can remove IPA variation', () => {
    expect<any>(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can add Voice variation', () => {
    configPage.inputSystemsTab.getLanguageByName(firstLanguage).click();
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addVoice.click();
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.voiceVariantInput.isDisplayed())
      .toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-Zxxx-x-audio');
  });

  it('cannot add another Voice variation', () => {
    configPage.inputSystemsTab.moreButton.click();
    expect(configPage.inputSystemsTab.moreButtonGroup.addVoice.getAttribute('class'))
      .toContain('disabled');
  });

  it('can remove Voice variation', () => {
    expect<any>(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can add Variant variation', () => {
    configPage.inputSystemsTab.getLanguageByName(firstLanguage).click();
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi');
    configPage.inputSystemsTab.moreButton.click();
    configPage.inputSystemsTab.moreButtonGroup.addVariant.click();
    expect<any>(configPage.noticeList.count()).toBe(0);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.scriptDropdown.isEnabled()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.regionDropdown.isEnabled()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.variantInput.isDisplayed()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.variantInput.isEnabled()).toBe(true);
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('mi-unspecified');
  });

  it('can always add another Variant variation', () => {
    configPage.inputSystemsTab.moreButton.click();
    expect(configPage.inputSystemsTab.moreButtonGroup.addVariant.getAttribute('class'))
      .not.toContain('disabled');
  });

  it('can remove Variant variation', () => {
    expect<any>(configPage.inputSystemsTab.moreButtonGroup.remove.isDisplayed()).toBe(true);
    configPage.inputSystemsTab.moreButtonGroup.remove.click();
    expect<any>(configPage.inputSystemsTab.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can save new Input System', () => {
    expect<any>(configPage.noticeList.count()).toBe(0);
    configPage.applyButton.click();
    expect<any>(configPage.noticeList.count()).toBe(1);
    expect(configPage.noticeList.get(0).getText()).toContain('Configuration updated successfully');
  });

});
