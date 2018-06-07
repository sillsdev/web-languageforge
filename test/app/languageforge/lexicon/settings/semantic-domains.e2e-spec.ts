import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {EditorPage} from '../shared/editor.page';
import {ProjectSettingsPage} from '../shared/project-settings.page';

describe('Lexicon E2E Semantic Domains Lazy Load', () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const editorPage   = new EditorPage();
  const projectSettingsPage = new ProjectSettingsPage();

  const semanticDomain1dot1English = constants.testEntry1.senses[0].semanticDomain.values[0] + ' Sky';
  const semanticDomain1dot1Thai = constants.testEntry1.senses[0].semanticDomain.values[0] + ' ท้องฟ้า';

  it('should be using English Semantic Domain for manager', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect<any>(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1English);
  });

  it('can change Project default language to Thai', () => {
    projectSettingsPage.getByLink();
    expect<any>(projectSettingsPage.tabs.project.isDisplayed()).toBe(true);
    expect<any>(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
    expect<any>(projectSettingsPage.projectTab.defaultLanguageSelect.isDisplayed()).toBe(true);
    expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toEqual('English');
    projectSettingsPage.projectTab.defaultLanguageSelect.sendKeys('ภาษาไทย');
    projectSettingsPage.projectTab.saveButton.click();
    expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toEqual('ภาษาไทย');
  });

  it('should be using Thai Semantic Domain', () => {
    Utils.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1Thai);
  });

  it('can change Project default language back to English', () => {
    projectSettingsPage.getByLink();
    expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toEqual('ภาษาไทย');
    projectSettingsPage.projectTab.defaultLanguageSelect.sendKeys('English');
    projectSettingsPage.projectTab.saveButton.click();
    expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toEqual('English');
  });

  it('should be using English Semantic Domain', () => {
    Utils.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1English);
  });

  it('can change Project default language back to Thai', () => {
    projectSettingsPage.getByLink();
    expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toEqual('English');
    projectSettingsPage.projectTab.defaultLanguageSelect.sendKeys('ภาษาไทย');
    projectSettingsPage.projectTab.saveButton.click();
    expect<any>(projectSettingsPage.projectTab.defaultLanguageSelected.getText()).toEqual('ภาษาไทย');
  });

  it('should be using Thai Semantic Domain after refresh', () => {
    Utils.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1Thai);
    expect<any>(editorPage.edit.entryCountElem.isDisplayed()).toBe(true);
    browser.refresh();
    browser.wait(ExpectedConditions.invisibilityOf(editorPage.edit.entryCountElem), Utils.conditionTimeout);
    browser.wait(ExpectedConditions.visibilityOf(editorPage.edit.entryCountElem), Utils.conditionTimeout);
    expect<any>(editorPage.edit.semanticDomain.values.first().getText()).toEqual(semanticDomain1dot1Thai);
  });

});
