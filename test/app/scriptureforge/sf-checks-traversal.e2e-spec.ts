import 'jasmine';

import {BellowsLoginPage} from '../bellows/shared/login.page';
import {SfProjectSettingsPage} from './sfchecks/shared/project-settings.page';
import {SfProjectPage} from './sfchecks/shared/project.page';
import {SfQuestionPage} from './sfchecks/shared/question.page';
import {SfTextSettingsPage} from './sfchecks/shared/text-settings.page';
import {SfTextPage} from './sfchecks/shared/text.page';

describe('SFChecks E2E Page Traversal', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectPage = new SfProjectPage();
  const projectSettingsPage = new SfProjectSettingsPage();
  const questionPage = new SfQuestionPage();
  const textPage = new SfTextPage();
  const textSettingsPage = new SfTextSettingsPage();

  it('Explore project page', async () => {
    await loginPage.loginAsAdmin();
    await projectPage.textNames.count();
    await projectPage.textList.count();
    await projectPage.settingsDropdownLink.click();
    await projectPage.invite.showFormButton.click();
    await projectPage.invite.emailInput.click();
    await projectPage.invite.sendButton.click();
    await projectPage.newText.showFormButton.click();
    await projectPage.newText.title.click();
  });

  describe('Explore project settings page', () => {
    it('Members tab', async () => {
      await projectSettingsPage.get(constants.testProjectName);
      await projectSettingsPage.tabs.members.click();
      await projectSettingsPage.membersTab.addButton.click();
      await projectSettingsPage.membersTab.removeButton.click();
      await projectSettingsPage.membersTab.messageButton.click();
      await projectSettingsPage.membersTab.listFilter.click();
      await projectSettingsPage.membersTab.list.count();
    });

    it('Templates tab', async () => {
      await projectSettingsPage.tabs.templates.click();
      await projectSettingsPage.templatesTab.list.count();
      await projectSettingsPage.templatesTab.addButton.click();
      await projectSettingsPage.templatesTab.removeButton.click();
      await projectSettingsPage.templatesTab.editor.title.click();
      await projectSettingsPage.templatesTab.editor.description.click();
    });

    it('Archive Text tab', async () => {
      await projectSettingsPage.tabs.archiveTexts.click();
      await projectSettingsPage.archivedTextsTab.textNames.count();
      await projectSettingsPage.archivedTextsTab.textList.count();
    });

    it('Project tab', async () => {
      await projectSettingsPage.tabs.project.click();
      await projectSettingsPage.projectTab.name.click();
      await projectSettingsPage.projectTab.allowAudioDownload.click();
      await projectSettingsPage.projectTab.usersSeeEachOthersResponses.click();
    });

    it('Options tab', async () => {
      await projectSettingsPage.tabs.optionlists.click();
      await projectSettingsPage.optionlistsTab.showList.count();
      await projectSettingsPage.optionlistsTab.editList.count();
      await projectSettingsPage.optionlistsTab.editContentsList.count();
    });

    it('Communication tab', async () => {
      await projectSettingsPage.tabs.communication.click();
      await projectSettingsPage.communicationTab.sms.accountId.click();
      await projectSettingsPage.communicationTab.sms.authToken.click();
      await projectSettingsPage.communicationTab.sms.number.click();
      await projectSettingsPage.communicationTab.email.address.click();
      await projectSettingsPage.communicationTab.email.name.click();
    });
  });

  it('Explore text page', async () => {
    await textPage.get(constants.testProjectName, constants.testText1Title);
    await textPage.archiveButton.click();
    await textPage.makeTemplateBtn.click();
    await textPage.addNewBtn.click();
    await textPage.textSettingsBtn.click();
  });

  describe('Explore text settings page', () => {
    it('Edit text tab', async () => {
      await textSettingsPage.get(constants.testProjectName, constants.testText1Title);
      await textSettingsPage.tabs.editText.click();
      await textSettingsPage.editTextTab.title.click();
      await textSettingsPage.editTextTab.usxText.click();
    });

    it('Archive questions tab', async () => {
      await textSettingsPage.tabs.archiveQuestions.click();
      await textSettingsPage.archivedQuestionsTab.questionNames.count();
      await textSettingsPage.archivedQuestionsTab.questionList.count();
    });

    it('Audio file tab', async () => {
      await textSettingsPage.tabs.audioFile.click();
    });

    it('Paratex export tab', async () => {
      await textSettingsPage.tabs.paratextExport.click();
      await textSettingsPage.paratextExportTab.downloadPT7Button.click();
      await textSettingsPage.paratextExportTab.downloadPT8Button.click();
    });
  });

  it('Explore question page', async () => {
    await questionPage.get(constants.testProjectName, constants.testText1Title, constants.testText1Question1Title);
    await questionPage.answers.list.count();
    await questionPage.comments.list.count();
  });

  // it('Explore project settings page', () => {
  //  projectSettingsPage.get(constants.testProjectName);
  //  projectSettingsPage.noticeList.count();
  //  projectSettingsPage.tabDivs.count();
  //  projectSettingsPage.tabs.project.click();
  //  projectSettingsPage.tabs.remove.click();
  // });

});
