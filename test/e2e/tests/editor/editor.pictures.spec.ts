import { expect } from '@playwright/test';
import { entries } from '../../constants';
import { defaultProject, projectPerTest, test } from '../../fixtures';
import { ConfigurationPageFieldsTab, EditorPage } from '../../pages';
import { ConfirmModal } from '../../pages/components';
import { Project } from '../../utils';

test.describe('Editor pictures', () => {

  const { project, entryIds } = defaultProject();
  const newProject = projectPerTest(true);

  let editorPageManager: EditorPage;

  test.beforeEach(({ managerTab }) => {
    editorPageManager = new EditorPage(managerTab, project());
  });

  test('First picture and caption is present', async ({ projectService }) => {
    const screenshotProject: Project = await newProject();
    await projectService.addLexEntry(screenshotProject.code, entries.entry1);
    await projectService.addPictureFileToProject(screenshotProject, entries.entry1.senses[0].pictures[0].fileName);

    const editorPagePicture = await new EditorPage(editorPageManager.page, screenshotProject).goto();
    const picture = editorPagePicture.picture(entries.entry1.senses[0].pictures[0].fileName);
    const img = await picture.elementHandle();
    await expect(editorPagePicture.page).toHaveScreenshot({ clip: await img.boundingBox() });
    const caption = editorPagePicture.caption(picture);
    await expect(caption).toHaveValue(entries.entry1.senses[0].pictures[0].caption.en.value);
  });

  test('File upload drop box is displayed when Add Picture is clicked and can be cancelled', async () => {
    await editorPageManager.goto();
    const addPictureButton = editorPageManager.senseCard.locator(editorPageManager.addPictureButtonSelector);
    await expect(addPictureButton).toBeVisible();
    const dropbox = editorPageManager.senseCard.locator(editorPageManager.dropbox.dragoverFieldSelector);
    await expect(dropbox).not.toBeVisible();
    const cancelAddingPicture = editorPageManager.getCancelDropboxButton(editorPageManager.senseCard, 'Picture');
    await expect(cancelAddingPicture).not.toBeVisible();

    await addPictureButton.click();
    await expect(addPictureButton).not.toBeVisible();
    await expect(dropbox).toBeVisible();
    await expect(cancelAddingPicture).toBeVisible();

    // file upload drop box is not displayed when Cancel Adding Picture is clicked
    await cancelAddingPicture.click();
    await expect(addPictureButton).toBeVisible();
    await expect(dropbox).not.toBeVisible();
    await expect(cancelAddingPicture).not.toBeVisible();
  });

  test('Showing and hiding captions', async ({ managerTab, browserName }) => {
    test.slow(browserName === 'firefox');
    const configurationPage = new ConfigurationPageFieldsTab(managerTab, project());

    await test.step('Hide empty captions', async () => {
      await configurationPage.goto();
      await configurationPage.tabLinks.fields.click();
      await configurationPage.toggleFieldExpanded('Meaning Fields', 'Pictures');
      await (await configurationPage.getFieldCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).check();
      await configurationPage.applyButton.click();
    });

    const caption = await test.step('Non-empty caption is visible', async () => {
      await editorPageManager.goto({ entryId: entryIds()[0] });
      await editorPageManager.showExtraFields(false);
      const picture = editorPageManager.picture(entries.entry1.senses[0].pictures[0].fileName);
      const caption = editorPageManager.caption(picture);
      await expect(caption).toBeVisible();
      return caption;
    });

    await test.step('Empty caption is hidden', async () => {
      await expect(caption).toBeVisible(); // it disappears immediately which could be annoying
      await caption.fill('');
      await expect(caption).not.toBeVisible(); // it disappears immediately which could be annoying
      // Navigate away to force changes to be saved
      await editorPageManager.goto({ entryId: entryIds()[1] });
      // Reload page then navigate back to this entry to verify changes took effect
      await editorPageManager.reload();
      await editorPageManager.goto({ entryId: entryIds()[0] });
      await expect(caption).not.toBeVisible();
    });

    await test.step('Show empty captions', async () => {
      await configurationPage.goto();
      await configurationPage.tabLinks.fields.click();
      await configurationPage.toggleFieldExpanded('Meaning Fields', 'Pictures');
      await (await configurationPage.getFieldCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).uncheck();
      await configurationPage.applyButton.click();
    });

    await test.step('Empty caption is visible', async () => {
      await editorPageManager.goto({ entryId: entryIds()[0] });
      await editorPageManager.showExtraFields(false);
      const picture = editorPageManager.picture(entries.entry1.senses[0].pictures[0].fileName);
      const caption = editorPageManager.caption(picture);
      await expect(caption).toBeVisible();
    });
  });

  test('Picture is removed when Delete is clicked & can change config to hide pictures and hide captions', async ({ projectService }) => {
    const testProject: Project = await newProject();
    await projectService.addLexEntry(testProject, entries.entry1);
    await projectService.addPictureFileToProject(testProject, entries.entry1.senses[0].pictures[0].fileName);
    const editorPagePicture = await new EditorPage(editorPageManager.page, testProject).goto();

    // Picture is removed when Delete is clicked
    let picture = editorPagePicture.picture(entries.entry1.senses[0].pictures[0].fileName);
    await editorPagePicture.deletePictureButton(entries.entry1.senses[0].pictures[0].fileName).click();
    const confirmModal = new ConfirmModal(editorPagePicture.page);
    await confirmModal.confirmButton.click();
    picture = editorPagePicture.picture(entries.entry1.senses[0].pictures[0].fileName);
    await expect(picture).not.toBeVisible();

    const configurationPage = await new ConfigurationPageFieldsTab(editorPageManager.page, testProject).goto();
    await configurationPage.tabLinks.fields.click();
    await (await configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).check();
    await configurationPage.toggleFieldExpanded('Meaning Fields', 'Pictures');
    await (await configurationPage.getFieldCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).uncheck();
    await configurationPage.applyButton.click();

    // can change config to hide pictures and hide captions
    await editorPagePicture.goto();
    picture = editorPagePicture.picture(entries.entry1.senses[0].pictures[0].fileName);
    await expect(picture).not.toBeVisible();
    expect(editorPagePicture.getPicturesOuterDiv(editorPagePicture.senseCard)).not.toBeVisible();
    await editorPagePicture.showExtraFields();
    expect(editorPagePicture.getPicturesOuterDiv(editorPagePicture.senseCard)).toBeVisible();
    await editorPagePicture.showExtraFields(false);
    expect(editorPagePicture.getPicturesOuterDiv(editorPagePicture.senseCard)).not.toBeVisible();
    picture = editorPagePicture.picture(entries.entry1.senses[0].pictures[0].fileName);
    await expect(picture).not.toBeVisible();
  });
});
