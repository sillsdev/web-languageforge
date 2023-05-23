import { expect } from '@playwright/test';
import { defaultProject, test } from '../../fixtures';
import { ConfigurationPageFieldsTab, EditorPage } from '../../pages';

test.describe('Editor configuration', async () => {

  const { project } = defaultProject();

  test.beforeAll(async ({ managerTab }) => {
    const configurationPage = new ConfigurationPageFieldsTab(managerTab, project());
    await configurationPage.goto();
    await configurationPage.toggleFieldExpanded('Entry Fields', 'Word');
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'ภาษาไทย (IPA)')).check();
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'ภาษาไทย (Voice)')).check();
    await configurationPage.applyButton.click();
  });

  let editorPageManager: EditorPage;

  test.beforeEach(async ({ managerTab }) => {
    editorPageManager = new EditorPage(managerTab, project());
  });

  test('Can change configuration to make a writing system visible or invisible', async ({ managerTab }) => {
    await editorPageManager.goto();
    // word has only "th", "tipa" and "taud" visible
    await expect(editorPageManager.label('Word', editorPageManager.entryCard)).toHaveCount(3);
    await expect(editorPageManager.label('Word', editorPageManager.entryCard)).toHaveCount(3);
    await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'th')).toBeVisible();
    await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'tipa')).toBeVisible();
    await expect(editorPageManager.audioPlayer('Word', 'taud')).toBeVisible();

    // make "en" input system visible for "Word" field
    const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project()).goto();
    await configurationPage.toggleFieldExpanded('Entry Fields', 'Word');
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'English')).check();
    await configurationPage.applyButton.click();

    // check if "en" is visible
    await editorPageManager.goto();
    await expect(editorPageManager.label('Word', editorPageManager.entryCard)).toHaveCount(4);
    await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'en')).toBeVisible();

    // make "en" input system invisible for "Word" field
    await configurationPage.goto();
    await configurationPage.toggleFieldExpanded('Entry Fields', 'Word');
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'English')).uncheck();
    await configurationPage.applyButton.click();

    // check if "en" is invisible
    await editorPageManager.goto();
    await expect(editorPageManager.label('Word', editorPageManager.entryCard)).toHaveCount(3);
    await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'en')).not.toBeVisible();
  });

  test('Make "taud" input system invisible for "Word" field and "tipa" invisible for manager role, then ensure it worked and change it back', async ({ managerTab, memberTab }) => {
    test.slow();

    const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project()).goto();
    await configurationPage.toggleFieldExpanded('Entry Fields', 'Word');
    // Make "taud" input system invisible for "Word" field....
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', '(Voice)')).uncheck();
    // ....and "tipa" invisible for manager role
    await (await configurationPage.getCheckbox('Input Systems', 'IPA', 'Manager')).uncheck();
    await configurationPage.applyButton.click();

    // verify that contributor can still see "tipa"
    const editorPageMember = new EditorPage(memberTab, project());
    await editorPageMember.goto();
    await expect(editorPageMember.label('Word', editorPageMember.entryCard)).toHaveCount(2);
    await expect(editorPageMember.getTextarea(editorPageMember.entryCard, 'Word', 'th')).toBeVisible();
    await expect(editorPageMember.getTextarea(editorPageMember.entryCard, 'Word', 'tipa')).toBeVisible();

    // Word then only has "th" visible for manager role
    await editorPageManager.goto();
    await expect(editorPageManager.label('Word', editorPageManager.entryCard)).toHaveCount(1);
    await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'th')).toBeVisible();

    // restore visibility of "taud" for "Word" field
    await configurationPage.goto();
    await configurationPage.toggleFieldExpanded('Entry Fields', 'Word');
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', '(Voice)')).check();
    await configurationPage.applyButton.click();

    // Word has only "th" and "taud" visible for manager role
    await editorPageManager.goto();
    await expect(editorPageManager.label('Word', editorPageManager.entryCard)).toHaveCount(2);
    await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'th')).toBeVisible();
    await expect(editorPageManager.audioPlayer('Word', 'taud')).toBeVisible();

    // restore visibility of "tipa" input system for manager role
    await configurationPage.goto();
    await (await configurationPage.getCheckbox('Input Systems', 'IPA', 'Manager')).check();
    await configurationPage.applyButton.click();

    // Word has "th", "tipa" and "taud" visible again for manager role
    await editorPageManager.goto();
    await expect(editorPageManager.label('Word', editorPageManager.entryCard)).toHaveCount(3);
    await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'tipa')).toBeVisible();
  });

});
