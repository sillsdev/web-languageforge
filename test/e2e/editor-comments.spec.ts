import { expect } from '@playwright/test';
import { entries } from './constants';
import { ConfigurationPageFieldsTab } from './pages/configuration-fields.tab';
import { EditorPage } from './pages/editor.page';
import { projectPerTest, test } from './utils/fixtures';
import { addLexEntry, addWritingSystemToProject } from './utils/testSetup';

test.describe('Lexicon Editor Comments', () => {

  const project = projectPerTest();

  test('Creating and viewing comments', async ({ request, managerTab }) => {
    test.slow();

    await test.step('And input systems and entries', async () => {
      await addWritingSystemToProject(request, project(), 'th-fonipa', 'tipa');
      await addWritingSystemToProject(request, project(), 'th-Zxxx-x-audio', 'taud');

      await addLexEntry(request, project(), entries.entry1);
      await addLexEntry(request, project(), entries.entry2);
      await addLexEntry(request, project(), entries.multipleMeaningEntry);

      const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project()).goto();
      await configurationPage.toggleField('Entry Fields', 'Word');
      await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'English')).check();
      await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'ภาษาไทย (Voice)')).check();
      await configurationPage.applyButton.click();
    });

    const editorPage = await test.step('Create comments and replies', async () => {
      const editorPage = await new EditorPage(managerTab, project()).goto();

      // Create comments on "Word" "th"
      await editorPage.commentBubble('Word', 'th').click();

      const comment1 = await editorPage.postComment('Test comment 1');
      await comment1.toggleReplies();
      await comment1.postReply('Test reply 1.1');
      await comment1.postReply('Test reply 1.2');

      const comment2 = await editorPage.postComment('Test comment 2');
      await comment2.toggleReplies();
      await comment2.postReply('Test reply 2.1');
      await comment2.postReply('Test reply 2.2');

      // Create comments on "Word" "en"
      await editorPage.commentBubble('Word', 'en').click();

      const comment3 = await editorPage.postComment('Test comment 3');
      await comment3.toggleReplies();
      await comment3.postReply('Test reply 3.1');

      // Create comments on "Part of Speech"
      await editorPage.commentBubble('Part of Speech').click();

      const comment4 = await editorPage.postComment('Test comment 4');
      await comment4.toggleReplies();
      await comment4.postReply('Test reply 4.1');

      return editorPage;
    });

    await test.step('Verify comments and replies', async () => {
      await editorPage.reload();

      await expect(editorPage.commentCount('Word', 'th')).toHaveText('2');
      await editorPage.commentBubble('Word', 'th').click();
      await expect(editorPage.comments).toHaveCount(2);
      const comment1 = editorPage.getComment(1);
      await expect(comment1.content).toContainText('Test comment 1');
      await comment1.toggleReplies();
      await expect(comment1.replies).toHaveCount(2);
      await expect(comment1.getReply(1).content).toContainText('Test reply 1.1');
      await expect(comment1.getReply(2).content).toContainText('Test reply 1.2');

      const comment2 = editorPage.getComment(2);
      await expect(comment2.content).toContainText('Test comment 2');
      await comment2.toggleReplies();
      await expect(comment2.replies).toHaveCount(2);
      await expect(comment2.getReply(1).content).toContainText('Test reply 2.1');
      await expect(comment2.getReply(2).content).toContainText('Test reply 2.2');

      await expect(editorPage.commentCount('Word', 'en')).toHaveText('1');

      await expect(editorPage.commentCount('Part of Speech')).toHaveText('1');
      await editorPage.commentBubble('Part of Speech').click();
      await expect(editorPage.comments).toHaveCount(1);
      const comment4 = editorPage.getComment(1);
      await expect(comment4.content).toContainText('Test comment 4');
      await comment4.toggleReplies();
      await expect(comment4.replies).toHaveCount(1);
      await expect(comment4.getReply(1).content).toContainText('Test reply 4.1');
    });

    await test.step('Like and change state', async () => {
      await editorPage.commentBubble('Word', 'th').click();
      let comment2 = editorPage.getComment(2);

      // Likes
      await expect(comment2.likes).toContainText('0 Likes');
      await comment2.likeButton.click();
      await expect(comment2.likes).toContainText('1 Like');

      // States
      await expect(comment2.stateButton.markToDo).toBeVisible();
      await expect(comment2.stateButton.resolveToDo).not.toBeVisible();
      await expect(comment2.stateButton.openToDo).not.toBeVisible();
      await comment2.stateButton.markToDo.click();
      await expect(comment2.stateButton.markToDo).not.toBeVisible();
      await expect(comment2.stateButton.resolveToDo).toBeVisible();
      await expect(comment2.stateButton.openToDo).not.toBeVisible();
      await comment2.stateButton.resolveToDo.click();
      await expect(comment2.stateButton.markToDo).not.toBeVisible();
      await expect(comment2.stateButton.resolveToDo).not.toBeVisible();
      await expect(comment2.stateButton.openToDo).toBeVisible();

      // Verify it stuck
      await editorPage.reload();
      await editorPage.commentBubble('Word', 'th').click();
      comment2 = editorPage.getComment(2);
      await expect(comment2.likes).toContainText('1 Like');
      await expect(comment2.stateButton.markToDo).not.toBeVisible();
      await expect(comment2.stateButton.resolveToDo).not.toBeVisible();
      await expect(comment2.stateButton.openToDo).toBeVisible();
    });

    await test.step('View and hide comments', async () => {
      // open all
      await editorPage.toggleAllComments();
      await expect(editorPage.comments).toHaveCount(4);

      // close all
      await editorPage.toggleAllComments();
      await expect(editorPage.comments).toHaveCount(0);

      // open all
      await editorPage.toggleAllComments();
      await expect(editorPage.comments).toHaveCount(4);

      // open for field
      await editorPage.toggleComments('Word', 'th');
      await expect(editorPage.comments).toHaveCount(2);

      // open all
      await editorPage.toggleAllComments();
      await expect(editorPage.comments).toHaveCount(4);

      // open for field
      await editorPage.toggleComments('Word', 'th');
      await expect(editorPage.comments).toHaveCount(2);

      // close field
      await editorPage.toggleComments('Word', 'th');
      await expect(editorPage.comments).toHaveCount(0);

      // open for field
      await editorPage.toggleComments('Word', 'en');
      await expect(editorPage.comments).toHaveCount(1);

      // open for different field
      await editorPage.toggleComments('Word', 'th');
      await expect(editorPage.comments).toHaveCount(2);
    });
  });
});
