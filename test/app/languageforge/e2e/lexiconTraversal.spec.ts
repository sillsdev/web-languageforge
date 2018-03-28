import 'jasmine';
import {browser, ExpectedConditions, protractor} from 'protractor';

import {BellowsLoginPage} from '../../bellows/pages/loginPage';
import {ProjectsPage} from '../../bellows/pages/projectsPage';
import {ConfigurationPage} from '../lexicon/pages/configurationPage';
import {EditorPage} from '../lexicon/pages/editorPage';
import {NewLexProjectPage} from '../lexicon/pages/newLexProjectPage';
import {ProjectSettingsPage} from '../lexicon/pages/projectSettingsPage';
import {ViewSettingsPage} from '../lexicon/pages/viewSettingsPage';

describe('Lexicon E2E Page Traversal', () => {
  const constants = require('../../testConstants');
  const loginPage = new BellowsLoginPage();
  const configurationPage = new ConfigurationPage();
  const projectsPage = new ProjectsPage();
  const projectSettingsPage = new ProjectSettingsPage();
  const newLexProjectPage = new NewLexProjectPage();
  const editorPage = new EditorPage();
  const viewSettingsPage = new ViewSettingsPage();

  describe('Explore configuration page', () => {
    it('Unified tab', () => {
      loginPage.loginAsAdmin();
      configurationPage.get();
      configurationPage.tabs.unified.click();
      configurationPage.unifiedTab.inputSystem.addGroupButton.click();
      browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      browser.wait(
        ExpectedConditions.elementToBeClickable(configurationPage.unifiedTab.inputSystem.addInputSystemButton),
        constants.conditionTimeout);
      configurationPage.unifiedTab.inputSystem.addInputSystemButton.click();
      browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.tabs.unified), constants.conditionTimeout);
      configurationPage.tabs.unified.click();
      configurationPage.unifiedTab.entry.addGroupButton.click();
      browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedTab.entry.addCustomEntryButton),
        constants.conditionTimeout);
      configurationPage.unifiedTab.entry.addCustomEntryButton.click();
      browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedTab.sense.addGroupButton),
        constants.conditionTimeout);
      configurationPage.unifiedTab.sense.addGroupButton.click();
      browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedTab.sense.addCustomSenseButton),
        constants.conditionTimeout);
      configurationPage.unifiedTab.sense.addCustomSenseButton.click();
      browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedTab.example.addGroupButton),
        constants.conditionTimeout);
      configurationPage.unifiedTab.example.addGroupButton.click();
      browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedTab.example.addCustomExampleButton),
        constants.conditionTimeout);
      configurationPage.unifiedTab.example.addCustomExampleButton.click();
      browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.tabs.unified), constants.conditionTimeout);
    });

    it('Fields tab', () => {
      configurationPage.tabs.fields.click();
      configurationPage.fieldsTab.hiddenIfEmptyCheckbox.click();
      configurationPage.fieldsTab.widthInput.click();
      configurationPage.fieldsTab.inputSystemTags.count();
      configurationPage.fieldsTab.inputSystemCheckboxes.count();
      configurationPage.fieldsTab.inputSystemUpButton.click();
      configurationPage.fieldsTab.inputSystemDownButton.click();
    });

    it('Input Systems tab', () => {
      configurationPage.tabs.inputSystems.click();
      configurationPage.inputSystemsTab.moreButton.click();
    });

    it('Option List tab', () => {
      configurationPage.tabs.optionlists.click();
      // There is no model of option list tab - Mark W 2018-01-14
    });
  });

  describe('Explore editor page', () => {
    it('Edit view', () => {
      projectsPage.get();
      projectsPage.clickOnProject(constants.testProjectName);
      editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
      editorPage.noticeList.count();
      editorPage.edit.entriesList.count();
      editorPage.edit.senses.count();
    });

    it('Comments view', () => {
      editorPage.edit.toCommentsLink.click();
      editorPage.comment.commentsList.count();
    });
  });

  it('Explore new lex project page', () => {
    newLexProjectPage.get();
    newLexProjectPage.noticeList.count();
  });

  it('Explore project settings page', () => {
    projectSettingsPage.get(constants.testProjectName);
    projectSettingsPage.tabs.project.click();
  });

  it('Explore view settings page', () => {
    viewSettingsPage.get();
    viewSettingsPage.goToObserverTab();
    viewSettingsPage.goToContributorTab();
    viewSettingsPage.goToManagerTab();
  });

  // it('Explore project settings page', () => {
  //  projectSettingsPage.get(constants.testProjectName);
  //  projectSettingsPage.noticeList.count();
  //  projectSettingsPage.tabDivs.count();
  //  projectSettingsPage.tabs.project.click();
  //  projectSettingsPage.tabs.remove.click();
  // });

  // TODO this is an lf-specific view
  // xit('Explore user management page', function() {
  //   userManagementPage.get();
  //   // TODO click on things
  // });
});
