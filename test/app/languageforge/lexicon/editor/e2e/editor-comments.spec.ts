import { by, element, ExpectedConditions, browser } from 'protractor';
import { BellowsLoginPage } from '../../../../bellows/pages/loginPage';
import { ProjectsPage } from '../../../../bellows/pages/projectsPage';
import { EditorPage } from '../../pages/editorPage';

const loginPage = new BellowsLoginPage();
const projectsPage = new ProjectsPage();
const editorPage = new EditorPage();
const constants = require('../../../../testConstants');
const CONDITION_TIMEOUT = 3000;

describe('Editor Comments', () => {

  it('setup: login, click on test project', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', () => {
    // flaky assertion, also test/app/languageforge/lexicon/editor/e2e/editor-entry.spec.js:20
    expect<any>(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    expect<any>(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', () => {
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('switch to comments page, add one comment', () => {
    editorPage.edit.toCommentsLink.click();
    editorPage.comment.newComment.textarea.sendKeys('First comment on this word.');
    editorPage.comment.newComment.postBtn.click();
  });

  it('comments page: check that comment shows up', () => {
    var comment = editorPage.comment.getComment(0);
    expect<any>(comment.wholeComment.isPresent()).toBe(true);

    // Earlier tests modify the avatar and name of the manager user; don't check those
    //expect<any>(comment.avatar.getAttribute('src')).toContain(constants.avatar);
    //expect<any>(comment.author.getText()).toEqual(constants.managerName);
    expect<any>(comment.score.getText()).toEqual('0');
    expect<any>(comment.plusOne.isPresent()).toBe(true);
    expect<any>(comment.content.getText()).toEqual('First comment on this word.');
    expect<any>(comment.date.getText()).toMatch(/ago|in a few seconds/);

    // This comment should have no "regarding" section
    expect<any>(comment.regarding.fieldLabel.isDisplayed()).toBe(false);
  });

  it('comments page: add comment about a specific part of the entry', () => {
    editorPage.comment.newComment.textarea.clear();
    editorPage.comment.newComment.textarea.sendKeys('Second comment.');
    editorPage.comment.entry.getOneFieldAllInputSystems('Word').first().click();
    editorPage.comment.newComment.postBtn.click();
  });

  it('comments page: check that second comment shows up', () => {
    var comment = editorPage.comment.getComment(-1);
    expect<any>(comment.wholeComment.isPresent()).toBe(true);

    // Earlier tests modify the avatar and name of the manager user; don't check those
    //expect<any>(comment.avatar.getAttribute('src')).toContain(constants.avatar);
    //expect<any>(comment.author.getText()).toEqual(constants.managerName);

    expect<any>(comment.score.getText()).toEqual('0');
    expect<any>(comment.plusOne.isPresent()).toBe(true);
    expect<any>(comment.content.getText()).toEqual('Second comment.');
    expect<any>(comment.date.getText()).toMatch(/ago|in a few seconds/);

    // This comment should have a "regarding" section
    expect<any>(comment.regarding.fieldLabel.isDisplayed()).toBe(true);
    var word    = constants.testEntry1.lexeme.th.value;
    var definition = constants.testEntry1.senses[0].definition.en.value;
    expect<any>(comment.regarding.word.getText()).toEqual(word);
    expect<any>(comment.regarding.definition.getText()).toEqual(definition);
    expect<any>(comment.regarding.fieldLabel.getText()).toEqual('Word');
    expect<any>(comment.regarding.fieldWsid .getText()).toEqual('th');
    expect<any>(comment.regarding.fieldValue.getText()).toEqual(word);
  });

  it('comments page: click +1 button on first comment', () => {
    var comment = editorPage.comment.getComment(0);
    expect<any>(comment.plusOne.getAttribute('data-ng-click')).not.toBe(null); // Should be clickable
    comment.plusOne.click();
    expect<any>(comment.score.getText()).toEqual('1');
  });

  it('comments page: +1 button disabled after clicking', () => {
    var comment = editorPage.comment.getComment(0);
    expect<any>(comment.plusOne.getAttribute('data-ng-click')).toBe(null); // Should NOT be clickable
    comment.plusOne.click();
    expect<any>(comment.score.getText()).toEqual('1'); // Should not change from previous test
  });

  it('comments page: refresh returns to comment', () => {
    var comment = editorPage.comment.getComment(0);
    browser.refresh();
    browser.wait(ExpectedConditions.visibilityOf(comment.content), CONDITION_TIMEOUT);
    expect<any>(comment.content.getText()).toEqual('First comment on this word.');
  });

});
