import { expect } from '@playwright/test';
import { test } from './utils/fixtures';

import { EditorPage } from './pages/editor.page';

import { Project } from './utils/types';

import { addLexEntry, initTestProject } from './utils/testSetup';
import { SingleCommentElement } from './components/single-comment.component';


test.describe('Lexicon E2E Editor Comments', () => {
  const constants = require('./testConstants.json');
  const firstCommentText: string = 'First comment on Entry - Word.';
  const secondCommentText: string = 'First comment on Meaning 1 - Definition.';

  let editorPage: EditorPage;

  const project: Project = {
    name: 'editor_comments_spec_ts Project 01',
    code: 'p01_editor_comments_spec_ts__project_01',
    id: ''
  };
  let lexEntries: number = 0;


  test.beforeAll(async ({ request, managerTab, manager }) => {

    project.id = await initTestProject(request, project.code, project.name, manager.username, []);
    // put in data
    await addLexEntry(request, project.code, constants.testEntry1);
    lexEntries++;

    editorPage = new EditorPage(managerTab, project.id);
  });

  test.beforeEach(async () => {
    await editorPage.goto();
    //await editorPage.goBackToList();

  });

  test('Can go from entry to entry list', async () => {
    await editorPage.navigateToEntriesList();
    expect(editorPage.page.url()).toContain(editorPage.entriesListPage.url);
  })

  test.describe('Entries list', () => {
    test.beforeEach(async () => {
      await editorPage.entriesListPage.goto();
    })

    test('Entries list has correct entries count', async () => {
      expect(await editorPage.entriesListPage.getTotalNumberOfEntries()).toEqual(lexEntries.toString());
    });

    test('Can click on first entry', async () => {
      await editorPage.entriesListPage.clickOnEntry(constants.testEntry1.lexeme.th.value);
      expect(await editorPage.page.inputValue(editorPage.entryCard.entryName)).toEqual(constants.testEntry1.lexeme.th.value);
    });
  });

  // JeanneSonTODO: find a better name for this test
// name of other test which was combined in here: Comments panel: check that comment shows up
  test.only('Click first comment bubble, type in a comment, post comment', async () => {
    await editorPage.firstCommentBubbleButton.click();
    await editorPage.commentCreationTextInput.fill(firstCommentText);
    await editorPage.commentCreationPostButton.click();

    // expect comment to show up immediately
    const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, firstCommentText);
    await expect(comment.commentLocator).toBeVisible();

    // expect comment to still shows up when page is reloaded
    await editorPage.page.reload();
    await editorPage.firstCommentBubbleButton.click();
    await expect(comment.commentLocator).toBeVisible();
    // "lexeme.th" hard coded based on testConstants, needs to change if testConstants ever changes
    expect(await comment.contextGuid.innerText()).toEqual('lexeme.th');
    expect(await comment.likeCounter.innerText()).toEqual('0 Likes');
    await expect(comment.likeButton).toBeVisible();
    await expect(comment.date).toContainText(/ago|in a few seconds|in less than a minute/);
    // TOASK: should I check for those?
    // Earlier tests modify the avatar and name of the manager user; don't check those
  });


  test.only('Comments panel: add comment to another part of the entry', async () => {
    await editorPage.thirdCommentBubbleButton.click();
    await editorPage.commentCreationTextInput.fill(secondCommentText);
    await editorPage.commentCreationPostButton.click();

    // expect comment to still shows up when page is reloaded
    await editorPage.page.reload();
    await editorPage.thirdCommentBubbleButton.click();
    const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, secondCommentText);
    await expect(comment.commentLocator).toBeVisible();

    expect(await comment.likeCounter.innerText()).toEqual('0 Likes');
    await expect(comment.likeButton).toBeVisible();
    await expect(comment.date).toContainText(/ago|in a few seconds|in less than a minute/);
    // TOASK: should I check for those? - yes
    // Earlier tests modify the avatar and name of the manager user; don't check those
  });

  test.only('comments panel: check regarding value is hidden when the field value matches', async () => {
    await editorPage.page.reload();
    await editorPage.thirdCommentBubbleButton.click();
    const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, secondCommentText);
    await expect(comment.commentLocator).toBeVisible();

    const updateText = 'update -';
    // Make sure it is hidden
    await expect(comment.regardingField).toBeHidden();

    // Change the field value and then make sure it appears
    await editorPage.senseCard.definitionInput.fill(updateText);
    await expect(comment.regardingField).toBeVisible();

    // Make sure the regarding value matches what was originally there
    await expect(comment.regardingField).toContainText(constants.testEntry1.senses[0].definition.en.value);

    // Restore original value of Definition to not distort other tests
    await editorPage.senseCard.definitionInput.fill(constants.testEntry1.senses[0].definition.en.value);

    // old stuff
    // This comment should have a "regarding" section
  });

  test.only('Comments panel: Like button on first comment', async () => {
    await editorPage.firstCommentBubbleButton.click();
    const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, firstCommentText);

    // Should be clickable
    await expect(comment.likeButton).toBeVisible();
    await comment.likeButton.click();
    expect(await comment.likeCounter.innerText()).toEqual('1 Like');
  });

  test.only('Comments panel: Like button disabled after clicking', async () => {
    const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, firstCommentText);
    await expect(comment.disabledLikeButton).toBeVisible();

    // Click on disabled button does not have an effect
    await comment.disabledLikeButton.click();
    expect(await comment.likeCounter.innerText()).toEqual('1 Like'); // Should not change from previous test
  });

  // TOASK: this is not the current behavior of the app - already included in other tests
  // test('Comments panel: refresh returns to comment', async () => {
  //   const comment = editorPage.comment.getComment(0);
  //   await browser.refresh();
  //   await browser.wait(ExpectedConditions.visibilityOf(editorPage.comment.bubbles.first), constants.conditionTimeout);
  //   await editorPage.comment.bubbles.first.click();
  //   await browser.wait(ExpectedConditions.visibilityOf(editorPage.commentDiv), constants.conditionTimeout);
  //   expect<any>(await comment.content.getText()).toEqual('First comment on this word.');
  // });

  test.only('Comments panel: close comments panel clicking on bubble', async () => {
    // open first comment by clicking on first bubble
    await editorPage.firstCommentBubbleButton.click();
    await expect(editorPage.firstCommentBubbleButton).toBeVisible();

    // close first comment by clicking on first bubble again
    await editorPage.firstCommentBubbleButton.click();
    await expect(editorPage.firstCommentBubbleButton).not.toBeVisible();
    // the entire comments panel is now closed
    await expect(editorPage.commentsPanel).not.toBeVisible();

    // await editorPage.comment.bubbles.first.click();
    // await browser.wait(ExpectedConditions.invisibilityOf(editorPage.commentDiv), constants.conditionTimeout);
    // expect<any>(await editorPage.commentDiv.getAttribute('class')).not.toContain('panel-visible');
    // // Hiding the comments panel triggers an animation (in hideRightPanel() in editor.component.ts) that uses
    // // Angular's $interval() to animate hiding the panel, taking 1500 ms on large screens, or 500 ms on small ones.
    // // Since it uses $interval(), the animation isn't disabled during our test run. Also, only AFTER the animation
    // // completes will control.rightPanelVisible be set to false. But the 'panel-visible' attribute is removed
    // // BEFORE the animation begins, so our browser.wait() call returns 1500 ms too soon. Which means we have to
    // // wait for the animation to complete before subsequent tests will be ready to run. - 2019-08 RM
    // await browser.sleep(1500 + 250);  // Extra 250 ms for paranoia
  });

  // test('comments panel: show all comments', async () => {
  //   await editorPage.edit.toCommentsLink.click();
  //   browser.wait(ExpectedConditions.visibilityOf(editorPage.commentDiv), constants.conditionTimeout);
  //   expect<any>(await editorPage.commentDiv.getAttribute('class')).toContain('panel-visible');
  // });

  // test('comments panel: close all comments clicking on main comments button', async () => {
  //   await editorPage.edit.toCommentsLink.click();
  //   await browser.wait(ExpectedConditions.invisibilityOf(editorPage.commentDiv), constants.conditionTimeout);
  //   expect<any>(await editorPage.commentDiv.getAttribute('class')).not.toContain('panel-visible');
  // });
});
