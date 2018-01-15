'use strict';

describe('Lexicon E2E Page Traversal', function () {
  var constants           = require('../../testConstants.json');
  var util                = require('../../bellows/pages/util.js');
  var loginPage           = require('../../bellows/pages/loginPage.js');
  var configurationPage   = require('../lexicon/pages/configurationPage.js');
  var projectsPage        = require('../../bellows/pages/projectsPage.js');
  var projectSettingsPage = require('../lexicon/pages/projectSettingsPage.js');
  var newLexProjectPage   = require('../lexicon/pages/newLexProjectPage.js');
  var editorPage          = require('../lexicon/pages/editorPage.js');
  var viewSettingsPage    = require('../lexicon/pages/viewSettingsPage.js');
  var lexModals           = require('../lexicon/pages/lexModals.js');

  describe('Explore configuration page', function () {
    it('Configuartion tab', function () {
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

    it('Input systems tab', function () {
      configurationPage.tabs.inputSystems.click();
      configurationPage.inputSystemsTab.moreButton.click();
    });

    it('Input systems tab', function () {
      configurationPage.tabs.inputSystems.click();
      configurationPage.inputSystemsTab.moreButton.click();
    });

    it('Option list tab', function () {
      configurationPage.tabs.optionlists.click();
      // There is no model of opion list tab
    });
  });

  describe('Explore editor page', function () {
    it('Edit view', function () {
      projectsPage.get();
      projectsPage.clickOnProject(constants.testProjectName);
      editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
      editorPage.noticeList.count();
      editorPage.edit.entriesList.count();
      editorPage.edit.senses.count();
    });

    it('Comments view', function () {
      editorPage.edit.toCommentsLink.click();
      editorPage.comment.commentsList.count();
    });
  });

  it('Explore new lex project page', function () {
    newLexProjectPage.get();
    newLexProjectPage.noticeList.count();
    // Might want to go through the process of creating a project, but creating new test data might be bad - Mark W 2018-01-14
  });

  it('Explore project settings page', function () {
    projectSettingsPage.get();
    projectSettingsPage.tabs.project.click();
  });

  it('Explore view settings page', function () {
    viewSettingsPage.get();
    viewSettingsPage.tabs.observer.go();
    viewSettingsPage.tabs.contributor.go();
    viewSettingsPage.tabs.manager.go();
  });
});
