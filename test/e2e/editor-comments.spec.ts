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
  let lexEntries: number = 0;

  test.beforeAll(async ({ request, manager, managerTab }) => {
    project.id = await initTestProject(request, project.code, project.name, manager.username, []);
    // put in data
    await addLexEntry(request, project.code, constants.testEntry1);
    lexEntries++;

    editorPage = new EditorPage(managerTab, project.id);
  });

  // these tests will go into the entries list test file
  test.describe('Entries list', () => {
    test.beforeEach(async () => {
      await editorPage.entriesListPage.goto();
    })

    test.skip('Entries list has correct entries count', async () => {
      expect(await editorPage.entriesListPage.getTotalNumberOfEntries()).toEqual(lexEntries.toString());
    });

    test.skip('Can click on first entry', async () => {
      await editorPage.entriesListPage.clickOnEntry(constants.testEntry1.lexeme.th.value);
      expect(await editorPage.page.inputValue(editorPage.entryCard.entryName)).toEqual(constants.testEntry1.lexeme.th.value);
    });
  });

  test.describe('Editor page', () => {
    test.beforeEach(async () => {
      await editorPage.goto();
    });

    // this test will go into the editor tests file
    test.skip('Can go from entry to entries list', async () => {
      await editorPage.navigateToEntriesList();
      expect(editorPage.page.url()).toContain(editorPage.entriesListPage.url);
    });

    test.describe('Working with comments', () => {
      // JeanneSonTODO: find a better name for this test
      // name of other test which was combined in here: Comments panel: check that comment shows up
      // suggestion: Can create a comment and comment shows up correctly
      test('Click first comment bubble, type in a comment, post comment', async ({ manager }) => {
        await editorPage.page.pause();
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
        expect(await comment.likeCounter.innerText()).toEqual('0 Likes'); //panel-visible
        await expect(comment.likeButton).toBeVisible();
        await expect(comment.date).toContainText(/ago|in a few seconds|in less than a minute/);

        await expect(comment.author).toHaveText(manager.name);

        // close comment at the end of the test
        await editorPage.firstCommentBubbleButton.click();
        await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');
      });

      test('Comments panel: add comment to another part of the entry', async ({ manager }) => {
        //await editorPage.thirdCommentBubbleButton.click();
        await editorPage.secondCommentBubbleButton.click();
        await editorPage.commentCreationTextInput.fill(secondCommentText);
        await editorPage.commentCreationPostButton.click({position: {x: 1, y:1}});

        // expect comment to show up immediately
        const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, secondCommentText);
        await expect(comment.commentLocator).toBeVisible();

        // expect comment to still show up when page is reloaded
        await editorPage.page.reload();
        await editorPage.secondCommentBubbleButton.click({delay: 1500});
        await expect(comment.commentLocator).toBeVisible();

        expect(await comment.likeCounter.innerText()).toEqual('0 Likes');
        await expect(comment.likeButton).toBeVisible();
        await expect(comment.date).toContainText(/ago|in a few seconds|in less than a minute/);
        await expect(comment.author).toHaveText(manager.name);

        // close comment at the end of the test
        await editorPage.secondCommentBubbleButton.click();
        await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');
      });

      test.describe('Interactions with one comment', () => {
        test.beforeAll(async () => {
          await editorPage.goto();
          await editorPage.thirdCommentBubbleButton.click();
          await editorPage.commentCreationTextInput.fill(thirdCommentText);
          await editorPage.commentCreationPostButton.click();
          // close comment
          await editorPage.thirdCommentBubbleButton.click();
          await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');
        });

        test('comments panel: check regarding value is hidden when the field value matches', async () => {
          //await editorPage.page.reload();
          //await editorPage.page.pause();
          // const lexAppCommentView = editorPage.page.locator('#lexAppCommentView');
          // await lexAppCommentView.evaluate(
          //   node => {
          //     node.classList.add('panel-visible')
          //   }
          // );
          // await editorPage.thirdCommentBubbleButton.click();
          await editorPage.thirdCommentBubbleButton.click({delay: 1000});
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

          // Restore original value of Definition to not distort other tests
          await editorPage.senseCard.definitionInput.fill(constants.testEntry1.senses[0].definition.en.value);

          // old stuff
          // This comment should have a "regarding" section
        });

        // Comments panel: Like button disabled after clicking
        test('Comments panel: Like button on third comment', async () => {
          // JeanneSonTODO: write a function which opens the comment
          await editorPage.thirdCommentBubbleButton.click();
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

          // close comment
          await editorPage.thirdCommentBubbleButton.click();
          await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');

        });

      });

      test.afterEach(async ({ }, testInfo) => {
        if (testInfo.status !== testInfo.expectedStatus)
          await editorPage.page.reload();
      });

      // open and close all comments combined in one test
      test('Comments panel: toggle all comments', async () => {
        // open
        await editorPage.page.pause();
        await editorPage.lexAppToolbar.toggleCommentsButton.click({delay: 1500});
        await expect(editorPage.commentSearchContainer).toBeVisible();
        await expect(editorPage.commentsRightPanel).not.toHaveCSS('width', '0px');

        // close
        await editorPage.lexAppToolbar.toggleCommentsButton.click();
        await expect(editorPage.commentsRightPanel).toHaveCSS('width', '0px');
      });
    });

  });

  // already included in other tests
  // test('Comments panel: refresh returns to comment', async () => {
  //   const comment = editorPage.comment.getComment(0);
  //   await browser.refresh();
  //   await browser.wait(ExpectedConditions.visibilityOf(editorPage.comment.bubbles.first), constants.conditionTimeout);
  //   await editorPage.comment.bubbles.first.click();
  //   await browser.wait(ExpectedConditions.visibilityOf(editorPage.commentDiv), constants.conditionTimeout);
  //   expect<any>(await comment.content.getText()).toEqual('First comment on this word.');
  // });

  // already included in other tests
  test.skip('Comments panel: close comments panel clicking on bubble', async () => {
    // open first comment by clicking on first bubble
    //await editorPage.page.pause();

    await editorPage.firstCommentBubbleButton.click();
    await editorPage.page.pause();
    await expect(editorPage.page.locator('comments-right-panel')).not.toHaveCSS('width', '0px');
    const comment: SingleCommentElement = new SingleCommentElement(editorPage.page, firstCommentText);
    await expect(comment.commentLocator).toBeVisible();

    // close first comment by clicking on first bubble again
    await editorPage.firstCommentBubbleButton.click();
    await expect(comment.commentLocator).not.toBeVisible();
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



});
