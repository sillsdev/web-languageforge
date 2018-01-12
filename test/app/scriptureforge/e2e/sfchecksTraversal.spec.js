'use strict';

describe('SFChecks E2E Page Traversal', function () {
  var constants           = require('../../testConstants.json');
  var loginPage           = require('../../bellows/pages/loginPage.js');
  var projectPage         = require('../sfchecks/pages/projectPage.js');
  var projectsPage        = require('../../bellows/pages/projectsPage.js');
  var projectSettingsPage = require('../sfchecks/pages/projectSettingsPage.js');
  var questionPage        = require('../sfchecks/pages/questionPage.js');
  var textPage            = require('../sfchecks/pages/textPage.js');
  var textSettingsPage    = require('../sfchecks/pages/textSettingsPage.js');

  it('Explore project page', function () {
    loginPage.loginAsAdmin();
    projectPage.textNames.count();
    projectPage.textList.count();
    projectPage.settingsDropdownLink.click();
    projectPage.invite.showFormButton.click();
    projectPage.invite.emailInput.click();
    projectPage.invite.sendButton.click();
    projectPage.newText.showFormButton.click();
    projectPage.newText.title.click();
  });

  describe('Explore project settings page', function () {
    it('Members tab', function () {
      projectSettingsPage.get();
      projectSettingsPage.tabs.members.click();
      projectSettingsPage.membersTab.addButton.click();
      projectSettingsPage.membersTab.removeButton.click();
      projectSettingsPage.membersTab.messageButton.click();
      projectSettingsPage.membersTab.listFilter.click();
      projectSettingsPage.membersTab.list.count();
    });

    it('Templates tab', function () {
      projectSettingsPage.tabs.templates.click();
      projectSettingsPage.templatesTab.list.count();
      projectSettingsPage.templatesTab.addButton.click();
      projectSettingsPage.templatesTab.removeButton.click();
      projectSettingsPage.templatesTab.editor.title.click();
      projectSettingsPage.templatesTab.editor.description.click();
    });

    it('Archive Text tab', function () {
      projectSettingsPage.tabs.archiveTexts.click();
      projectSettingsPage.archivedTextsTab.textNames.count();
      projectSettingsPage.archivedTextsTab.textList.count();
    });

    it('Project tab', function () {
      projectSettingsPage.tabs.project.click();
      projectSettingsPage.projectTab.name.click();
      projectSettingsPage.projectTab.code.click();
      projectSettingsPage.projectTab.allowAudioDownload.click();
      projectSettingsPage.projectTab.usersSeeEachOthersResponses.click();
    });

    it('Options tab', function () {
      projectSettingsPage.tabs.optionlists.click();
      projectSettingsPage.optionlistsTab.showList.count();
      projectSettingsPage.optionlistsTab.editList.count();
      projectSettingsPage.optionlistsTab.editContentsList.count();
    });

    it('Communication tab', function () {
      projectSettingsPage.tabs.communication.click();
      projectSettingsPage.communicationTab.sms.accountId.click();
      projectSettingsPage.communicationTab.sms.authToken.click();
      projectSettingsPage.communicationTab.sms.number.click();
      projectSettingsPage.communicationTab.email.address.click();
      projectSettingsPage.communicationTab.email.name.click();
    });
  });

  it('Explore text page', function () {
    textPage.get(constants.testProjectName, constants.testText1Title);
    textPage.archiveButton.click();
    textPage.makeTemplateBtn.click();
    textPage.addNewBtn.click();
    textPage.textSettingsBtn.click();
  });

  describe('Explore text settings page', function () {
    it('Edit text tab', function () {
      textSettingsPage.get(constants.testProjectName, constants.testText1Title);
      textSettingsPage.tabs.editText.click();
      textSettingsPage.editTextTab.title.click();
      textSettingsPage.editTextTab.usxText.click();
    });

    it('Archive questions tab', function () {
      textSettingsPage.tabs.archiveQuestions.click();
      textSettingsPage.archivedQuestionsTab.questionNames.count();
      textSettingsPage.archivedQuestionsTab.questionList.count();
    });

    it('Audio file tab', function () {
      textSettingsPage.tabs.audioFile.click();
    });

    it('Paratex export tab', function () {
      textSettingsPage.tabs.paratextExport.click();
      textSettingsPage.paratextExportTab.prepareButton.click();
    });
  });

  it('Explore question page', function () {
    questionPage.get(constants.testProjectName, constants.testText1Title, constants.testText1Question1Title);
    questionPage.answers.list.count();
    questionPage.comments.list.count();
  });
});
