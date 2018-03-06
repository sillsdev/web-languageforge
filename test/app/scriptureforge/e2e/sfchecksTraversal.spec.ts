import { BellowsLoginPage } from '../../bellows/pages/loginPage';
import { ProjectsPage } from '../../bellows/pages/projectsPage';
import { SfProjectPage } from '../sfchecks/pages/projectPage';
import { SfProjectSettingsPage } from '../sfchecks/pages/projectSettingsPage';
import { SfQuestionPage } from '../sfchecks/pages/questionPage';
import { SfTextPage } from '../sfchecks/pages/textPage';
import { SfTextSettingsPage } from '../sfchecks/pages/textSettingsPage';

describe('SFChecks E2E Page Traversal', () => {

  // tslint:disable-next-line:no-var-requires
  const constants = require('../../testConstants');
  const loginPage = new BellowsLoginPage();
  const projectPage = new SfProjectPage();
  const projectsPage = new ProjectsPage();
  const projectSettingsPage = new SfProjectSettingsPage();
  const questionPage = new SfQuestionPage();
  const textPage = new SfTextPage();
  const textSettingsPage = new SfTextSettingsPage();

  it('Explore project page', () => {
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

  describe('Explore project settings page', () => {
    it('Members tab', () => {
      projectSettingsPage.get(constants.testProjectName);
      projectSettingsPage.tabs.members.click();
      projectSettingsPage.membersTab.addButton.click();
      projectSettingsPage.membersTab.removeButton.click();
      projectSettingsPage.membersTab.messageButton.click();
      projectSettingsPage.membersTab.listFilter.click();
      projectSettingsPage.membersTab.list.count();
    });

    it('Templates tab', () => {
      projectSettingsPage.tabs.templates.click();
      projectSettingsPage.templatesTab.list.count();
      projectSettingsPage.templatesTab.addButton.click();
      projectSettingsPage.templatesTab.removeButton.click();
      projectSettingsPage.templatesTab.editor.title.click();
      projectSettingsPage.templatesTab.editor.description.click();
    });

    it('Archive Text tab', () => {
      projectSettingsPage.tabs.archiveTexts.click();
      projectSettingsPage.archivedTextsTab.textNames.count();
      projectSettingsPage.archivedTextsTab.textList.count();
    });

    it('Project tab', () => {
      projectSettingsPage.tabs.project.click();
      projectSettingsPage.projectTab.name.click();
      projectSettingsPage.projectTab.allowAudioDownload.click();
      projectSettingsPage.projectTab.usersSeeEachOthersResponses.click();
    });

    it('Options tab', () => {
      projectSettingsPage.tabs.optionlists.click();
      projectSettingsPage.optionlistsTab.showList.count();
      projectSettingsPage.optionlistsTab.editList.count();
      projectSettingsPage.optionlistsTab.editContentsList.count();
    });

    it('Communication tab', () => {
      projectSettingsPage.tabs.communication.click();
      projectSettingsPage.communicationTab.sms.accountId.click();
      projectSettingsPage.communicationTab.sms.authToken.click();
      projectSettingsPage.communicationTab.sms.number.click();
      projectSettingsPage.communicationTab.email.address.click();
      projectSettingsPage.communicationTab.email.name.click();
    });
  });

  it('Explore text page', () => {
    textPage.get(constants.testProjectName, constants.testText1Title);
    textPage.archiveButton.click();
    textPage.makeTemplateBtn.click();
    textPage.addNewBtn.click();
    textPage.textSettingsBtn.click();
  });

  describe('Explore text settings page', () => {
    it('Edit text tab', () => {
      textSettingsPage.get(constants.testProjectName, constants.testText1Title);
      textSettingsPage.tabs.editText.click();
      textSettingsPage.editTextTab.title.click();
      textSettingsPage.editTextTab.usxText.click();
    });

    it('Archive questions tab', () => {
      textSettingsPage.tabs.archiveQuestions.click();
      textSettingsPage.archivedQuestionsTab.questionNames.count();
      textSettingsPage.archivedQuestionsTab.questionList.count();
    });

    it('Audio file tab', () => {
      textSettingsPage.tabs.audioFile.click();
    });

    it('Paratex export tab', () => {
      textSettingsPage.tabs.paratextExport.click();
      textSettingsPage.paratextExportTab.downloadPT7Button.click();
      textSettingsPage.paratextExportTab.downloadPT8Button.click();
    });
  });

  it('Explore question page', () => {
    questionPage.get(constants.testProjectName, constants.testText1Title, constants.testText1Question1Title);
    questionPage.answers.list.count();
    questionPage.comments.list.count();
  });

  // it('Explore project settings page', () => {
  //  projectSettingsPage.get(constants.testProjectName);
  //  projectSettingsPage.noticeList.count();
  //  projectSettingsPage.tabDivs.count();
  //  projectSettingsPage.tabs.project.click();
  //  projectSettingsPage.tabs.remove.click();
  // });

});
