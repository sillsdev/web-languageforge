'use strict';

var SfTextPage = function() {
	this.urlprefix = '/app/sfchecks';

	this.get = function(projectId, textId) {
		browser.get(this.urlprefix + '#/p/' + projectId + '/' + textId);
	};
	
	this.clickOnQuestion = function(questionTitle) {
		element(by.linkText(questionTitle)).click();
	};
	
	this.questionNames = element.all(by.repeater('question in visibleQuestions').column('{{question.calculatedTitle}}'));
	
	this.printQuestionNames = function() {
		this.questionNames.each(function(names) {
			names.getText().then(console.log);
		});
	};
};

module.exports = new SfTextPage();