'use strict';

module.exports = new SfQuestionPage;

/*
 * This object tests the Question page view where the user can do the following:
 * Answers {add, edit, archive (instead of delete) }
 * Comments {add, edit, archive (instead of delete) }
 * Note: "delete" is a reserved word, and the functionality will be moved to "archiving" later
 */
function SfQuestionPage() {
  var util = require('../../../bellows/pages/util.js');
  var _this = this;

  this.answers  = {};
  this.comments = {};

  this.answers.list  = element.all(by.repeater('(answerId, answer) in question.answers'));
  this.comments.list = element.all(by.repeater('comment in answer.comments'));

  // Return the handle to the last answer in the list
  this.answers.last = function () {
    return _this.answers.list.last();
  };

  // Return the handle to the last comment in the list
  this.comments.last = function () {
    return _this.comments.list.last();
  };

  // Add new answer to the end of the answers list
  this.answers.add = function (answer) {
    // Using ID "Comments" contains Answers and Comments
    this.answerCtrl = browser.element(by.id('comments'));
    this.answerCtrl.$('textarea.newAnswer').sendKeys(answer);

    // TODO: Currently Chrome browser has issues and separates the string.
    // Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
    // TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire answer
    this.answerCtrl.$('textarea.newAnswer').sendKeys(protractor.Key.TAB);
    this.answerCtrl.element(by.id('doneBtn')).click();
  };

  // Edit last answer
  this.answers.edit = function (answer) {
    this.editCtrl     = _this.answers.last().$('.answer').element(by.linkText('edit'));

    // Clicking 'edit' changes the DOM so these handles are updated here
    this.editCtrl.click();
    var answersField = _this.answers.last().$('.answer').$('textarea.editAnswer');
    var saveCtrl     = _this.answers.last().$('.answerBtn');

    answersField.sendKeys(protractor.Key.CONTROL, 'a');
    answersField.sendKeys(answer);
    answersField.sendKeys(protractor.Key.TAB);

    saveCtrl.click();
  };

  // Delete the answer at index.  If no index given, delete the last answer.
  // Note: "delete" is a reserved word, and
  // the functionality will be moved to "archive" at a later time
  this.answers.archive = function (index) {
    if (index === '') {
      _this.answers.last().$('.answer').element(by.linkText('delete')).click();
    } else {
      //console.log('should delete answer at index ' + index);
      _this.answers.list.get(index).$('.answer').element(by.linkText('delete')).click();
    }

    util.clickModalButton('Delete');
  };

  // Flag for Export
  this.answers.flags = {};
  this.answers.flags.lastButtonSet = function () {
    return _this.answers.last().$('.answer').element(by.css('.icon-flag'));
  };

  this.answers.flags.lastButtonClear = function () {
    return _this.answers.last().$('.answer').element(by.css('.icon-flag-alt'));
  };

  // Private method to handle the upvote or downvote of an answer.
  // index: index of the answers.list to vote
  // direction: 0=upvote, 1=downvote
  var vote = function (index, direction) {
    _this.answers.list.get(index).$('.vote').$$('a').then(function (voteCtrls) {
      voteCtrls[direction].click();
    });
  };

  // Upvote the answer at the index of answers.list
  this.answers.upvote = function (index) {
    vote(index, 0);
  };

  // Downvote the answer at the index of the answers.list
  this.answers.downvote = function (index) {
    vote(index, 1);
  };

  // Add a comment to the last (most recent) Answer on the page
  this.comments.addToLastAnswer = function (comment) {
    this.addCommentCtrl = _this.answers.last().$('table.comments').$('a.addCommentLink');
    this.commentField   = _this.answers.last().element(by.model('newComment.content'));
    this.submit         = _this.answers.last().$('button.btn-small');

    // Click "add comment" at the end of the Answers list to un-collapse the comment text area.
    this.addCommentCtrl.click();

    // TODO: Currently Chrome browser has issues and separates the string.
    // Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
    // TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire comment
    //this.commentCtrl.$(".jqte_editor").sendKeys(protractor.Key.TAB);
    //this.commentCtrl.element(by.id('doneBtn')).click();
    this.commentField.sendKeys(comment);
    this.commentField.sendKeys(protractor.Key.TAB);
    this.submit.click();
  };

  // Edit the last comment.  Comments are interspersed with the answers
  this.comments.edit = function (comment) {
    this.editCtrl     = _this.comments.last().element(by.linkText('edit'));

    this.editCtrl.click();

    // Clicking 'edit' changes the DOM so these handles are updated here
    var commentsField = _this.comments.last().$('textarea');
    var saveCtrl      = _this.comments.last().element(by.partialButtonText('Save'));

    commentsField.sendKeys(protractor.Key.CONTROL, 'a');
    commentsField.sendKeys(comment);
    commentsField.sendKeys(protractor.Key.TAB);

    saveCtrl.click();
    browser.debugger();
  };

  // Delete the comment at index.  If no index given, delete the last comment.
  // Note: "delete" is a reserved word, and
  // the functionality will be moved to "archive" at a later time
  this.comments.archive = function (index) {
    if (index === '') {
      _this.comments.last().element(by.linkText('delete')).click();
    } else {
      //console.log('should delete comment at index ' + index);
      _this.comments.list.get(index).element(by.linkText('delete')).click();
    }

    util.clickModalButton('Delete');
  };

}
