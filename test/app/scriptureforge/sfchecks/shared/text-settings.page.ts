import {by, element} from 'protractor';

import {SfTextPage} from './text.page';

export class SfTextSettingsPage {
  private readonly textPage = new SfTextPage();

  async get(projectName: any, textTitle: any) {
    await this.textPage.get(projectName, textTitle);
    await SfTextPage.clickTextSettingsButton();
  }

  tabs = {
    editText: element(by.id('questions-settings-edit-tab')),
    archiveQuestions: element(by.id('questions-settings-archived-tab')),
    audioFile: element(by.id('questions-settings-audio-tab')),
    paratextExport: element(by.id('questions-settings-paratext-tab'))
  };

  editTextTab = {
    title: element(by.model('editedText.title')),
    usxText: element(by.model('editedText.content')),
    letMeEditLink: element(by.id('questions-settings-edit-previous')),
    contentEditor: element(by.model('editedText.content')),
    saveButton: element(by.id('questions-settings-save-btn'))
  };

  archivedQuestionsTab = {
    questionNames: element.all(by.repeater('question in visibleArchivedQuestions')
      .column('calculatedTitle')),
    questionList: element.all(by.repeater('question in visibleArchivedQuestions')),
    publishButton: element(by.id('questions-settings-republish-btn')),

    questionLink(title: any) {
      return element(by.linkText(title));
    }
  };

  // this has to be a function because the .first() method will actually resolve the finder
  archivedQuestionsTabGetFirstCheckbox() {
    return this.archivedQuestionsTab.questionList.first().element(by.css('input[type="checkbox"]'));
  }

  paratextExportTab = {
    exportAnswers: element(by.id('exportAnswers')),
    exportComments: element(by.model('exportConfig.exportComments')),
    exportFlagged: element(by.model('exportConfig.exportFlagged')),
    downloadPT7Button: element(by.partialButtonText('Download for Paratext 7')),
    downloadPT8Button: element(by.partialButtonText('Download for Paratext 8')),
    noExportMsg: element(by.id('noExportMsg')),

    answerCount: element(by.binding('download.answerCount')),
    commentCount: element(by.binding('download.commentCount'))
  };

}
