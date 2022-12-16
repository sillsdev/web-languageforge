import { expect, Locator } from '@playwright/test';
import { ConfirmModal } from './components';
import { entries, users } from './constants';
import { ConfigurationPageFieldsTab } from './pages/configuration-fields.tab';
import { EditorPage } from './pages/editor.page';
import { EntryListPage } from './pages/entry-list.page';
import { Project, testFilePath } from './utils';
import { projectPerTest, test } from './utils/fixtures';
import { addAudioVisualFileToProject, addLexEntry, addPictureFileToProject, addUserToProject, addWritingSystemToProject, initTestProject } from './utils/testSetup';


test.describe('Entry Editor and Entries List', () => {

  const lexemeLabel = 'Word';

  const project: Project = {
    name: 'editor_entry_spec_ts Project 01',
    code: 'p01_editor_entry_spec_ts__project_01',
    id: ''
  };
  let lexEntriesIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    project.id = (await initTestProject(request, project.code, project.name, users.manager, [users.member])).id;
    await addUserToProject(request, project, users.observer, "observer");
    await addWritingSystemToProject(request, project, 'th-fonipa', 'tipa');
    await addWritingSystemToProject(request, project, 'th-Zxxx-x-audio', 'taud');

    await addPictureFileToProject(request, project, entries.entry1.senses[0].pictures[0].fileName);
    await addAudioVisualFileToProject(request, project, entries.entry1.lexeme['th-Zxxx-x-audio'].value);
    // put in data
    lexEntriesIds.push(await addLexEntry(request, project.code, entries.entry1));
    lexEntriesIds.push(await addLexEntry(request, project.code, entries.entry2));
    lexEntriesIds.push(await addLexEntry(request, project.code, entries.multipleMeaningEntry));
  });

  test.describe('Entries List', () => {

    let entryListPageManager: EntryListPage;

    test.beforeEach(async ({ managerTab }) => {
      entryListPageManager = await new EntryListPage(managerTab, project).goto();
    });

    test.afterEach(async ({ }, testInfo) => {
      if (testInfo.status !== testInfo.expectedStatus)
        await entryListPageManager.page.reload();
    });

    test('Entries list has correct number of entries', async () => {
      await entryListPageManager.expectTotalNumberOfEntries(lexEntriesIds.length);
    });

    test('Search function works correctly', async () => {
      await entryListPageManager.filterInput.fill('asparagus');
      await expect(entryListPageManager.matchCount).toContainText(/1(?= \/)/);

      // remove filter, filter again, have same result
      await entryListPageManager.filterInputClearButton.click();
      await entryListPageManager.filterInput.fill('asparagus');
      await expect(entryListPageManager.matchCount).toContainText(/1(?= \/)/);
      // remove filter for next test - if this tests fails, the afterEach ensure that it does not impact the next test
      await entryListPageManager.filterInputClearButton.click();
    });

    test('Can click on first entry', async () => {
      const [, editorPageManager] = await Promise.all([
        entryListPageManager.entry(entries.entry1.lexeme.th.value).click(),
        new EditorPage(entryListPageManager.page, project).waitFor(),
      ])
      await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toHaveValue(entries.entry1.lexeme.th.value);
    });

  });

  test.describe('Entry Editor', () => {

    let editorPageManager: EditorPage;

    test.beforeEach(async ({ managerTab }) => {
      editorPageManager = new EditorPage(managerTab, project);
    });

    test('Can go from entry editor to entries list', async () => {
      await editorPageManager.goto();
      await Promise.all([
        editorPageManager.navigateToEntriesList(),
        new EntryListPage(editorPageManager.page, project).waitFor(),
      ]);
    });

    // left side bar entries list
    test('Editor page has correct entry count in left side bar entries list', async () => {
      await editorPageManager.goto();
      await expect(editorPageManager.compactEntryListItem).toHaveCount(lexEntriesIds.length);
    });

    test('Entry 1: edit page has correct definition, part of speech', async () => {
      await editorPageManager.goto();
      await expect(editorPageManager.getTextarea(
        editorPageManager.senseCard, 'Definition', 'en'))
        .toHaveValue(entries.entry1.senses[0].definition.en.value);
      expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard, 'Part of Speech'))
        .toEqual(entries.entry1.senses[0].partOfSpeech.displayName);
    });

    test('Add citation form as visible field', async ({ managerTab }) => {
      const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
      await configurationPage.tabLinks.fields.click();
      await (await configurationPage.getCheckbox('Entry Fields', 'Citation Form', 'Hidden if Empty')).uncheck();
      await configurationPage.applyButton.click();
      await editorPageManager.goto();
      await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Citation Form', 'th')).toBeVisible();
    });

    test('Citation form field overrides lexeme form in dictionary citation view', async ({ managerTab }) => {
      const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
      await configurationPage.toggleField('Entry Fields', 'Word');
      await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'ภาษาไทย (IPA)')).check();
      await configurationPage.applyButton.click();

      await editorPageManager.goto();

      // Dictionary citation reflects lexeme form when citation form is empty
      await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme.th.value, entries.entry1.lexeme.th.value]);
      await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme['th-fonipa'].value, entries.entry1.lexeme['th-fonipa'].value]);
      await expect(editorPageManager.renderedDivs).not.toContainText(['citation form', 'citation form']);
      await editorPageManager.showExtraFields();
      const citationFormInput = editorPageManager.getTextarea(editorPageManager.entryCard, 'Citation Form', 'th');
      await citationFormInput.fill('citation form');

      await expect(editorPageManager.renderedDivs).toContainText(['citation form', 'citation form']);
      await expect(editorPageManager.renderedDivs).not.toContainText([entries.entry1.lexeme.th.value, entries.entry1.lexeme.th.value]);
      await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme['th-fonipa'].value, entries.entry1.lexeme['th-fonipa'].value]);

      await citationFormInput.fill('');
      await expect(editorPageManager.renderedDivs).not.toContainText(['citation form', 'citation form']);
      await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme.th.value, entries.entry1.lexeme.th.value]);
      await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme['th-fonipa'].value, entries.entry1.lexeme['th-fonipa'].value]);
    });

    test.describe('Picture', () => {

      const newProject = projectPerTest(true);

      test('First picture and caption is present', async ({ request, managerTab }) => {
        const screenshotProject: Project = await newProject();
        await addLexEntry(request, screenshotProject.code, entries.entry1);
        await addPictureFileToProject(request, screenshotProject, entries.entry1.senses[0].pictures[0].fileName);

        const editorPagePicture = await new EditorPage(managerTab, screenshotProject).goto();
        const picture: Locator = await editorPagePicture.getPicture(editorPagePicture.senseCard, entries.entry1.senses[0].pictures[0].fileName);
        const img = await picture.elementHandle();
        await expect(editorPagePicture.page).toHaveScreenshot({ clip: await img.boundingBox() });
        const caption = await editorPagePicture.getPictureCaption(picture);
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

      test('Can change config to show pictures and hide empty captions & can change config to show empty captions', async ({ managerTab }) => {
        // can change config to show pictures and hide empty captions
        const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
        await configurationPage.tabLinks.fields.click();

        await (await configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).uncheck();
        await configurationPage.toggleField('Meaning Fields', 'Pictures');
        await (await configurationPage.getFieldCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).check();
        await configurationPage.applyButton.click();

        await editorPageManager.goto();
        await editorPageManager.showExtraFields(false);
        const picture: Locator = await editorPageManager.getPicture(editorPageManager.senseCard, entries.entry1.senses[0].pictures[0].fileName);
        expect(picture).not.toBeUndefined();
        const caption = await editorPageManager.getPictureCaption(picture);
        await expect(caption).toBeVisible();
        await caption.fill('');

        // can change config to show empty captions
        await configurationPage.goto();
        await configurationPage.tabLinks.fields.click();
        await (await configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).uncheck();
        await configurationPage.toggleField('Meaning Fields', 'Pictures');
        await (await configurationPage.getFieldCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).uncheck();
        await configurationPage.applyButton.click();

        await editorPageManager.goto();
        await expect(caption).toBeVisible();
      });

      test('Picture is removed when Delete is clicked & can change config to hide pictures and hide captions', async ({ request, managerTab }) => {
        const testProject: Project = await newProject();
        await addLexEntry(request, testProject, entries.entry1);
        await addPictureFileToProject(request, testProject, entries.entry1.senses[0].pictures[0].fileName);
        const editorPagePicture = await new EditorPage(managerTab, testProject).goto();

        // Picture is removed when Delete is clicked
        let picture: Locator = await editorPagePicture.getPicture(editorPagePicture.senseCard, entries.entry1.senses[0].pictures[0].fileName);
        expect(picture).not.toBeUndefined();
        await (await editorPagePicture.getPictureDeleteButton(editorPagePicture.senseCard, entries.entry1.senses[0].pictures[0].fileName)).click();
        const confirmModal = new ConfirmModal(editorPagePicture.page);
        await confirmModal.confirmButton.click();
        picture = await editorPagePicture.getPicture(editorPagePicture.senseCard, entries.entry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();

        const configurationPage = await new ConfigurationPageFieldsTab(managerTab, testProject).goto();
        await configurationPage.tabLinks.fields.click();
        await (await configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).check();
        await configurationPage.toggleField('Meaning Fields', 'Pictures');
        await (await configurationPage.getFieldCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).uncheck();
        await configurationPage.applyButton.click();

        // can change config to hide pictures and hide captions
        await editorPagePicture.goto();
        picture = await editorPagePicture.getPicture(editorPagePicture.senseCard, entries.entry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();
        expect(editorPagePicture.getPicturesOuterDiv(editorPagePicture.senseCard)).not.toBeVisible();
        await editorPagePicture.showExtraFields();
        expect(editorPagePicture.getPicturesOuterDiv(editorPagePicture.senseCard)).toBeVisible();
        await editorPagePicture.showExtraFields(false);
        expect(editorPagePicture.getPicturesOuterDiv(editorPagePicture.senseCard)).not.toBeVisible();
        picture = await editorPagePicture.getPicture(editorPagePicture.senseCard, entries.entry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();
      });
    });

    test.describe('Audio', () => {
      test.beforeAll(async ({ managerTab }) => {
        const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
        await configurationPage.toggleField('Entry Fields', lexemeLabel);
        await (await configurationPage.getFieldCheckbox('Entry Fields', lexemeLabel, 'ภาษาไทย (IPA)')).check();
        await (await configurationPage.getFieldCheckbox('Entry Fields', lexemeLabel, 'ภาษาไทย (Voice)')).check();
        await configurationPage.applyButton.click();
      });


      test.describe('Member', () => {
        let editorPageMember: EditorPage;

        test.beforeAll(async ({ memberTab }) => {
          editorPageMember = new EditorPage(memberTab, project);
        });

        test('Audio input system is present, playable and has "more" control (member)', async () => {
          await editorPageMember.goto();
          const audio = editorPageMember.getAudioPlayer(lexemeLabel, 'taud');
          await expect(audio.playIcon).toBeVisible();
          await expect(audio.togglePlaybackAnchor).toBeEnabled();

          await expect(audio.dropdownToggle).toBeVisible();
          await expect(audio.dropdownToggle).toBeEnabled();
          await expect(audio.uploadButton).not.toBeVisible();
          // this button is only visible when user is observer and has only the right to download
          await expect(audio.downloadButton).not.toBeVisible();
        });

        test('Word 2 (without audio): audio input system is not playable but has "upload" button (member)', async () => {
          await editorPageMember.goto({ entryId: lexEntriesIds[1] });
          const audio = editorPageMember.getAudioPlayer(lexemeLabel, 'taud');
          await expect(audio.togglePlaybackAnchor).not.toBeVisible();
          await expect(audio.dropdownToggle).toBeEnabled();
          await expect(audio.uploadButton).toBeVisible();
          await expect(audio.uploadButton).toBeEnabled();
          await expect(audio.downloadButton).not.toBeVisible();
        });
      });

      test.describe('Observer', () => {
        let editorPageObserver: EditorPage;

        test.beforeAll(async ({ observerTab }) => {
          editorPageObserver = new EditorPage(observerTab, project);
        });

        test('Audio Input System is playable but does not have "more" control (observer)', async () => {
          await editorPageObserver.goto();
          const audio = editorPageObserver.getAudioPlayer(lexemeLabel, 'taud');
          await expect(audio.playIcon).toBeVisible();
          await expect(audio.togglePlaybackAnchor).toBeVisible();
          await expect(audio.togglePlaybackAnchor).toBeEnabled();
          await expect(audio.dropdownToggle).not.toBeVisible();
          await expect(audio.uploadButton).not.toBeVisible();
          await expect(audio.downloadButton).toBeVisible();
        });

        test('Word 2 (without audio): audio input system is not playable and does not have "upload" button (observer)', async () => {
          await editorPageObserver.goto({ entryId: lexEntriesIds[1] });
          const audio = editorPageObserver.getAudioPlayer(lexemeLabel, 'taud');
          await expect(audio.togglePlaybackAnchor).not.toBeVisible();
          await expect(audio.dropdownToggle).not.toBeVisible();
          await expect(audio.uploadButton).not.toBeVisible();
          await expect(audio.downloadButton).not.toBeVisible();
        });
      });

      test.describe('Manager', () => {

        test('Audio input system is present, playable and has "more" control (manager)', async () => {
          await editorPageManager.goto();
          const audio = editorPageManager.getAudioPlayer(lexemeLabel, 'taud');
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
          const audio = editorPageManager.getAudioPlayer(lexemeLabel, 'taud');
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

          const audio = editorPageManager.getAudioPlayer(lexemeLabel, 'taud');
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

        test('Navigate to other entries with left entry bar', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[1] });

          await Promise.all([
            editorPageManager.page.locator('text=' + entries.multipleMeaningEntry.senses[0].definition.en.value).click(),
            editorPageManager.page.waitForURL(editorPageManager.entryUrl(lexEntriesIds[2])),
          ]);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en')).toHaveValue(entries.multipleMeaningEntry.senses[0].definition.en.value);
        });

        test('Word 2 (without audio): audio input system is not playable but has "upload" button (manager)', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[1] });
          const audio = editorPageManager.getAudioPlayer(lexemeLabel, 'taud');
          await expect(audio.playIcon).not.toBeVisible();

          await expect(audio.dropdownToggle).not.toBeVisible();
          await expect(audio.uploadButton).toBeVisible();
          await expect(audio.uploadButton).toBeEnabled();
          await expect(audio.downloadButton).not.toBeVisible();
        });

        test('Can delete audio input system (manager)', async () => {
          await editorPageManager.goto();
          const audio = editorPageManager.getAudioPlayer(lexemeLabel, 'taud');
          await audio.dropdownToggle.click();
          await audio.dropdownMenu.deleteAudioButton.click();
          const confirmModal = new ConfirmModal(editorPageManager.page);
          await confirmModal.confirmButton.click();
          await expect(audio.uploadButton).toBeVisible();
        });

        test('Can\'t upload a non-audio file & can upload audio file', async () => {
          // to be independent from the audio deletion test above, go to entry 2 (has no audio)
          await editorPageManager.goto({ entryId: lexEntriesIds[1] });
          const noticeElement = editorPageManager.noticeList;
          await expect(noticeElement.notices).toHaveCount(0);

          // Can't upload a non-audio file
          const audio = editorPageManager.getAudioPlayer(lexemeLabel, 'taud');
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

        test('Word 2: edit page has correct definition, part of speech', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[1] });
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard, 'Definition', 'en'))
            .toHaveValue(entries.entry2.senses[0].definition.en.value);

          expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard, 'Part of Speech'))
            .toEqual(entries.entry2.senses[0].partOfSpeech.displayName);
        });

        test('Dictionary citation reflects example sentences and translations', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[2] });

          await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[0].examples[0].sentence.th.value, entries.multipleMeaningEntry.senses[0].examples[0].sentence.th.value]);
          await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[0].examples[0].translation.en.value, entries.multipleMeaningEntry.senses[0].examples[0].translation.en.value]);
          await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[0].examples[1].sentence.th.value, entries.multipleMeaningEntry.senses[0].examples[1].sentence.th.value]);
          await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[0].examples[1].translation.en.value, entries.multipleMeaningEntry.senses[0].examples[1].translation.en.value]);
          await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[1].examples[0].sentence.th.value, entries.multipleMeaningEntry.senses[1].examples[0].sentence.th.value]);
          await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[1].examples[0].translation.en.value, entries.multipleMeaningEntry.senses[1].examples[0].translation.en.value]);
          await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[1].examples[1].sentence.th.value, entries.multipleMeaningEntry.senses[1].examples[1].sentence.th.value]);
          await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[1].examples[1].translation.en.value, entries.multipleMeaningEntry.senses[1].examples[1].translation.en.value]);
        });

        test('Word with multiple definitions: edit page has correct definitions, parts of speech', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[2] });
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[0].definition.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Definition', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[1].definition.en.value);

          expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard.nth(0), 'Part of Speech'))
            .toEqual(entries.multipleMeaningEntry.senses[0].partOfSpeech.displayName);
          expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard.nth(1), 'Part of Speech'))
            .toEqual(entries.multipleMeaningEntry.senses[1].partOfSpeech.displayName);
        });

        test('Word with multiple meanings: edit page has correct example sentences, translations', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[2] });

          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Sentence', 'th'))
            .toHaveValue(entries.multipleMeaningEntry.senses[0].examples[0].sentence.th.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Translation', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[0].examples[0].translation.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Sentence', 'th'))
            .toHaveValue(entries.multipleMeaningEntry.senses[0].examples[1].sentence.th.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Translation', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[0].examples[1].translation.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Sentence', 'th'))
            .toHaveValue(entries.multipleMeaningEntry.senses[1].examples[0].sentence.th.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Translation', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[1].examples[0].translation.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Sentence', 'th'))
            .toHaveValue(entries.multipleMeaningEntry.senses[1].examples[1].sentence.th.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Translation', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[1].examples[1].translation.en.value);
        });

        test('While Show Hidden Fields has not been clicked, hidden fields are hidden if they are empty', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[2] });
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'Semantics Note', 'en')).toHaveCount(0);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'General Note', 'en')).toBeVisible();
          await editorPageManager.showExtraFields();
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'Semantics Note', 'en')).toBeVisible();
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'General Note', 'en')).toBeVisible();
        });

        test('Word with multiple meanings: edit page has correct general notes, sources', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[2] });
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'General Note', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[0].generalNote.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'General Note', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[1].generalNote.en.value);
          await editorPageManager.showExtraFields();
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'Source', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[0].source.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Source', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[1].source.en.value);
        });

        test('Senses can be reordered and deleted', async () => {
          await editorPageManager.goto({ entryId: lexEntriesIds[2] });
          await editorPageManager.senseCard.first().locator(editorPageManager.moveDownButtonSelector).first().click();
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[1].definition.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Definition', 'en'))
            .toHaveValue(entries.multipleMeaningEntry.senses[0].definition.en.value);
        });

        test('Back to browse page, create new word, check word count, modify new word, autosaves changes, new word visible in editor and list', async () => {
          const entryListPage = await new EntryListPage(editorPageManager.page, project).goto();
          await entryListPage.createNewWordButton.click();
          // clicking on new word button automatically takes user to entry editor
          const entryCount = lexEntriesIds.length + 1;

          await expect(editorPageManager.compactEntryListItem).toHaveCount(entryCount);

          await entryListPage.goto();
          await entryListPage.expectTotalNumberOfEntries(entryCount);

          // go back to editor
          await editorPageManager.page.goBack();
          await (editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .fill(entries.entry3.lexeme.th.value);
          await (editorPageManager.getTextarea(editorPageManager.senseCard, 'Definition', 'en'))
            .fill(entries.entry3.senses[0].definition.en.value);

          const partOfSpeedDropdown = editorPageManager.getDropdown(editorPageManager.senseCard, 'Part of Speech');
          partOfSpeedDropdown.selectOption({ label: 'Noun (n)' });

          // Autosaves changes
          await editorPageManager.page.waitForURL(url => !url.hash.includes('editor/entry/_new_'));
          await editorPageManager.page.reload();

          await expect(partOfSpeedDropdown).toHaveSelectedOption({ label: 'Noun (n)' });

          const alreadyThere: string = await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th').inputValue();
          await (editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .fill(alreadyThere + 'a');
          await editorPageManager.page.reload();
          await expect((editorPageManager.getTextarea(
            editorPageManager.entryCard, lexemeLabel, 'th')))
            .toHaveValue(entries.entry3.lexeme.th.value + 'a');
          await (editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .fill(entries.entry3.lexeme.th.value);

          // New word is visible in edit page
          await editorPageManager.search.searchInput.fill(entries.entry3.senses[0].definition.en.value);
          await expect(editorPageManager.search.matchCount).toContainText(/1(?= \/)/);

          // new word is visible in list page
          await entryListPage.goto();
          await entryListPage.filterInput.fill(entries.entry3.senses[0].definition.en.value);
          await expect(entryListPage.matchCount).toContainText(/1(?= \/)/);
          await entryListPage.filterInputClearButton.click();

          // word count is still correct in browse page
          await entryListPage.expectTotalNumberOfEntries(entryCount);

          // remove new word to restore original word count
          await entryListPage.entry(entries.entry3.lexeme.th.value).click();
          await editorPageManager.entryCard.first().locator(editorPageManager.deleteCardButtonSelector).first().click();

          const confirmModal = new ConfirmModal(editorPageManager.page);
          await confirmModal.confirmButton.click();

          await expect(editorPageManager.compactEntryListItem).toHaveCount(lexEntriesIds.length);

          // previous entry is selected after delete
          await expect(editorPageManager.getTextarea(
            editorPageManager.entryCard, lexemeLabel, 'th'))
            .toHaveValue(entries.entry1.lexeme.th.value);
        });
      });

    });

    test.describe('Entry ID in URL', () => {
      test('URL entry id matches selected entry', async () => {
        await editorPageManager.goto({ entryId: lexEntriesIds[1] });
        expect(editorPageManager.page.url()).toContain(lexEntriesIds[1]);
        expect(editorPageManager.page.url()).not.toContain(lexEntriesIds[0]);

        await editorPageManager.goto({ entryId: lexEntriesIds[0] });
        expect(editorPageManager.page.url()).toContain(lexEntriesIds[0]);
        expect(editorPageManager.page.url()).not.toContain(lexEntriesIds[1]);

        await editorPageManager.goto({ entryId: lexEntriesIds[1] });
        expect(editorPageManager.page.url()).toContain(lexEntriesIds[1]);
        expect(editorPageManager.page.url()).not.toContain(lexEntriesIds[0]);
      });
    });

    test.describe('Configuration check', async () => {

      test.beforeAll(async ({ managerTab }) => {
        const configurationPage = new ConfigurationPageFieldsTab(managerTab, project);
        await configurationPage.goto();
        await configurationPage.toggleField('Entry Fields', lexemeLabel);
        await (await configurationPage.getFieldCheckbox('Entry Fields', lexemeLabel, 'ภาษาไทย (IPA)')).check();
        await (await configurationPage.getFieldCheckbox('Entry Fields', lexemeLabel, 'ภาษาไทย (Voice)')).check();
        await configurationPage.applyButton.click();
      });

      test('Can change configuration to make a writing system visible or invisible', async ({ managerTab }) => {
        await editorPageManager.goto();
        // word has only "th", "tipa" and "taud" visible
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(3);
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(3);
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toBeVisible();
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'tipa')).toBeVisible();
        await expect(editorPageManager.audioPlayer(lexemeLabel, 'taud')).toBeVisible();

        // make "en" input system visible for "Word" field
        const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
        await configurationPage.toggleField('Entry Fields', lexemeLabel);
        await (await configurationPage.getFieldCheckbox('Entry Fields', lexemeLabel, 'English')).check();
        await configurationPage.applyButton.click();

        // check if "en" is visible
        await editorPageManager.goto();
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(4);
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'en')).toBeVisible();

        // make "en" input system invisible for "Word" field
        await configurationPage.goto();
        await configurationPage.toggleField('Entry Fields', lexemeLabel);
        await (await configurationPage.getFieldCheckbox('Entry Fields', lexemeLabel, 'English')).uncheck();
        await configurationPage.applyButton.click();

        // check if "en" is invisible
        await editorPageManager.goto();
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(3);
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'en')).not.toBeVisible();
      });

      test('Make "taud" input system invisible for "Word" field and "tipa" invisible for manager role, then ensure it worked and change it back', async ({ managerTab, memberTab }) => {
        const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
        await configurationPage.toggleField('Entry Fields', lexemeLabel);
        // Make "taud" input system invisible for "Word" field....
        await (await configurationPage.getFieldCheckbox('Entry Fields', lexemeLabel, '(Voice)')).uncheck();
        // ....and "tipa" invisible for manager role
        await (await configurationPage.getCheckbox('Input Systems', 'IPA', 'Manager')).uncheck();
        await configurationPage.applyButton.click();

        // verify that contributor can still see "tipa"
        const editorPageMember = new EditorPage(memberTab, project);
        await editorPageMember.goto();
        await expect(editorPageMember.label(lexemeLabel, editorPageMember.entryCard)).toHaveCount(2);
        await expect(editorPageMember.getTextarea(editorPageMember.entryCard, lexemeLabel, 'th')).toBeVisible();
        await expect(editorPageMember.getTextarea(editorPageMember.entryCard, lexemeLabel, 'tipa')).toBeVisible();

        // Word then only has "th" visible for manager role
        await editorPageManager.goto();
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(1);
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toBeVisible();

        // restore visibility of "taud" for "Word" field
        await configurationPage.goto();
        await configurationPage.toggleField('Entry Fields', lexemeLabel);
        await (await configurationPage.getFieldCheckbox('Entry Fields', lexemeLabel, '(Voice)')).check();
        await configurationPage.applyButton.click();

        // Word has only "th" and "taud" visible for manager role
        await editorPageManager.goto();
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(2);
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toBeVisible();
        await expect(editorPageManager.audioPlayer(lexemeLabel, 'taud')).toBeVisible();

        // restore visibility of "tipa" input system for manager role
        await configurationPage.goto();
        await (await configurationPage.getCheckbox('Input Systems', 'IPA', 'Manager')).check();
        await configurationPage.applyButton.click();

        // Word has "th", "tipa" and "taud" visible again for manager role
        await editorPageManager.goto();
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(3);
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'tipa')).toBeVisible();
      });

    });

  });
});
