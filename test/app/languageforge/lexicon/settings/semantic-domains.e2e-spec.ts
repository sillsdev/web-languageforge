import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {PageHeader} from '../../../bellows/shared/page-header.element';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {EditorPage} from '../shared/editor.page';
import {ProjectSettingsPage} from '../shared/project-settings.page';

describe('Lexicon E2E Semantic Domains Lazy Load', () => {
  const constants = require('../../../testConstants.json');
  const editorPage   = new EditorPage();
  const header = new PageHeader();
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const projectSettingsPage = new ProjectSettingsPage();

  const semanticDomain1dot1English = constants.testEntry1.senses[0].semanticDomain.values[0] + ' Sky';
  const semanticDomain1dot1Thai = constants.testEntry1.senses[0].semanticDomain.values[0] + ' ท้องฟ้า';

  it('should be using English Semantic Domain for manager', async () => {
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.clickOnProjectName(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect<any>(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    await expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1English);
    await expect<any>(header.language.button.getText()).toEqual('English');
  });

  it('can change Project default language to Thai', async () => {
    await projectSettingsPage.getByLink();
    await expect<any>(projectSettingsPage.tabs.project.isDisplayed()).toBe(true);
    await expect<any>(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelect.isDisplayed()).toBe(true);
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toContain('English');
    await projectSettingsPage.projectTab.defaultLanguageSelect.sendKeys('ภาษาไทย');
    await projectSettingsPage.projectTab.saveButton.click();
    // browser.sleep needs to avoid warnings
    await browser.sleep(1000);
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toContain('ภาษาไทย');
  });

  it('should be using Thai Semantic Domain', async () => {
    // browser.sleep needs to avoid warnings
    await browser.sleep(500);
    await Utils.clickBreadcrumb(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1Thai);
  });

  it('can change Project default language back to English', async () => {
    await projectSettingsPage.getByLink();
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toContain('ภาษาไทย');
    await projectSettingsPage.projectTab.defaultLanguageSelect.sendKeys('English');
    await projectSettingsPage.projectTab.saveButton.click();
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toContain('English');
  });

  it('should be using English Semantic Domain', async () => {
    await Utils.clickBreadcrumb(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1English);
  });

  it('can change Project default language back to Thai', async () => {
    await projectSettingsPage.getByLink();
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toContain('English');
    await projectSettingsPage.projectTab.defaultLanguageSelect.sendKeys('ภาษาไทย');
    await projectSettingsPage.projectTab.saveButton.click();
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toContain('ภาษาไทย');
  });

  it('should be using Thai Semantic Domain after refresh', async () => {
    await Utils.clickBreadcrumb(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1Thai);
    await expect<any>(editorPage.edit.entryCountElem.isDisplayed()).toBe(true);
    await browser.refresh();
    // browser.sleep needs to avoid warnings
    await browser.sleep(1000);
    await expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1Thai);
  });

  it('can change user interface language', async () => {
    await expect<any>(header.language.button.getText()).toContain('ภาษาไทย');
    await header.language.button.click();
    await header.language.findItem('English - semantic domain only').click();
    await expect<any>(header.language.button.getText()).toContain('English');
  });

  it('should still have Thai for Project default language', async () => {
    await projectSettingsPage.getByLink();
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toContain('ภาษาไทย');
  });

  it('should be using English Semantic Domain', async () => {
    await Utils.clickBreadcrumb(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1English);
  });

  it('should be using English Semantic Domain after refresh', async () => {
    await browser.wait(ExpectedConditions.visibilityOf(editorPage.edit.entryCountElem),
      Utils.conditionTimeout);
    await expect<any>(editorPage.edit.entryCountElem.isDisplayed()).toBe(true);
    await browser.refresh();
    // browser.sleep needs to avoid warnings
    await browser.sleep(1000);
    await expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1English);
  });

  it('should still have Thai for Project default language', async () => {
    await projectSettingsPage.getByLink();
    await expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toContain('ภาษาไทย');
  });

});
