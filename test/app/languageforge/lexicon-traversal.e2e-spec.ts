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
    it('Unified tab', async () => {
      await loginPage.loginAsAdmin();
      await configurationPage.get();
      await configurationPage.tabs.unified.click();
      await configurationPage.unifiedPane.inputSystem.addGroupButton.click();
      await browser.$('body').sendKeys(protractor.Key.ESCAPE);
      await browser.wait(
        ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.inputSystem.addInputSystemButton),
        constants.conditionTimeout);
      await configurationPage.unifiedPane.inputSystem.addInputSystemButton.click();
      await browser.$('body').sendKeys(protractor.Key.ESCAPE);
      await browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.tabs.unified), constants.conditionTimeout);
      await configurationPage.tabs.unified.click();
      await configurationPage.unifiedPane.entry.addGroupButton.click();
      await browser.$('body').sendKeys(protractor.Key.ESCAPE);
      await browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.entry.addCustomEntryButton),
        constants.conditionTimeout);
      await configurationPage.unifiedPane.entry.addCustomEntryButton.click();
      await browser.$('body').sendKeys(protractor.Key.ESCAPE);
      await browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.sense.addGroupButton),
        constants.conditionTimeout);
      await configurationPage.unifiedPane.hiddenIfEmptyCheckbox('Citation Form').click();
      await configurationPage.unifiedPane.fieldSpecificButton('Citation Form').click();
      await configurationPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox('Citation Form', 1).click();
      await configurationPage.unifiedPane.fieldSpecificButton('Citation Form').click();
      await configurationPage.unifiedPane.sense.addGroupButton.click();
      await browser.$('body').sendKeys(protractor.Key.ESCAPE);
      await browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.sense.addCustomSenseButton),
        constants.conditionTimeout);
      await configurationPage.unifiedPane.sense.addCustomSenseButton.click();
      await browser.$('body').sendKeys(protractor.Key.ESCAPE);
      await browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.example.addGroupButton),
        constants.conditionTimeout);
      await configurationPage.unifiedPane.hiddenIfEmptyCheckbox('Pictures').click();
      await configurationPage.unifiedPane.fieldSpecificButton('Pictures').click();
      await configurationPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox('Pictures', 1).click();
      await configurationPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox('Pictures').click();
      await configurationPage.unifiedPane.fieldSpecificButton('Pictures').click();
      await configurationPage.unifiedPane.example.addGroupButton.click();
      await browser.$('body').sendKeys(protractor.Key.ESCAPE);
      await browser.wait(
        ExpectedConditions.elementToBeClickable(configurationPage.unifiedPane.example.addCustomExampleButton),
        constants.conditionTimeout);
      await configurationPage.unifiedPane.example.addCustomExampleButton.click();
      await browser.$('body').sendKeys(protractor.Key.ESCAPE);
      await browser.wait(ExpectedConditions.elementToBeClickable(configurationPage.tabs.unified), constants.conditionTimeout);
      await configurationPage.unifiedPane.hiddenIfEmptyCheckbox('Translation').click();
      await configurationPage.unifiedPane.fieldSpecificButton('Translation').click();
      await configurationPage.unifiedPane.example.fieldSpecificInputSystemCheckbox('Translation', 0).click();
      await configurationPage.unifiedPane.fieldSpecificButton('Translation').click();
    });
  });

  describe('Explore editor page', () => {
    it('Edit view', async () => {
      await projectsPage.get();
      await projectsPage.clickOnProject(constants.testProjectName);
      await editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
      await editorPage.noticeList.count();
      await editorPage.edit.entriesList.count();
      await editorPage.edit.senses.count();
    });

    it('Comments view', async () => {
      await editorPage.edit.toCommentsLink.click();
      await editorPage.comment.commentsList.count();
    });
  });

  it('Explore new lex project page', async () => {
    await NewLexProjectPage.get();
    await newLexProjectPage.noticeList.count();
  });

  it('Explore project settings page', async () => {
    await projectSettingsPage.get(constants.testProjectName);
    await projectSettingsPage.tabs.project.click();
  });

  // it('Explore project settings page', async () => {
  //  await projectSettingsPage.get(constants.testProjectName);
  //  await projectSettingsPage.noticeList.count();
  //  await projectSettingsPage.tabDivs.count();
  //  await projectSettingsPage.tabs.project.click();
  //  await projectSettingsPage.tabs.remove.click();
  // });

  // TODO this is an lf-specific view
  // it('Explore user management page', async function() {
  //   await userManagementPage.get();
  //   // TODO click on things
  // });
});
