import {BellowsLoginPage} from '../../bellows/pages/loginPage';
import {ProjectsPage} from '../../bellows/pages/projectsPage';
import {Utils} from '../../bellows/pages/utils';
import {ConfigurationPage} from '../lexicon/pages/configurationPage';
import {EditorPage} from '../lexicon/pages/editorPage';
import {LexModals} from '../lexicon/pages/lexModals.js';
import {NewLexProjectPage} from '../lexicon/pages/newLexProjectPage';
import {ProjectSettingsPage} from '../lexicon/pages/projectSettingsPage';
import {ViewSettingsPage} from '../lexicon/pages/viewSettingsPage';

describe('Lexicon E2E Page Traversal', () => {
  const constants = require('../../testConstants');
  const util = new BellowsLoginPage();
  const loginPage = new BellowsLoginPage();
  const configurationPage = new ConfigurationPage();
  const projectsPage = new ProjectsPage();
  const projectSettingsPage = new ProjectSettingsPage();
  const newLexProjectPage = new NewLexProjectPage();
  const editorPage = new EditorPage();
  const viewSettingsPage = new ViewSettingsPage();
  const lexModals = new LexModals();

  describe('Explore configuration page', () => {
    it('Configuartion tab', () => {
      loginPage.loginAsAdmin();
      configurationPage.get();
      configurationPage.tabs.fields.click();
      configurationPage.fieldsTab.hiddenIfEmptyCheckbox.click();
      configurationPage.fieldsTab.widthInput.click();
      configurationPage.fieldsTab.inputSystemTags.count();
      configurationPage.fieldsTab.inputSystemCheckboxes.count();
      configurationPage.fieldsTab.inputSystemUpButton.click();
      configurationPage.fieldsTab.inputSystemDownButton.click();
    });

    it('Input systems tab', () => {
      configurationPage.tabs.inputSystems.click();
      configurationPage.inputSystemsTab.moreButton.click();
    });

    it('Option list tab', () => {
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
