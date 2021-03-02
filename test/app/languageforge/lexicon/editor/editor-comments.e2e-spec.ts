import {browser, ExpectedConditions} from 'protractor';

import { protractor } from 'protractor/built/ptor';
import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {EditorPage} from '../shared/editor.page';

describe('Lexicon E2E Editor Comments', () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const editorPage = new EditorPage();

  it('setup: login, click on test project', async () => {
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', async () => {
    // flaky assertion, also test/app/languageforge/lexicon/editor/e2e/editor-entry.spec.js:20
    expect<any>(await editorPage.browse.entriesList.count()).toEqual(await editorPage.browse.getEntryCount());
    expect<any>(await editorPage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', async () => {
    await editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
  });

  it('click first comment bubble, type in a comment, add text to another part of the entry, ' +
    'submit comment to appear on original field', async () => {
      await editorPage.comment.bubbles.first.click();
      await editorPage.comment.newComment.textarea.sendKeys('First comment on this word.');
      await editorPage.edit.getMultiTextInputs('Definition').first().sendKeys('change value - ');
      await editorPage.comment.newComment.postBtn.click();
    });

  it('comments panel: check that comment shows up', async () => {
    const comment = editorPage.comment.getComment(0);
    expect<any>(await comment.contextGuid.getAttribute('textContent')).toEqual('lexeme.th'); // flaky

    // Earlier tests modify the avatar and name of the manager user; don't check those
    expect<any>(await comment.score.getText()).toEqual('0 Likes');
    expect<any>(await comment.plusOne.isPresent()).toBe(true);
    expect<any>(await comment.content.getText()).toEqual('First comment on this word.');
    expect<any>(await comment.date.getText()).toMatch(/ago|in a few seconds/);
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
    expect<any>(await comment.wholeComment.isPresent()).toBe(true);

    // Earlier tests modify the avatar and name of the manager user; don't check those
    expect<any>(await comment.score.getText()).toEqual('0 Likes');
    expect<any>(await comment.plusOne.isPresent()).toBe(true);
    expect<any>(await comment.content.getText()).toEqual('Second comment.');
    expect<any>(await comment.date.getText()).toMatch(/ago|in a few seconds/);
  });

  it('comments panel: check regarding value is hidden when the field value matches', async () => {
    const comment = editorPage.comment.getComment(-1);
    const updateText = 'update -';

    // Make sure it is hidden
    expect<any>(await comment.regarding.container.isDisplayed()).toBe(false);

    // Change the field value and then make sure it appears
    await editorPage.edit.getMultiTextInputs('Definition').first().sendKeys(updateText);
    expect<any>(await comment.regarding.container.isDisplayed()).toBe(true);

    // Make sure the regarding value matches what was originally there
    const word    = constants.testEntry1.senses[0].definition.en.value;
    expect<any>(await comment.regarding.fieldValue.getText()).toEqual(word);
    // Restore original value of Definition to not distort other tests
    for (let i = 0; i < updateText.length; i++) {
      await editorPage.edit.getMultiTextInputs('Definition').first().sendKeys(protractor.Key.BACK_SPACE);
    }

    // old stuff
    // This comment should have a "regarding" section
  });

  it('comments panel: click +1 button on first comment', async () => {
    const comment = editorPage.comment.getComment(0);
    await editorPage.comment.bubbles.first.click();

    // Should be clickable
    expect(await comment.plusOneActive.getAttribute('data-ng-click')).not.toBe(null);
    await comment.plusOneActive.click();
    expect<any>(await comment.score.getText()).toEqual('1 Like');
    });

  it('comments panel: +1 button disabled after clicking', async () => {
    const comment = editorPage.comment.getComment(0);
    expect<any>(await comment.plusOneInactive.isDisplayed()).toBe(true);

    // Should NOT be clickable
    expect<any>(await comment.plusOneInactive.getAttribute('data-ng-click')).toBe(null);
    expect<any>(await comment.score.getText()).toEqual('1 Like'); // Should not change from previous test
  });

  it('comments panel: refresh returns to comment', async () => {
    const comment = editorPage.comment.getComment(0);
    await browser.refresh();
    await browser.wait(ExpectedConditions.visibilityOf(editorPage.comment.bubbles.first), constants.conditionTimeout);
    await editorPage.comment.bubbles.first.click();
    await browser.wait(ExpectedConditions.visibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    expect<any>(await comment.content.getText()).toEqual('First comment on this word.');
  });

  it('comments panel: close comments panel clicking on bubble', async () => {
    await editorPage.comment.bubbles.first.click();
    await browser.wait(ExpectedConditions.invisibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    expect<any>(await editorPage.commentDiv.getAttribute('class')).not.toContain('panel-visible');
    // Hiding the comments panel triggers an animation (in hideRightPanel() in editor.component.ts) that uses
    // Angular's $interval() to animate hiding the panel, taking 1500 ms on large screens, or 500 ms on small ones.
    // Since it uses $interval(), the animation isn't disabled during our test run. Also, only AFTER the animation
    // completes will control.rightPanelVisible be set to false. But the 'panel-visible' attribute is removed
    // BEFORE the animation begins, so our browser.wait() call returns 1500 ms too soon. Which means we have to
    // wait for the animation to complete before subsequent tests will be ready to run. - 2019-08 RM
    await browser.sleep(1500 + 250);  // Extra 250 ms for paranoia
  });

  it('comments panel: show all comments', async () => {
    await editorPage.edit.toCommentsLink.click();
    browser.wait(ExpectedConditions.visibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    expect<any>(await editorPage.commentDiv.getAttribute('class')).toContain('panel-visible');
  });

  it('comments panel: close all comments clicking on main comments button', async () => {
    await editorPage.edit.toCommentsLink.click();
    await browser.wait(ExpectedConditions.invisibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    expect<any>(await editorPage.commentDiv.getAttribute('class')).not.toContain('panel-visible');
  });
});
