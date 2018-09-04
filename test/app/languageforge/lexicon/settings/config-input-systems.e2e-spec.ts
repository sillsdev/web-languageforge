import {protractor} from 'protractor';

import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {ConfigurationPage} from '../shared/configuration.page';

describe('Lexicon E2E Configuration Input Systems', async () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const configPage  = new ConfigurationPage();
  const firstLanguage = 'Maori';
  const lastLanguage  = 'Rarotongan';

  it('setup: login as user, select test project, cannot configure', async () => {
    await loginPage.loginAsUser();
    await projectsPage.get();

    await projectsPage.clickOnProject(constants.testProjectName);
    await expect<any>(configPage.settingsMenuLink.getAttribute('class')).not.toContain('app-settings-available');
  });

  it('setup: login as manager, select test project, goto configuration', async () => {
    await loginPage.loginAsManager();
    await projectsPage.get();

    await projectsPage.clickOnProject(constants.testProjectName);
    await expect<any>(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    await configPage.get();
    await expect<any>(configPage.applyButton.isDisplayed()).toBe(true);
    await expect<any>(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('can select Input Systems tab', async () => {
    await configPage.tabs.inputSystems.click();
    await expect<any>(configPage.inputSystemsPane.newButton.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.moreButton.isDisplayed()).toBe(true);
  });

  it('can select an existing Input System', async () => {
    const language = 'Thai (IPA)';
    const inputSystem = await configPage.inputSystemsPane.getLanguageByName(language);
    await expect<any>(inputSystem.isDisplayed()).toBe(true);
    await inputSystem.click();
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.displayName.getText()).toEqual(language);
    await expect<any>(configPage.applyButton.isEnabled()).toBe(false);
  });

  it('cannot change Special for an existing Input System', async () => {
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('th-fonipa');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isEnabled()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown.isEnabled()).toBe(false);
  });

  it('cannot add another IPA variation, but can add Voice and Variant', async () => {
    await configPage.inputSystemsPane.moreButton.click();
    await expect(configPage.inputSystemsPane.moreButtonGroup.addIpa.getAttribute('class')).toContain('disabled');
    await expect(
      configPage.inputSystemsPane.moreButtonGroup.addVoice.getAttribute('class')).toContain('disabled');
    await expect(configPage.inputSystemsPane.moreButtonGroup.addVariant.getAttribute('class'))
      .not.toContain('disabled');
  });

  it('cannot remove an existing Input System', async () => {
    await expect<any>(configPage.inputSystemsPane.moreButtonGroup.remove.isDisplayed()).toBe(false);
  });

  describe('Select a new Input System Language modal', async () => {

    it('can open the new language modal', async () => {
      await expect<any>(configPage.inputSystemsPane.newButton.isEnabled()).toBe(true);
      await configPage.inputSystemsPane.newButton.click();
      await expect<any>(configPage.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
    });

    it('can search for a language', async () => {
      await expect<any>(configPage.modal.selectLanguage.languageRows.count()).toBe(0);
      await configPage.modal.selectLanguage.searchLanguageInput.sendKeys(firstLanguage + protractor.Key.ENTER);
      await expect<any>(configPage.modal.selectLanguage.languageRows.first().isPresent()).toBe(true);
      await expect<any>(configPage.modal.selectLanguage.firstLanguageName.getText()).toEqual(firstLanguage);
      await expect<any>(configPage.modal.selectLanguage.languageRows.last().isPresent()).toBe(true);
      await expect<any>(configPage.modal.selectLanguage.lastLanguageName.getText()).toEqual(lastLanguage);
    });

    it('can clear language search', async () => {
      await expect<any>(
        configPage.modal.selectLanguage.searchLanguageInput.getAttribute('value')).toEqual(firstLanguage);
      await configPage.modal.selectLanguage.clearSearchButton.click();
      await expect<any>(configPage.modal.selectLanguage.searchLanguageInput.getAttribute('value')).toEqual('');
      await expect<any>(configPage.modal.selectLanguage.languageRows.count()).toBe(0);
    });

    it('can select language', async () => {
      await configPage.modal.selectLanguage.searchLanguageInput.sendKeys(firstLanguage + protractor.Key.ENTER);
      await expect<any>(configPage.modal.selectLanguage.addButton.isPresent()).toBe(true);
      await expect<any>(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(false);
      await configPage.modal.selectLanguage.languageRows.last().click();
      await expect<any>(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(true);
      await expect<any>(configPage.modal.selectLanguage.addButton.getText()).toEqual('Add ' + lastLanguage);
      await configPage.modal.selectLanguage.languageRows.first().click();
      await expect<any>(configPage.modal.selectLanguage.addButton.isEnabled()).toBe(true);
      await expect<any>(configPage.modal.selectLanguage.addButton.getText()).toEqual('Add ' + firstLanguage);
    });

    it('can add language', async () => {
      await configPage.modal.selectLanguage.addButton.click();
      await expect<any>(configPage.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
      await expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

  });

  it('new Input System is selected', async () => {
    await expect<any>(
      configPage.inputSystemsPane.selectedInputSystem.displayName.getText()).toEqual(firstLanguage);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi');
  });

  it('can change Special to IPA', async () => {
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(false);
    await expect<any>(
      configPage.inputSystemsPane.selectedInputSystem.voiceVariantInput.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.regionDropdown.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.variantInput.isDisplayed()).toBe(false);
    await Utils.clickDropdownByValue(
      configPage.inputSystemsPane.selectedInputSystem.specialDropdown, 'IPA transcription');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('can change IPA Variant', async () => {
    await configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.sendKeys('ngati' + protractor.Key.TAB);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-fonipa-x-ngati');
    await configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to Etic', async () => {
    await Utils.clickDropdownByValue(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown, 'Etic');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-fonipa-x-etic');
  });

  it('can change IPA Variant', async () => {
    await configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.sendKeys('ngati' + protractor.Key.TAB);
    await expect<any>(
      configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-fonipa-x-etic-ngati');
    await configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to Emic', async () => {
    await Utils.clickDropdownByValue(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown, 'Emic');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-fonipa-x-emic');
  });

  it('can change IPA Variant', async () => {
    await configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.sendKeys('ngati' + protractor.Key.TAB);
    await expect<any>(
      configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-fonipa-x-emic-ngati');
    await configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.clear();
  });

  it('can change IPA Purpose to unspecified', async () => {
    await Utils.clickDropdownByValue(
      configPage.inputSystemsPane.selectedInputSystem.purposeDropdown, 'unspecified');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('can change Special to Voice', async () => {
    await Utils.clickDropdownByValue(configPage.inputSystemsPane.selectedInputSystem.specialDropdown, 'Voice');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.voiceVariantInput.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-Zxxx-x-audio');
  });

  it('can change Voice Variant', async () => {
    await configPage.inputSystemsPane.selectedInputSystem.voiceVariantInput.sendKeys('ngati' + protractor.Key.TAB);
    await expect<any>(
      configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-Zxxx-x-audio-ngati');
    await configPage.inputSystemsPane.selectedInputSystem.voiceVariantInput.clear();
  });

  it('can change Special to Script / Region / Variant', async () => {
    await Utils.clickDropdownByValue(configPage.inputSystemsPane.selectedInputSystem.specialDropdown,
      'Script / Region / Variant');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    await expect<any>(
      configPage.inputSystemsPane.selectedInputSystem.voiceVariantInput.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.regionDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.variantInput.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-unspecified');
  });

  it('can not add unspecified Variant', async () => {
    await expect<any>(configPage.noticeList.count()).toBe(0);
    await Utils.scrollTop();
    await configPage.applyButton.click();
    await expect<any>(configPage.noticeList.count()).toBe(1);
    await expect(
      configPage.noticeList.get(0).getText()).toContain('Specify at least one Script, Region or Variant');
    await configPage.firstNoticeCloseButton.click();
  });

  it('can change Script', async () => {
    await Utils.clickDropdownByValue(
      configPage.inputSystemsPane.selectedInputSystem.scriptDropdown, new RegExp('Latin$'));
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-Latn');
  });

  it('can change Region', async () => {
    await Utils.clickDropdownByValue(
      configPage.inputSystemsPane.selectedInputSystem.regionDropdown, 'Cook Islands');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-Latn-CK');
  });

  it('can change Variant', async () => {
    await configPage.inputSystemsPane.selectedInputSystem.variantInput.sendKeys('ngati' + protractor.Key.TAB);
    await expect<any>(
      configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-Latn-CK-x-ngati');
  });

  it('can change Special to none', async () => {
    await Utils.clickDropdownByValue(configPage.inputSystemsPane.selectedInputSystem.specialDropdown, 'none');
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.regionDropdown.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.variantInput.isDisplayed()).toBe(false);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi');
  });

  it('can add IPA variation', async () => {
    await Utils.scrollTop();
    await configPage.inputSystemsPane.moreButton.click();
    await configPage.inputSystemsPane.moreButtonGroup.addIpa.click();
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.purposeDropdown.isEnabled()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.ipaVariantInput.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-fonipa');
  });

  it('cannot add another IPA variation', async () => {
    await configPage.inputSystemsPane.moreButton.click();
    await expect(configPage.inputSystemsPane.moreButtonGroup.addIpa.getAttribute('class')).toContain('disabled');
  });

  it('can remove IPA variation', async () => {
    await expect<any>(configPage.inputSystemsPane.moreButtonGroup.remove.isDisplayed()).toBe(true);
    await configPage.inputSystemsPane.moreButtonGroup.remove.click();
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can add Voice variation', async () => {
    await configPage.inputSystemsPane.getLanguageByName(firstLanguage).click();
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi');
    await configPage.inputSystemsPane.moreButton.click();
    await configPage.inputSystemsPane.moreButtonGroup.addVoice.click();
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.voiceVariantInput.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-Zxxx-x-audio');
  });

  it('cannot add another Voice variation', async () => {
    await configPage.inputSystemsPane.moreButton.click();
    await expect(
      configPage.inputSystemsPane.moreButtonGroup.addVoice.getAttribute('class')).toContain('disabled');
  });

  it('can remove Voice variation', async () => {
    await expect<any>(configPage.inputSystemsPane.moreButtonGroup.remove.isDisplayed()).toBe(true);
    await configPage.inputSystemsPane.moreButtonGroup.remove.click();
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can add Variant variation', async () => {
    await configPage.inputSystemsPane.getLanguageByName(firstLanguage).click();
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi');
    await configPage.inputSystemsPane.moreButton.click();
    await configPage.inputSystemsPane.moreButtonGroup.addVariant.click();
    await expect<any>(configPage.noticeList.count()).toBe(0);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.specialDropdown.isEnabled()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.scriptDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.scriptDropdown.isEnabled()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.regionDropdown.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.regionDropdown.isEnabled()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.variantInput.isDisplayed()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.variantInput.isEnabled()).toBe(true);
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('mi-unspecified');
  });

  it('can always add another Variant variation', async () => {
    await configPage.inputSystemsPane.moreButton.click();
    await expect(
      configPage.inputSystemsPane.moreButtonGroup.addVariant.getAttribute('class')).not.toContain('disabled');
  });

  it('can remove Variant variation', async () => {
    await expect<any>(configPage.inputSystemsPane.moreButtonGroup.remove.isDisplayed()).toBe(true);
    await configPage.inputSystemsPane.moreButtonGroup.remove.click();
    await expect<any>(configPage.inputSystemsPane.selectedInputSystem.tag.getText()).toEqual('en');
  });

  it('can save new Input System', async () => {
    await expect<any>(configPage.noticeList.count()).toBe(0);
    await configPage.applyButton.click();
    await expect<any>(configPage.noticeList.count()).toBe(1);
    await expect(configPage.noticeList.get(0).getText()).toContain('Configuration updated successfully');
  });

});
