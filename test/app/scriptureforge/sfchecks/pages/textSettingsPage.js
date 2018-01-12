'use strict';

module.exports = new SfTextSettingsPage();

function SfTextSettingsPage() {
  var textPage = require('./textPage.js');
  // currently this page is called questions-settings.html but will be refactored. IJH 2014-06
  this.get = function get(projectName, textTitle) {
    textPage.get(projectName, textTitle)
    textPage.clickTextSettingsButton();
  };

  this.tabs = {
    editText: element(by.id('questions-settings-edit-tab')),
    archiveQuestions: element(by.id('questions-settings-archived-tab')),
    audioFile: element(by.id('questions-settings-audio-tab')),
    paratextExport: element(by.id('questions-settings-paratext-tab'))
  };

  this.editTextTab = {
    title: element(by.model('editedText.title')),
    usxText: element(by.model('editedText.content')),
    letMeEditLink: element(by.id('questions-settings-edit-previous')),
    contentEditor: element(by.model('editedText.content')),
    saveButton: element(by.id('questions-settings-save-btn'))
  };

  this.archivedQuestionsTab = {
    questionNames: element.all(by.repeater('question in visibleArchivedQuestions')
      .column('calculatedTitle')),
    questionList: element.all(by.repeater('question in visibleArchivedQuestions')),
    publishButton: element(by.id('questions-settings-republish-btn')),

    questionLink: function questionLink(title) {
      return element(by.linkText(title));
    }
  };

  // this has to be a function because the .first() method will actually resolve the finder
  this.archivedQuestionsTabGetFirstCheckbox = function archivedQuestionsTabGetFirstCheckbox() {
    return this.archivedQuestionsTab.questionList.first().element(by.css('input[type="checkbox"]'));
  };

  this.paratextExportTab = {
    exportAnswers: element(by.id('exportAnswers')),
    exportComments: element(by.model('exportConfig.exportComments')),
    exportFlagged: element(by.model('exportConfig.exportFlagged')),
    prepareButton: element(by.id('questions-settings-prepare-btn')),
    noExportMsg: element(by.id('noExportMsg')),

    answerCount: element(by.binding('download.answerCount')),
    commentCount: element(by.binding('download.commentCount')),
    downloadButton: element(by.id('questions-settings-download-btn'))
  };

}
