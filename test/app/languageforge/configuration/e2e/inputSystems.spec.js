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
    expect(configPage.inputSystemsTab.moreButtonGroup.isDisplayed()).toBe(true);
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
/*  
  it('can select new Input System', function() {
    browser.pause();
    configPage.inputSystemsTab.getLanguageByName(firstLanguage).click();
//    util.setCheckbox(configPage.hiddenIfEmpty, false);
//    configPage.applyButton.click();
  });
*/  
});
