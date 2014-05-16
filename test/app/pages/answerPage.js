'use strict';

var SfAnswerPage = function() {
	var page = this;
	
	this.addAnswer = function(answer) {
		this.answerCtrl = browser.findElement(by.id('comments')); // Using ID "Comments" contains Answers and Comments
		this.answerCtrl.$(".jqte_editor").sendKeys(answer);
		
		// TODO: Currently Chrome browser has issues and separates the string.
		// Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
		// TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire answer
		this.answerCtrl.$(".jqte_editor").sendKeys(protractor.Key.TAB);
		this.answerCtrl.findElement(by.id('doneBtn')).click();
	};

	// TBD
	this.editAnswer = function(answer) {
	};
	
	// TBD
	this.deleteAnswer = function(answer) {
	};
};

module.exports = new SfAnswerPage;
