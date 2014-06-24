'use strict';

/*
// This object tests the Question page view where the user can do the following:
// Answers {add, edit, archive (instead of delete) }
// Comments {add, edit, archive (instead of delete) }
// Note: "delete" is a reserved word, and the functionality will be moved to "archiving" at a later time
*/
var SfQuestionPage = function() {
	var util = require('./util.js');
	var page = this; // For use inside our methods. Necessary when passing anonymous functions around, which lose access to "this".
	
	this.answers  = {};
	this.comments = {};

	this.answers.list  = element.all(by.repeater('(answerId, answer) in question.answers'));
	this.comments.list = element.all(by.repeater('comment in answer.comments'));

	// Return the handle to the last answer in the list
	this.answers.last = function() {
		return page.answers.list.last();
	};
	
	// Return the handle to the last comment in the list
	this.comments.last = function() {
		return page.comments.list.last();
	};
	
	// Add new answer to the end of the answers list
	this.answers.add = function(answer) {
		this.answerCtrl = browser.findElement(by.id('comments')); // Using ID "Comments" contains Answers and Comments
		this.answerCtrl.$("textarea.newAnswer").sendKeys(answer);
		
		// TODO: Currently Chrome browser has issues and separates the string.
		// Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
		// TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire answer
		this.answerCtrl.$("textarea.newAnswer").sendKeys(protractor.Key.TAB);
		this.answerCtrl.findElement(by.id('doneBtn')).click();
	};

	// Edit last answer
	this.answers.edit = function(answer) {
		this.editCtrl     = page.answers.last().$('.answer').findElement(by.linkText('edit'));

		// Clicking 'edit' changes the DOM so these handles are updated here
		this.editCtrl.click();
		var answersField = page.answers.last().$('.answer').$("textarea.editAnswer");
		var saveCtrl     = page.answers.last().$(".answerBtn");

		answersField.sendKeys(protractor.Key.CONTROL, "a");
		answersField.sendKeys(answer);
		answersField.sendKeys(protractor.Key.TAB);
		
		saveCtrl.click();
	};
	
	// Delete the answer at index.  If no index given, delete the last answer.
	// Note: "delete" is a reserved word, and 
	// the functionality will be moved to "archive" at a later time
	this.answers.archive = function(index) {
		if (index === "") {
			page.answers.last().$('.answer').findElement(by.linkText('delete')).click();
		} else {
			//console.log('should delete answer at index ' + index);
			page.answers.list.get(index).$('.answer').findElement(by.linkText('delete')).click();
		}
		util.clickModalButton('Delete');
	};
	
	// Flag for Export
	this.answers.flags = {};
	this.answers.flags.lastButtonSet = function () {
		return page.answers.last().$('.answer').findElement(by.css('.icon-flag'));
	};
	this.answers.flags.lastButtonClear = function () {
		return page.answers.last().$('.answer').findElement(by.css('.icon-flag-alt'));		
	};

	// Private method to handle the upvote or downvote of an answer.
	// index: index of the answers.list to vote
	// direction: 0=upvote, 1=downvote
	var vote = function(index, direction) {
		page.answers.list.get(index).$('.vote').$$('a').then(function(voteCtrls) {
			voteCtrls[direction].click();
		});
	};

	// Upvote the answer at the index of answers.list
	this.answers.upvote = function(index) {
		vote(index, 0);
	};

	// Downvote the answer at the index of the answers.list
	this.answers.downvote = function(index) {
		vote(index, 1);
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

	// Edit the last comment.  Comments are interspersed with the answers
	this.comments.edit = function(comment) {
		this.editCtrl     = page.comments.last().findElement(by.linkText('edit'));

		this.editCtrl.click();

		// Clicking 'edit' changes the DOM so these handles are updated here
		var commentsField = page.comments.last().$('textarea');
		var saveCtrl      = page.comments.last().findElement(by.partialButtonText('Save'));

		commentsField.sendKeys(protractor.Key.CONTROL, "a");
		commentsField.sendKeys(comment);
		commentsField.sendKeys(protractor.Key.TAB);

		saveCtrl.click();
		browser.debugger();
	};
	
	// Delete the comment at index.  If no index given, delete the last comment.
	// Note: "delete" is a reserved word, and 
	// the functionality will be moved to "archive" at a later time
	this.comments.archive = function(index) {
		if (index === "") {
			page.comments.last().findElement(by.linkText('delete')).click();
		} else {
			//console.log('should delete comment at index ' + index);
			page.comments.list.get(index).findElement(by.linkText('delete')).click();
		};
		util.clickModalButton('Delete');
	};
	
};

module.exports = new SfQuestionPage;
