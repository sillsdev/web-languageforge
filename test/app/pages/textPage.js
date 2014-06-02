'use strict';

var SfTextPage = function() {
	this.urlprefix = '/app/sfchecks';

	this.getUrl = function(projectId, textId) {
		return this.urlprefix + '#/p/' + projectId + '/' + textId;
	};
	this.get = function(projectId, textId) {
		browser.get(this.getUrl(projectId, textId));
	}
	
	this.addNewBtn = element(by.partialButtonText("Add New Question"));
	this.deleteBtn = element(by.partialButtonText("Remove Questions"));
	this.makeTemplateBtn = element(by.partialButtonText("Make Template"));
	this.textSettingsBtn = element(by.partialLinkText("Update Text Settings"));
	
	this.clickOnQuestion = function(questionTitle) {
		element(by.linkText(questionTitle)).click();
	};
	
	this.questionNames = element.all(by.repeater('question in visibleQuestions').column('{{question.calculatedTitle}}'));
	this.questionRows  = element.all(by.repeater('question in visibleQuestions'));
	this.questionText = element(by.model('questionDescription'));
	this.questionSummary = element(by.model('questionTitle'));
	this.saveQuestion = element(by.partialButtonText('Save'));
	
	this.newQuestion = {
		showFormButton:	element(by.partialButtonText('Add New Question')),
		form:			element(by.name('newQuestionForm')),
		description:	element(by.model('questionDescription')),
		summary:		element(by.model('questionTitle')),
		saveButton:		element(by.css('form[name="newQuestionForm"]')).element(by.partialButtonText('Save')),
	};
		
	this.addNewQuestion = function(title, summary) {
		expect(this.newQuestion.showFormButton.isDisplayed()).toBe(true);
		this.newQuestion.showFormButton.click();
		this.newQuestion.description.sendKeys(title);
		this.newQuestion.summary.sendKeys(summary);
		this.newQuestion.saveButton.click();
	};
	
	this.printQuestionNames = function() {
		this.questionNames.each(function(names) {
			names.getText().then(console.log);
		});
	};
	
	this.textContent = element(by.id('text'));
};

module.exports = new SfTextPage();