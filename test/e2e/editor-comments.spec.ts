import { expect } from '@playwright/test';
import { test } from './utils/fixtures';

import { EditorPage } from './pages/editor.page';

import { Project } from './utils/types';

import { addLexEntry, initTestProject } from './utils/testSetup';
import { SingleCommentElement } from './components/single-comment.component';


test.describe('Lexicon E2E Editor Comments', () => {
  const constants = require('./testConstants.json');

  const firstCommentText: string = 'First comment on Entry - Word.';
  const secondCommentText: string = 'First comment on Meaning 1 - Gloss.';
  const thirdCommentText: string = 'First comment on Meaning 1 - Definition.';

  let editorPage: EditorPage;

  const project: Project = {
    name: 'editor_comments_spec_ts Project 01',
    code: 'p01_editor_comments_spec_ts__project_01',
    id: ''
  };

  let horizontalPositionBubbleButtonsClosedComments: number;

  test.beforeAll(async ({ request, manager, managerTab }) => {
    project.id = await initTestProject(request, project.code, project.name, manager.username, []);
    // put in data
    await addLexEntry(request, project.code, constants.testEntry1);

    editorPage = new EditorPage(managerTab, project.id);

    await editorPage.goto();
    horizontalPositionBubbleButtonsClosedComments = await editorPage.firstCommentBubbleButton.evaluate(ele => ele.getBoundingClientRect().left);
  });

  test.beforeEach(async () => {
    await editorPage.goto();
  });


  test.afterEach(async ({}, testInfo) => {
    await editorPage.closeAllComments1();
    if (testInfo.status !== testInfo.expectedStatus)
      await editorPage.page.reload();
  });

  test.skip('Can create a comment and comment shows up correctly', async ({ manager }) => {
    await editorPage.firstCommentBubbleButton.click();

    await editorPage.commentCreationTextInput.fill(firstCommentText);
    await editorPage.commentCreationPostButton.click();

    // expect comment to show up immediately
    const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, firstCommentText);
    await expect(comment.commentLocator).toBeVisible();

    // expect comment to still shows up when page is reloaded
    await editorPage.page.reload();
    await editorPage.openSpecificComment1(comment.commentLocator, firstCommentText);
    //await editorPage.firstCommentBubbleButton.click();
    await expect(comment.commentLocator).toBeVisible();
    // "lexeme.th" hard coded based on testConstants, needs to change if testConstants ever changes
    expect(await comment.contextGuid.innerText()).toEqual('lexeme.th');
    expect(await comment.likeCounter.innerText()).toEqual('0 Likes');
    await expect(comment.likeButton).toBeVisible();
    await expect(comment.date).toContainText(/ago|in a few seconds|in less than a minute/);

    await expect(comment.author).toHaveText(manager.name);

    // close comment at the end of the test
    // await editorPage.firstCommentBubbleButton.click();
    // await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');
  });

  test.skip('Comments panel: add comment to another part of the entry', async ({ manager }) => {
    //await editorPage.thirdCommentBubbleButton.click();
    await editorPage.secondCommentBubbleButton.click();
    await editorPage.commentCreationTextInput.fill(secondCommentText);
    await editorPage.commentCreationPostButton.click({ position: { x: 1, y: 1 } });

    // expect comment to show up immediately
    const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, secondCommentText);
    await expect(comment.commentLocator).toBeVisible();

    // expect comment to still show up when page is reloaded
    await editorPage.page.reload();
    await editorPage.secondCommentBubbleButton.click();
    await expect(comment.commentLocator).toBeVisible();

    expect(await comment.likeCounter.innerText()).toEqual('0 Likes');
    await expect(comment.likeButton).toBeVisible();
    await expect(comment.date).toContainText(/ago|in a few seconds|in less than a minute/);
    await expect(comment.author).toHaveText(manager.name);

    // close comment at the end of the test
    // await editorPage.secondCommentBubbleButton.click();
    // await expect(editorPage.lexAppEditView).not.toHaveClass('right-panel-visible');
    // await editorPage.page.pause();
  });

  test.describe('Interactions with one comment', () => {
    test.beforeAll(async () => {
      await editorPage.goto();
      await editorPage.thirdCommentBubbleButton.click();
      await editorPage.commentCreationTextInput.fill(thirdCommentText);
      await editorPage.commentCreationPostButton.click();
      // close comment
      await editorPage.closeAllComments1();
      // await editorPage.thirdCommentBubbleButton.click();
      // await expect(editorPage.lexAppEditView).not.toHaveClass('right-panel-visible');
      // await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');
    });

    test('comments panel: check regarding value is hidden when the field value matches', async () => {

      await editorPage.openSpecificComment1(editorPage.thirdCommentBubbleButton, thirdCommentText);
      // await editorPage.openSpecificComment(editorPage.thirdCommentBubbleButton);
      // await editorPage.thirdCommentBubbleButton.click();
      // await editorPage.page.pause();
      const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, thirdCommentText);
      await expect(comment.commentLocator).toBeVisible();

      const updateText = 'update -';
      // Make sure it is hidden
      await expect(comment.regardingField).toBeHidden();

      // Change the field value and then make sure it appears
      await editorPage.senseCard.definitionInput.fill(updateText);
      // Click somewhere to save input (blur)
      await editorPage.page.locator('text=Pictures').nth(1).click();

      await expect(comment.regardingField).toBeVisible();

      // Make sure the regarding value matches what was originally there
      await expect(comment.regardingField).toContainText(constants.testEntry1.senses[0].definition.en.value);

      // await editorPage.thirdCommentBubbleButton.click();
      // await expect(editorPage.lexAppEditView).not.toHaveClass('right-panel-visible');
    });

    test('Can like a comment and like button disabled after clicking', async () => {
      await editorPage.openSpecificComment1(editorPage.thirdCommentBubbleButton, thirdCommentText);
      // await editorPage.thirdCommentBubbleButton.click();
      // await editorPage.page.pause();
      const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, thirdCommentText);

      // Should be clickable
      await expect(comment.likeButton).toBeVisible();
      await comment.likeButton.click();
      expect(await comment.likeCounter.innerText()).toEqual('1 Like');

      // Click on disabled button does not have an effect
      await expect(comment.disabledLikeButton).toBeVisible();
      await comment.disabledLikeButton.click();
      expect(await comment.likeCounter.innerText()).toEqual('1 Like'); // Should not change from previous test
      await expect(comment.disabledLikeButton).toBeVisible();

      // // close comment
      // await editorPage.thirdCommentBubbleButton.click();
      // await expect(editorPage.lexAppEditView).not.toHaveClass('right-panel-visible');
      // await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');
    });

    test('Comments panel: toggle all comments', async () => {
      // open
      await editorPage.lexAppToolbar.toggleCommentsButton.click();
      await expect(editorPage.commentSearchContainer).toBeVisible();
      await expect(editorPage.commentsRightPanel).not.toHaveCSS('width', '0px');

      // // close
      // await editorPage.lexAppToolbar.toggleCommentsButton.click();
      // await expect(editorPage.lexAppEditView).not.toHaveClass('right-panel-visible');
      // await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');
    });
  });


});
