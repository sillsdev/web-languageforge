'use strict';

describe('Editor Comments', function () {
  var constants    = require('../../../../testConstants');
  var loginPage    = require('../../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../../bellows/pages/projectsPage.js');
  var editorPage   = require('../../pages/editorPage.js');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  it('setup: login, click on test project', function () {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', function () {
    // flaky assertion, also test/app/languageforge/lexicon/editor/e2e/editor-entry.spec.js:20
    expect(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    expect(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', function () {
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('click first comment bubble, add one comment', function () {
    editorPage.comment.bubbles.first.click();
    browser.sleep(1000);
    editorPage.comment.newComment.textarea.sendKeys('First comment on this word.');
    editorPage.comment.newComment.postBtn.click();
  });

  it('comments panel: check that comment shows up', function () {
    var comment = editorPage.comment.getComment(0);
    expect(comment.wholeComment.isPresent()).toBe(true);

    // Earlier tests modify the avatar and name of the manager user; don't check those
    //expect(comment.avatar.getAttribute('src')).toContain(constants.avatar);
    //expect(comment.author.getText()).toEqual(constants.managerName);
    expect(comment.score.getText()).toEqual('0 Likes');
    expect(comment.plusOne.isPresent()).toBe(true);
    expect(comment.content.getText()).toEqual('First comment on this word.');
    expect(comment.date.getText()).toMatch(/ago|in a few seconds/);
  });

  it('comments panel: add comment to another part of the entry', function () {
    editorPage.comment.bubbles.second.click();
    editorPage.comment.newComment.textarea.clear();
    editorPage.comment.newComment.textarea.sendKeys('Second comment.');
    editorPage.comment.newComment.postBtn.click();
  });

  it('comments panel: check that second comment shows up', function () {
    var comment = editorPage.comment.getComment(-1);
    expect(comment.wholeComment.isPresent()).toBe(true);

    // Earlier tests modify the avatar and name of the manager user; don't check those
    //expect(comment.avatar.getAttribute('src')).toContain(constants.avatar);
    //expect(comment.author.getText()).toEqual(constants.managerName);

    expect(comment.score.getText()).toEqual('0 Likes');
    expect(comment.plusOne.isPresent()).toBe(true);
    expect(comment.content.getText()).toEqual('Second comment.');
    expect(comment.date.getText()).toMatch(/ago|in a few seconds/);

    // Check the "regarding" section
    comment.regarding.toggle.click();
    expect(comment.regarding.container.isDisplayed()).toBe(true);
    var word    = constants.testEntry1.senses[0].definition.en.value;
    expect(comment.regarding.fieldValue.getText()).toEqual(word);
  });

  it('comments panel: click +1 button on first comment', function () {
    var comment = editorPage.comment.getComment(0);
    editorPage.comment.bubbles.first.click();

    // Should be clickable
    expect(comment.plusOneActive.getAttribute('data-ng-click')).not.toBe(null);
    comment.plusOneActive.click();
    expect(comment.score.getText()).toEqual('1 Like');
  });

  it('comments panel: +1 button disabled after clicking', function () {
    var comment = editorPage.comment.getComment(0);
    expect(comment.plusOneInactive.isDisplayed()).toBe(true);

    // Should NOT be clickable
    expect(comment.plusOneInactive.getAttribute('data-ng-click')).toBe(null);
    expect(comment.score.getText()).toEqual('1 Like'); // Should not change from previous test
  });

  it('comments panel: refresh returns to comment', function () {
    var comment = editorPage.comment.getComment(0);
    browser.refresh();
    browser.wait(expectedCondition.visibilityOf(editorPage.comment.bubbles.first), CONDITION_TIMEOUT);
    editorPage.comment.bubbles.first.click();
    browser.sleep(1000);
    expect(comment.content.getText()).toEqual('First comment on this word.');
  });

  it('comments panel: close comments panel clicking on bubble', function () {
    editorPage.comment.bubbles.first.click();
    browser.sleep(1000);
    expect(editorPage.commentDiv.getAttribute('class')).not.toContain('panel-visible');
  });

  it('comments panel: show all comments', function () {
    editorPage.edit.toCommentsLink.click();
    browser.sleep(1000);
    expect(editorPage.commentDiv.getAttribute('class')).toContain('panel-visible');
  });

  it('comments panel: close all comments clicking on main comments button', function () {
    editorPage.edit.toCommentsLink.click();
    browser.sleep(1000);
    expect(editorPage.commentDiv.getAttribute('class')).not.toContain('panel-visible');
  });

});
