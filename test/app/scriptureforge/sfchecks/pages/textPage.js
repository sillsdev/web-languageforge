'use strict';

var SfTextPage = function() {
	// currently this page is called questions.html but will be refactored. IJH 2014-06
	
	this.urlprefix = '/app/sfchecks';

	this.archiveButton = element(by.partialButtonText("Archive Questions"));
	this.makeTemplateBtn = element(by.partialButtonText("Make Template"));
	this.addNewBtn = element(by.partialButtonText("Add New Question"));
	this.textSettingsBtn = element(by.id("text_settings_button"));
	
	this.questionLink = function(title) {
		return element(by.linkText(title));
	};
	
	this.clickOnQuestion = function(questionTitle) {
		element(by.linkText(questionTitle)).click();
	};
	
	this.questionNames = element.all(by.repeater('question in visibleQuestions').column('{{question.calculatedTitle}}'));
	this.questionRows  = element.all(by.repeater('question in visibleQuestions'));
	this.questionText = element(by.model('questionDescription'));
	this.questionSummary = element(by.model('questionTitle'));
	this.saveQuestion = element(by.partialButtonText('Save'));
	
	// getFirstCheckbox has to be a function because the .first() method will actually resolve the finder
	this.getFirstCheckbox = function() {
		return this.questionRows.first().findElement(by.css('input[type="checkbox"]'));
	};

	this.newQuestion = {
		showFormButton:	element(by.partialButtonText('Add New Question')),
		form:			element(by.name('newQuestionForm')),
		description:	element(by.model('questionDescription')),
		summary:		element(by.model('questionTitle')),
		saveButton:		element(by.css('form[name="newQuestionForm"]')).element(by.partialButtonText('Save')),
	};
		
	this.addNewQuestion = function(description, summary) {
		expect(this.newQuestion.showFormButton.isDisplayed()).toBe(true);
		this.newQuestion.showFormButton.click();
		this.newQuestion.description.sendKeys(description);
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