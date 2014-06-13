'use strict';

var SfTextSettingsPage = function() {
	// currently this page is called questions-settings.html but will be refactored. IJH 2014-06
	
	this.tabs = {
		editText:			element(by.linkText('Edit Text')),
		archiveQuestions:	element(by.linkText('Archived Questions')),
		audioFile:			element(by.linkText('Audio File')),
		paratextExport:		element(by.linkText('ParaTExt Export'))
	};
	
	this.editTextTab = {
		title: 			element(by.model('editedText.title')),
		usxText:		element(by.model('editedText.content')),
		saveButton:		element(by.partialButtonText('Save')),
	};
	
	this.archivedQuestionsTab = {
		questionNames:		element.all(by.repeater('question in visibleArchivedQuestions').column('calculatedTitle')),
		questionList:		element.all(by.repeater('question in visibleArchivedQuestions')),
		publishButton:		element(by.partialButtonText('Re-publish Questions')),

		questionLink: function(title) {
			return element(by.linkText(title));
		}
	};
	// getFirstCheckbox has to be a function because the .first() method will actually resolve the finder
	this.archivedQuestionsTabGetFirstCheckbox = function() {
		return this.archivedQuestionsTab.questionList.first().findElement(by.css('input[type="checkbox"]'));
	};
	
	this.audioFileTab = {
	};
	
	this.paratextExportTab = {
	};
	
};

module.exports = new SfTextSettingsPage();