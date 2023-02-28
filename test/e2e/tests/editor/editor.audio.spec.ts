import { expect } from '@playwright/test';
import { defaultProject, test } from '../../fixtures';
import { ConfigurationPageFieldsTab, EditorPage } from '../../pages';
import { ConfirmModal } from '../../pages/components';
import { testFilePath } from '../../utils';

test.describe('Editor audio', () => {

  const { project, entryIds } = defaultProject();

  test.beforeAll(async ({ managerTab }) => {
    const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project()).goto();
    await configurationPage.toggleFieldExpanded('Entry Fields', 'Lexeme Form');
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Lexeme Form', 'ภาษาไทย (IPA)')).check();
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Lexeme Form', 'ภาษาไทย (Voice)')).check();
    await configurationPage.applyButton.click();
  });

  test.describe('Member', () => {
    let editorPageMember: EditorPage;

    test.beforeEach(async ({ memberTab }) => {
      editorPageMember = new EditorPage(memberTab, project());
    });

    test('Audio input system is present, playable and has "more" control (member)', async () => {
      await editorPageMember.goto();
      const audio = editorPageMember.getAudioPlayer('Lexeme Form', 'taud');
      await expect(audio.playIcon).toBeVisible();
      await expect(audio.togglePlaybackAnchor).toBeEnabled();

      await expect(audio.dropdownToggle).toBeVisible();
      await expect(audio.dropdownToggle).toBeEnabled();
      await expect(audio.uploadButton).not.toBeVisible();
      // this button is only visible when user is observer and has only the right to download
      await expect(audio.downloadButton).not.toBeVisible();
    });

    test('Lexeme 2 (without audio): audio input system is not playable but has "upload" button (member)', async () => {
      await editorPageMember.goto({ entryId: entryIds()[1] });
      const audio = editorPageMember.getAudioPlayer('Lexeme Form', 'taud');
      await expect(audio.togglePlaybackAnchor).not.toBeVisible();
      await expect(audio.dropdownToggle).toBeEnabled();
      await expect(audio.uploadButton).toBeVisible();
      await expect(audio.uploadButton).toBeEnabled();
      await expect(audio.downloadButton).not.toBeVisible();
    });
  });

  test.describe('Observer', () => {
    let editorPageObserver: EditorPage;

    test.beforeEach(async ({ observerTab }) => {
      editorPageObserver = new EditorPage(observerTab, project());
    });

    test('Audio Input System is playable but does not have "more" control (observer)', async () => {
      await editorPageObserver.goto();
      const audio = editorPageObserver.getAudioPlayer('Lexeme Form', 'taud');
      await expect(audio.playIcon).toBeVisible();
      await expect(audio.togglePlaybackAnchor).toBeVisible();
      await expect(audio.togglePlaybackAnchor).toBeEnabled();
      await expect(audio.dropdownToggle).not.toBeVisible();
      await expect(audio.uploadButton).not.toBeVisible();
      await expect(audio.downloadButton).toBeVisible();
    });

    test('Lexeme 2 (without audio): audio input system is not playable and does not have "upload" button (observer)', async () => {
      await editorPageObserver.goto({ entryId: entryIds()[1] });
      const audio = editorPageObserver.getAudioPlayer('Lexeme Form', 'taud');
      await expect(audio.togglePlaybackAnchor).not.toBeVisible();
      await expect(audio.dropdownToggle).not.toBeVisible();
      await expect(audio.uploadButton).not.toBeVisible();
      await expect(audio.downloadButton).not.toBeVisible();
    });
  });

  test.describe('Manager', () => {

    let editorPageManager: EditorPage;

    test.beforeEach(async ({ managerTab }) => {
      editorPageManager = new EditorPage(managerTab, project());
    });

    test('Audio input system is present, playable and has "more" control (manager)', async () => {
      await editorPageManager.goto();
      const audio = editorPageManager.getAudioPlayer('Lexeme Form', 'taud');
      await expect(audio.playIcon).toBeVisible();
      await expect(audio.togglePlaybackAnchor).toBeEnabled();
      await expect(audio.dropdownToggle).toBeVisible();
      await expect(audio.dropdownToggle).toBeEnabled();
      await expect(audio.uploadButton).not.toBeVisible();
      // this button is only visible when user is observer and has only the right to download
      await expect(audio.downloadButton).not.toBeVisible();
    });

    test('Slider is present and updates with seeking', async () => {
      await editorPageManager.goto();
      const audio = editorPageManager.getAudioPlayer('Lexeme Form', 'taud');
      await expect(audio.slider).toBeVisible();
      const bounds = await audio.slider.boundingBox();
      const yMiddle = bounds.y + bounds.height / 2;
      await editorPageManager.page.mouse.click(bounds.x + 200, yMiddle);
      await expect(audio.audioProgressTime).toContainText("0:01 / 0:02");
    });

    test('File upload drop box is displayed when Upload is clicked & not displayed if upload cancelled (manager)', async () => {
      await editorPageManager.goto();
      const dropbox = editorPageManager.entryCard.locator(editorPageManager.dropbox.dragoverFieldSelector);
      await expect(dropbox).not.toBeVisible();

      const cancelAddingAudio = editorPageManager.getCancelDropboxButton(editorPageManager.entryCard, 'Audio');
      await expect(cancelAddingAudio).not.toBeVisible();

      const audio = editorPageManager.getAudioPlayer('Lexeme Form', 'taud');
      await audio.dropdownToggle.click();
      await audio.dropdownMenu.uploadReplacementButton.click();
      await expect(audio.dropdownToggle).not.toBeVisible();
      await expect(dropbox).toBeVisible();

      await expect(cancelAddingAudio).toBeVisible();
      await cancelAddingAudio.click();
      await expect(audio.dropdownToggle).toBeVisible();
      await expect(dropbox).not.toBeVisible();
      await expect(cancelAddingAudio).not.toBeVisible();
    });

    test('Lexeme 2 (without audio): audio input system is not playable but has "upload" button (manager)', async () => {
      await editorPageManager.goto({ entryId: entryIds()[1] });
      const audio = editorPageManager.getAudioPlayer('Lexeme Form', 'taud');
      await expect(audio.playIcon).not.toBeVisible();

      await expect(audio.dropdownToggle).not.toBeVisible();
      await expect(audio.uploadButton).toBeVisible();
      await expect(audio.uploadButton).toBeEnabled();
      await expect(audio.downloadButton).not.toBeVisible();
    });

    test('Can delete audio input system (manager)', async () => {
      await editorPageManager.goto();
      const audio = editorPageManager.getAudioPlayer('Lexeme Form', 'taud');
      await audio.dropdownToggle.click();
      await audio.dropdownMenu.deleteAudioButton.click();
      const confirmModal = new ConfirmModal(editorPageManager.page);
      await confirmModal.confirmButton.click();
      await expect(audio.uploadButton).toBeVisible();
    });

    test('Can\'t upload a non-audio file & can upload audio file', async () => {
      // to be independent from the audio deletion test above, go to entry 2 (has no audio)
      await editorPageManager.goto({ entryId: entryIds()[1] });
      const noticeElement = editorPageManager.noticeList;
      await expect(noticeElement.notices).toHaveCount(0);

      // Can't upload a non-audio file
      const audio = editorPageManager.getAudioPlayer('Lexeme Form', 'taud');
      await audio.uploadButton.click();

      // Note that Promise.all prevents a race condition between clicking and waiting for the file chooser.
      const [fileChooser] = await Promise.all([
        // It is important to call waitForEvent before click to set up waiting.
        editorPageManager.page.waitForEvent('filechooser'),
        audio.browseButton.click(),
      ]);
      await fileChooser.setFiles(testFilePath('TestImage.png'));

      await expect(noticeElement.notices).toBeVisible();
      await expect(noticeElement.notices).toContainText(`TestImage.png is not an allowed audio file. Ensure the file is`);
      const dropbox = editorPageManager.entryCard.locator(editorPageManager.dropbox.dragoverFieldSelector);
      await expect(dropbox).toBeVisible();
      await noticeElement.closeButton.click();
      await expect(noticeElement.notices).toHaveCount(0);

      // Can upload audio file
      const [fileChooser2] = await Promise.all([
        editorPageManager.page.waitForEvent('filechooser'),
        audio.browseButton.click(),
      ]);
      await fileChooser2.setFiles(testFilePath('TestAudio.mp3'));
      await expect(noticeElement.notices).toHaveCount(1);
      await expect(noticeElement.notices).toBeVisible();
      await expect(noticeElement.notices).toContainText('File uploaded successfully');
      await expect(audio.playIcon).toBeVisible();
      await expect(audio.togglePlaybackAnchor).toBeEnabled();
      await expect(audio.dropdownToggle).toBeVisible();
    });
  });

});
