'use strict';

/*
// This object tests the Question page view where the user can do the following:
// Answers {add, edit, archive (instead of delete) }
// Comments {add, edit, archive (instead of delete) }
// Note: "delete" is a reserved word, and the functionality will be moved to "archiving" at a later time
*/
var SfQuestionPage = function() {
	var page = this; // For use inside our methods. Necessary when passing anonymous functions around, which lose access to "this".
	
	this.answers  = {};
	this.comments = {};

	this.answers.list   = element.all(by.repeater('(answerId, answer) in question.answers'));
	
	this.answers.add = function(answer) {
		this.answerCtrl = browser.findElement(by.id('comments')); // Using ID "Comments" contains Answers and Comments
		this.answerCtrl.$(".jqte_editor").sendKeys(answer);
		
		// TODO: Currently Chrome browser has issues and separates the string.
		// Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
		// TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire answer
		this.answerCtrl.$(".jqte_editor").sendKeys(protractor.Key.TAB);
		this.answerCtrl.findElement(by.id('doneBtn')).click();
	};

	// TBD
	this.answers.edit = function(answer) {
	};
	
	// TBD: "delete" is a reserved word, and the functionality will be moved to "archive" at a later time
	this.answers.archive = function(answer) {
	};
	
	// Return the handle to the last answer in the list
	this.answers.last = function() {
		return (page.answers.list).last();
	};

	// Add a comment to the last (most recent) Answer on the page
	this.comments.addToLastAnswer = function(comment) {
		this.addCommentCtrl = page.answers.last().$('table.comments').$('a.addCommentLink');
		this.commentField   = page.answers.last().findElement(by.model('newComment.content'));
		this.submit         = page.answers.last().$('button.btn-small');
		
		// Click "add comment" at the end of the Answers list to un-collapse the comment text area.
		this.addCommentCtrl.click();

		// TODO: Currently Chrome browser has issues and separates the string.
		// Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
		// TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire comment
		//this.commentCtrl.$(".jqte_editor").sendKeys(protractor.Key.TAB);
		//this.commentCtrl.findElement(by.id('doneBtn')).click();
		this.commentField.sendKeys(comment);
		this.commentField.sendKeys(protractor.Key.TAB);
		this.submit.click();
	};

	// TBD
	this.comments.edit = function(comment) {
	};
	
	// TBD: "delete" is a reserved word, and the functionality will be moved to "archive" at a later time
	this.comments.archive = function(comment) {
	};
};


module.exports = new SfQuestionPage;
