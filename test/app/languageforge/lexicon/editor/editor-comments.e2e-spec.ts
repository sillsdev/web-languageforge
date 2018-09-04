import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {EditorPage} from '../shared/editor.page';

describe('Lexicon E2E Editor Comments', async () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const editorPage = new EditorPage();
  const util         = new Utils();

  it('setup: login, click on test project', async () => {
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', async () => {
    // flaky assertion, also test/app/languageforge/lexicon/editor/e2e/editor-entry.spec.js:20
    await expect<any>(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    await expect<any>(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', async () => {
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('click first comment bubble, type in a comment, add text to another part of the entry, ' +
    'submit comment to appear on original field', async () => {
      await editorPage.comment.bubbles.first.click();
      await editorPage.comment.newComment.textarea.sendKeys('First comment on this word.');
      await editorPage.edit.getMultiTextInputs('Definition').first().sendKeys('change value - ');
      await browser.wait(ExpectedConditions.visibilityOf(editorPage.comment.newComment.postBtn),
        constants.conditionTimeout);
      await editorPage.comment.newComment.postBtn.click();
    });

  it('comments panel: check that comment shows up', async () => {
    // added browser.sleep to avoid Timeout warnings information
    await browser.sleep(1000);
    const comment = editorPage.comment.getComment(0);
    await browser.wait(() => (comment.contextGuid.getAttribute('textContent')),
        constants.conditionTimeout).then (async () =>
    await expect<any>(comment.contextGuid.getAttribute('textContent')).toEqual('lexeme.th'));

    // Earlier tests modify the avatar and name of the manager user; don't check those
    await expect<any>(comment.score.getText()).toEqual('0 Likes');
    await expect<any>(comment.plusOne.isPresent()).toBe(true);
    await expect<any>(comment.content.getText()).toEqual('First comment on this word.');
    await expect<any>(comment.date.getText()).toMatch(/ago|in a few seconds/);
  });

  it('comments panel: add comment to another part of the entry', async () => {
    const definitionField = editorPage.edit.getMultiTextInputs('Definition').first();
    await definitionField.clear();
    await definitionField.sendKeys(
      constants.testEntry1.senses[0].definition.en.value
    );
    await editorPage.comment.bubbles.second.click();
    await editorPage.comment.newComment.textarea.clear();
    await editorPage.comment.newComment.textarea.sendKeys('Second comment.');
    await editorPage.comment.newComment.postBtn.click();
  });

  it('comments panel: check that second comment shows up', async () => {
    const comment = editorPage.comment.getComment(-1);
    await expect<any>(comment.wholeComment.isPresent()).toBe(true);

    // Earlier tests modify the avatar and name of the manager user; don't check those
    await expect<any>(comment.score.getText()).toEqual('0 Likes');
    await expect<any>(comment.plusOne.isPresent()).toBe(true);
    await expect<any>(comment.content.getText()).toEqual('Second comment.');
    await expect<any>(comment.date.getText()).toMatch(/ago|in a few seconds/);
  });

  it('comments panel: check regarding value is hidden when the field value matches', async () => {
    const comment = editorPage.comment.getComment(-1);

    // Make sure it is hidden
    await expect<any>(comment.regarding.container.isDisplayed()).toBe(false);

    // Change the field value and then make sure it appears
    await editorPage.edit.getMultiTextInputs('Definition').first().sendKeys('update - ');
    await expect<any>(comment.regarding.container.isDisplayed()).toBe(true);

    // Make sure the regarding value matches what was originally there
    const word    = constants.testEntry1.senses[0].definition.en.value;
    await expect<any>(comment.regarding.fieldValue.getText()).toEqual(word);

    // old stuff
    // This comment should have a "regarding" section
  });

  it('comments panel: click +1 button on first comment', async () => {
    const comment = editorPage.comment.getComment(0);
    await editorPage.comment.bubbles.first.click();

    // Should be clickable
    await expect(comment.plusOneActive.getAttribute('data-ng-click')).not.toBe(null);
    await comment.plusOneActive.click();
    await expect<any>(comment.score.getText()).toEqual('1 Like');
    });

  it('comments panel: +1 button disabled after clicking', async () => {
    const comment = editorPage.comment.getComment(0);
    await expect<any>(comment.plusOneInactive.isDisplayed()).toBe(true);

    // Should NOT be clickable
    await expect<any>(comment.plusOneInactive.getAttribute('data-ng-click')).toBe(null);
    await expect<any>(comment.score.getText()).toEqual('1 Like'); // Should not change from previous test
  });

  it('comments panel: refresh returns to comment', async () => {
    const comment = editorPage.comment.getComment(0);
    await browser.refresh();
    await browser.wait(ExpectedConditions.visibilityOf(editorPage.comment.bubbles.first), constants.conditionTimeout);
    await editorPage.comment.bubbles.first.click();
    await browser.wait(ExpectedConditions.visibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    await expect<any>(comment.content.getText()).toEqual('First comment on this word.');
  });

  it('comments panel: close comments panel clicking on bubble', async () => {
    await editorPage.comment.bubbles.first.click();
    await browser.wait(ExpectedConditions.invisibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    await expect<any>(editorPage.commentDiv.getAttribute('class')).not.toContain('panel-visible');
  });

  it('comments panel: show all comments', async () => {
    // ToDo: investigate why this was needed to be added after editor.js changed to TS - IJH 2018-05
    // added browser.sleep to avoid Timeout warnings information
    await browser.sleep(2000);
    await browser.wait(() => editorPage.edit.toCommentsLink, Utils.conditionTimeout);
    await editorPage.edit.toCommentsLink.click();
    await browser.wait(ExpectedConditions.visibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    await expect<any>(editorPage.commentDiv.getAttribute('class')).toContain('panel-visible');
  });

  it('comments panel: close all comments clicking on main comments button', async () => {
    await editorPage.edit.toCommentsLink.click();
    await browser.wait(ExpectedConditions.invisibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    await expect<any>(editorPage.commentDiv.getAttribute('class')).not.toContain('panel-visible');
  });
});
