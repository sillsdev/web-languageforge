'use strict';

module.exports = new SfTextPage();

function SfTextPage() {
  // currently this page is called questions.html but will be refactored. IJH 2014-06

  var util = require('../../../bellows/pages/util.js');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  this.notice = util.notice;

  this.archiveButton = element(by.id('questions-archive-btn'));
  this.makeTemplateBtn = element(by.id('questions-make-template-btn'));
  this.addNewBtn = element(by.id('questions-add-new-btn'));
  this.textSettingsBtn = element(by.id('questions-text-settings-btn'));

  this.clickTextSettingsButton = function() {
    element(by.id("questions-text-settings-btn")).click();
    element(by.id("questions-text-settings-link")).click();
  }

  this.questionLink = function questionLink(title) {
    return element(by.linkText(title));
  };

  this.clickOnQuestion = function clickOnQuestion(questionTitle) {
    element(by.linkText(questionTitle)).click();
  };

  this.questionNames = element.all(by.repeater('question in visibleQuestions')
    .column('{{question.calculatedTitle}}'));
  this.questionRows  = element.all(by.repeater('question in visibleQuestions'));

  //noinspection JSUnusedGlobalSymbols
  //this.questionText = element(by.model('questionDescription'));

  //noinspection JSUnusedGlobalSymbols
  //this.questionSummary = element(by.model('questionTitle'));

  //noinspection JSUnusedGlobalSymbols
  //this.saveQuestion = element(by.partialButtonText('Save'));

  // getFirstCheckbox has to be a function because the .first() method will actually resolve the
  // finder
  this.getFirstCheckbox = function getFirstCheckbox() {
    return this.questionRows.first().element(by.css('input[type="checkbox"]'));
  };

  this.newQuestion = {
    showFormButton: element(by.id('questions-add-new-btn')),
    form: element(by.id('questions-new-question-form')),
    description: element(by.model('questionDescription')),
    summary: element(by.model('questionTitle')),
    saveButton: element(by.id('questions-save-question-btn'))
  };

  this.addNewQuestion = function addNewQuestion(description, summary) {
    this.newQuestion.showFormButton.click();
    browser.wait(expectedCondition.visibilityOf(this.newQuestion.description), CONDITION_TIMEOUT);
    this.newQuestion.description.sendKeys(description);
    this.newQuestion.summary.sendKeys(summary);
    this.newQuestion.saveButton.click();
  };

  //noinspection JSUnusedGlobalSymbols
  this.printQuestionNames = function printQuestionNames() {
    this.questionNames.each(function (names) {
      names.getText().then(console.log);
    });
  };

  this.textContent = element(by.id('textcontrol'));
}
