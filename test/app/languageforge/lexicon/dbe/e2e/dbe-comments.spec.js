'use strict';

describe('Browse and edit page (DBE) - comments', function() {
  var constants    = require('../../../../testConstants');
  var loginPage    = require('../../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../../bellows/pages/projectsPage.js');
  var util         = require('../../../../bellows/pages/util.js');
  var dbePage      = require('../../pages/dbePage.js');
  var dbeUtil      = require('../../pages/dbeUtil.js');
  var configPage   = require('../../pages/configurationPage.js');

  it('setup: login, click on test project', function() {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', function() {
    expect(dbePage.browse.entriesList.count()).toEqual(dbePage.browse.getEntryCount());
    expect(dbePage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', function() {
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
  });

  it('switch to comments page, add one comment', function() {
    dbePage.edit.toCommentsLink.click();
    dbePage.comment.newComment.textarea.sendKeys('First comment on this word.');
    dbePage.comment.newComment.postBtn.click();
  });

  it('comments page: check that comment shows up', function() {
    var comment = dbePage.comment.getComment(0);
    expect(comment.wholeComment.isPresent()).toBe(true);
    // Earlier tests modify the avatar and name of the manager user; don't check those
    //expect(comment.avatar.getAttribute('src')).toContain(constants.avatar);
    //expect(comment.author.getText()).toEqual(constants.managerName);
    expect(comment.date.getText()).toContain('ago');
    expect(comment.score.getText()).toEqual('0');
    expect(comment.plusOne.isPresent()).toBe(true);
    expect(comment.content.getText()).toEqual('First comment on this word.');
    // This comment should have no "regarding" section
    expect(comment.regarding.fieldLabel.isDisplayed()).toBe(false);
  });

  it('comments page: add comment about a specific part of the entry', function() {
    dbePage.comment.newComment.textarea.clear();
    dbePage.comment.newComment.textarea.sendKeys('Second comment.');
    dbePage.comment.entry.getOneField('Word').then(function(elem) {
      elem.$$('span.wsid').first().click();
    });
    dbePage.comment.newComment.postBtn.click();
  });

  it('comments page: check that second comment shows up', function() {
    var comment = dbePage.comment.getComment(-1);
    expect(comment.wholeComment.isPresent()).toBe(true);
    // Earlier tests modify the avatar and name of the manager user; don't check those
    //expect(comment.avatar.getAttribute('src')).toContain(constants.avatar);
    //expect(comment.author.getText()).toEqual(constants.managerName);
    expect(comment.date.getText()).toContain('ago');
    expect(comment.score.getText()).toEqual('0');
    expect(comment.plusOne.isPresent()).toBe(true);
    expect(comment.content.getText()).toEqual('Second comment.');
    // This comment should have a "regarding" section
    expect(comment.regarding.fieldLabel.isDisplayed()).toBe(true);
    var word    = constants.testEntry1.lexeme.th.value;
    var meaning = constants.testEntry1.senses[0].definition.en.value;
    expect(comment.regarding.word.getText()).toEqual(word);
    expect(comment.regarding.meaning.getText()).toEqual(meaning);
    expect(comment.regarding.fieldLabel.getText()).toEqual('Word');
    expect(comment.regarding.fieldWsid .getText()).toEqual('th');
    expect(comment.regarding.fieldValue.getText()).toEqual(word);
  });

  it('comments page: click +1 button on first comment', function() {
    var comment = dbePage.comment.getComment(0);
    expect(comment.plusOne.getAttribute('ng-click')).not.toBe(null); // Should be clickable
    comment.plusOne.click();
    expect(comment.score.getText()).toEqual('1');
  });

  it('comments page: +1 button disabled after clicking', function() {
    var comment = dbePage.comment.getComment(0);
    expect(comment.plusOne.getAttribute('ng-click')).toBe(null); // Should NOT be clickable
    comment.plusOne.click();
    expect(comment.score.getText()).toEqual('1'); // Should not change from previous test
  });

});
