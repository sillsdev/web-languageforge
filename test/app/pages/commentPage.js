'use strict';

var SfCommentPage = function() {
	var page = this;
	
	// Add a comment to the last (latest) Answer on the page
	this.addComment = function(comment) {
		//this.answerCtrl = element.all(by.repeater('(answerId, answer) in question.answers')).last().then(function() {
		element.all(by.repeater('(answerId, answer) in question.answers')).last().then(function(answerCtrl) {
			console.log('tag ' + answerCtrl.getTagName());
		});
	//	this.answerCtrl.map(function(row) {
	//		var commentCtrl = row.element.all(by.repeater('comment in answer.comments'));
			//this.commentCtrl = element(by.id('answers'));
		browser.debugger();
		
		//this.commentCtrl.$(".jqte_editor").sendKeys(comment);
		
		// TODO: Currently Chrome browser has issues and separates the string.
		// Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
		// TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire comment
		//this.commentCtrl.$(".jqte_editor").sendKeys(protractor.Key.TAB);
		//this.commentCtrl.findElement(by.id('doneBtn')).click();
	};

	// TBD
	this.editComment = function(comment) {
	};
	
	// TBD
	this.deleteComment = function(comment) {
	};
};

module.exports = new SfCommentPage;
