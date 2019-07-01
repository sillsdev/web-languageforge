import 'jasmine';
import {browser, ExpectedConditions, protractor} from 'protractor';

import {BellowsLoginPage} from '../bellows/shared/login.page';
import {ProjectsPage} from '../bellows/shared/projects.page';
import {ConfigurationPage} from './lexicon/shared/configuration.page';
import {EditorPage} from './lexicon/shared/editor.page';
import {NewLexProjectPage} from './lexicon/shared/new-lex-project.page';
import {ProjectSettingsPage} from './lexicon/shared/project-settings.page';

describe('Lexicon E2E Page Traversal', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const configurationPage = new ConfigurationPage();
  const projectsPage = new ProjectsPage();
  const projectSettingsPage = new ProjectSettingsPage();
  const newLexProjectPage = new NewLexProjectPage();
  const editorPage = new EditorPage();

  describe('Explore configuration page', () => {
    it('Unified tab', () => {
      loginPage.loginAsAdmin();
      configurationPage.get();
      configurationPage.tabs.unified.click();
      configurationPage.unifiedPane.inputSystem.addGroupButton.click();
      browser.$('body').sendKeys(protractor.Key.ESCAPE);
      browser.wait(
        ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.inputSystem.addInputSystemButton),
        constants.conditionTimeout);
      configurationPage.unifiedPane.inputSystem.addInputSystemButton.click();
      browser.$('body').sendKeys(protractor.Key.ESCAPE);
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.tabs.unified), constants.conditionTimeout);
      configurationPage.tabs.unified.click();
      configurationPage.unifiedPane.entry.addGroupButton.click();
      browser.$('body').sendKeys(protractor.Key.ESCAPE);
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.entry.addCustomEntryButton),
        constants.conditionTimeout);
      configurationPage.unifiedPane.entry.addCustomEntryButton.click();
      browser.$('body').sendKeys(protractor.Key.ESCAPE);
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.sense.addGroupButton),
        constants.conditionTimeout);
      configurationPage.unifiedPane.hiddenIfEmptyCheckbox('Citation Form').click();
      configurationPage.unifiedPane.fieldSpecificButton('Citation Form').click();
      configurationPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox('Citation Form', 1).click();
      configurationPage.unifiedPane.fieldSpecificButton('Citation Form').click();
      configurationPage.unifiedPane.sense.addGroupButton.click();
      browser.$('body').sendKeys(protractor.Key.ESCAPE);
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.sense.addCustomSenseButton),
        constants.conditionTimeout);
      configurationPage.unifiedPane.sense.addCustomSenseButton.click();
      browser.$('body').sendKeys(protractor.Key.ESCAPE);
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.example.addGroupButton),
        constants.conditionTimeout);
      configurationPage.unifiedPane.hiddenIfEmptyCheckbox('Pictures').click();
      configurationPage.unifiedPane.fieldSpecificButton('Pictures').click();
      configurationPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox('Pictures', 1).click();
      configurationPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox('Pictures').click();
      configurationPage.unifiedPane.fieldSpecificButton('Pictures').click();
      configurationPage.unifiedPane.example.addGroupButton.click();
      browser.$('body').sendKeys(protractor.Key.ESCAPE);
      browser.wait(
        ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.example.addCustomExampleButton),
        constants.conditionTimeout);
      configurationPage.unifiedPane.example.addCustomExampleButton.click();
      browser.$('body').sendKeys(protractor.Key.ESCAPE);
      browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.tabs.unified), constants.conditionTimeout);
      configurationPage.unifiedPane.hiddenIfEmptyCheckbox('Translation').click();
      configurationPage.unifiedPane.fieldSpecificButton('Translation').click();
      configurationPage.unifiedPane.example.fieldSpecificInputSystemCheckbox('Translation', 0).click();
      configurationPage.unifiedPane.fieldSpecificButton('Translation').click();
    });

    it('Input Systems tab', () => {
      configurationPage.tabs.inputSystems.click();
      configurationPage.inputSystemsPane.moreButton.click();
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
    NewLexProjectPage.get();
    newLexProjectPage.noticeList.count();
  });

  it('Explore project settings page', () => {
    projectSettingsPage.get(constants.testProjectName);
    projectSettingsPage.tabs.project.click();
  });

  // it('Explore project settings page', () => {
  //  projectSettingsPage.get(constants.testProjectName);
  //  projectSettingsPage.noticeList.count();
  //  projectSettingsPage.tabDivs.count();
  //  projectSettingsPage.tabs.project.click();
  //  projectSettingsPage.tabs.remove.click();
  // });

  // TODO this is an lf-specific view
  // it('Explore user management page', function() {
  //   userManagementPage.get();
  //   // TODO click on things
  // });
});
