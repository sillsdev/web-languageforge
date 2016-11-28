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

  this.answers  = {};
  this.comments = {};

  this.answers.list  = element.all(by.repeater('(answerId, answer) in question.answers'));
  this.comments.list = element.all(by.repeater('comment in answer.comments'));

  // Return the handle to the last answer in the list
  this.answers.last = function () {
    return this.answers.list.last();
  }.bind(this);

  // Return the handle to the last comment in the list
  this.comments.last = function () {
    return this.comments.list.last();
  }.bind(this);

  // Add new answer to the end of the answers list
  this.answers.add = function (answer) {
    // Using ID "Comments" contains Answers and Comments
    this.answerCtrl = browser.element(by.id('comments'));
    this.answerCtrl.element(by.css('textarea.newAnswer')).sendKeys(answer);

    // TODO: Currently Chrome browser has issues and separates the string.
    // Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
    // TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire answer
    this.answerCtrl.element(by.css('textarea.newAnswer')).sendKeys(protractor.Key.TAB);
    this.answerCtrl.element(by.id('doneBtn')).click();
  };

  // Edit last answer
  this.answers.edit = function (answer) {
    this.answers.editCtrl = this.answers.last().element(by.css('.answer'))
      .element(by.linkText('edit'));

    // Clicking 'edit' changes the DOM so these handles are updated here
    this.answers.editCtrl.click();
    var answersField = this.answers.last().element(by.css('.answer'))
      .element(by.css('textarea.editAnswer'));
    var saveCtrl = this.answers.last().element(by.css('.answerBtn'));

    answersField.sendKeys(protractor.Key.CONTROL, 'a');
    answersField.sendKeys(answer);
    answersField.sendKeys(protractor.Key.TAB);

    saveCtrl.click();
  }.bind(this);

  // Delete the answer at index.  If no index given, delete the last answer.
  // Note: "delete" is a reserved word, and
  // the functionality will be moved to "archive" at a later time
  this.answers.archive = function (index) {
    if (index === '') {
      this.answers.last().element(by.css('.answer')).element(by.linkText('delete')).click();
    } else {
      //console.log('should delete answer at index ' + index);
      this.answers.list.get(index).element(by.css('.answer')).element(by.linkText('delete'))
        .click();
    }

    util.clickModalButton('Delete');
  }.bind(this);

  // Flag for Export
  this.answers.flags = {};
  this.answers.flags.lastButtonSet = function () {
    return this.answers.last().element(by.css('.answer')).element(by.css('.icon-flag'));
  }.bind(this);

  this.answers.flags.lastButtonClear = function () {
    return this.answers.last().element(by.css('.answer')).element(by.css('.icon-flag-alt'));
  }.bind(this);

  // Private method to handle the upvote or downvote of an answer.
  // index: index of the answers.list to vote
  // direction: 0=upvote, 1=downvote
  var vote = function (index, direction) {
    this.answers.list.get(index).element(by.css('.vote')).all(by.css('a'))
      .then(function (voteCtrls) {
        voteCtrls[direction].click();
      });
  }.bind(this);

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
    this.comments.addCommentCtrl = this.answers.last().element(by.css('table.comments'))
      .element(by.css('a.addCommentLink'));
    this.comments.commentField = this.answers.last().element(by.model('newComment.content'));
    this.comments.submit = this.answers.last().element(by.css('button.btn-small'));

    // Click "add comment" at the end of the Answers list to un-collapse the comment text area.
    this.comments.addCommentCtrl.click();

    // TODO: Currently Chrome browser has issues and separates the string.
    // Firefox 28.0 correctly sends the string, but Firefox 29.0.1 does not
    // TODO: Currently sending this extra "TAB" key appears to help sendKeys send the entire comment
    //this.commentCtrl.element(by.css(".jqte_editor")).sendKeys(protractor.Key.TAB);
    //this.commentCtrl.element(by.id('doneBtn')).click();
    this.comments.commentField.sendKeys(comment);
    this.comments.commentField.sendKeys(protractor.Key.TAB);
    this.comments.submit.click();
  }.bind(this);

  // Edit the last comment.  Comments are interspersed with the answers
  this.comments.edit = function (comment) {
    this.comments.editCtrl = this.comments.last().element(by.linkText('edit'));

    this.comments.editCtrl.click();

    // Clicking 'edit' changes the DOM so these handles are updated here
    var commentsField = this.comments.last().element(by.css('textarea'));
    var saveCtrl = this.comments.last().element(by.partialButtonText('Save'));

    commentsField.sendKeys(protractor.Key.CONTROL, 'a');
    commentsField.sendKeys(comment);
    commentsField.sendKeys(protractor.Key.TAB);

    saveCtrl.click();
  }.bind(this);

  // Delete the comment at index.  If no index given, delete the last comment.
  // Note: "delete" is a reserved word, and
  // the functionality will be moved to "archive" at a later time
  this.comments.archive = function (index) {
    if (index === '') {
      this.comments.last().element(by.linkText('delete')).click();
    } else {
      //console.log('should delete comment at index ' + index);
      this.comments.list.get(index).element(by.linkText('delete')).click();
    }

    util.clickModalButton('Delete');
  }.bind(this);

}
