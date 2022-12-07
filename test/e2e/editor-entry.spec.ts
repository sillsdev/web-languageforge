import { expect, Locator } from '@playwright/test';
import { test } from './utils/fixtures';

import { EditorPage } from './pages/editor.page';
import { ConfirmModalElement } from './components/confirm-modal.component';
import { NoticeElement } from './components/notice.component';

import { Project } from './utils/types';
import { addAudioVisualFileToProject, addLexEntry, addPictureFileToProject, addUserToProject, addWritingSystemToProject, initTestProject } from './utils/testSetup';
import constants from './testConstants.json';
import { ConfigurationPageFieldsTab } from './pages/configuration-fields.tab';
import { testFile } from './utils';
import { EntryListPage } from './pages/entry-list.page';

test.describe('Lexicon E2E Entry Editor and Entries List', () => {

  const lexemeLabel = 'Word';

  const project: Project = {
    name: 'editor_entry_spec_ts Project 01',
    code: 'p01_editor_entry_spec_ts__project_01',
    id: ''
  };
  let lexEntriesIds: string[] = [];

  test.beforeAll(async ({ request, manager, member, member2 }) => {
    project.id = (await initTestProject(request, project.code, project.name, manager.username, [member.username])).id;
    await addUserToProject(request, project, member2.username, "observer");
    await addWritingSystemToProject(request, project, 'th-fonipa', 'tipa');
    await addWritingSystemToProject(request, project, 'th-Zxxx-x-audio', 'taud');

    await addPictureFileToProject(request, project, constants.testEntry1.senses[0].pictures[0].fileName);
    await addAudioVisualFileToProject(request, project, constants.testEntry1.lexeme['th-Zxxx-x-audio'].value);
    // put in data
    lexEntriesIds.push(await addLexEntry(request, project.code, constants.testEntry1));
    lexEntriesIds.push(await addLexEntry(request, project.code, constants.testEntry2));
    lexEntriesIds.push(await addLexEntry(request, project.code, constants.testMultipleMeaningEntry1));
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
        entryListPageManager.clickOnEntry(constants.testEntry1.lexeme.th.value),
        new EditorPage(entryListPageManager.page, project).waitForPage(),
      ])
      await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toHaveValue(constants.testEntry1.lexeme.th.value);
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
        new EntryListPage(editorPageManager.page, project).waitForPage(),
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
        .toHaveValue(constants.testEntry1.senses[0].definition.en.value);
      expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard, 'Part of Speech'))
         .toEqual(constants.testEntry1.senses[0].partOfSpeech.displayName);
    });

    test('Add citation form as visible field', async ({managerTab}) => {
      const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
      await configurationPage.tabLinks.fields.click();
      await (await configurationPage.getCheckbox('Entry Fields', 'Citation Form', 'Hidden if Empty')).uncheck();
      await configurationPage.applyButton.click();
      await editorPageManager.goto();
      await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Citation Form', 'th')).toBeVisible();
    });

    test('Citation form field overrides lexeme form in dictionary citation view', async ({managerTab}) => {
      const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
      await configurationPage.toggleField('Entry Fields', 'Word');
      await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'ภาษาไทย (IPA)')).check();
      await configurationPage.applyButton.click();

      await editorPageManager.goto();

      // Dictionary citation reflects lexeme form when citation form is empty
      await expect(editorPageManager.renderedDivs).toContainText([constants.testEntry1.lexeme.th.value, constants.testEntry1.lexeme.th.value]);
      await expect(editorPageManager.renderedDivs).toContainText([constants.testEntry1.lexeme['th-fonipa'].value, constants.testEntry1.lexeme['th-fonipa'].value]);
      await expect(editorPageManager.renderedDivs).not.toContainText(['citation form', 'citation form']);
      await editorPageManager.showExtraFields();
      const citationFormInput = editorPageManager.getTextarea(editorPageManager.entryCard, 'Citation Form', 'th');
      await citationFormInput.fill('citation form');

      await expect(editorPageManager.renderedDivs).toContainText(['citation form', 'citation form']);
      await expect(editorPageManager.renderedDivs).not.toContainText([constants.testEntry1.lexeme.th.value, constants.testEntry1.lexeme.th.value]);
      await expect(editorPageManager.renderedDivs).toContainText([constants.testEntry1.lexeme['th-fonipa'].value, constants.testEntry1.lexeme['th-fonipa'].value]);

      await citationFormInput.fill('');
      await expect(editorPageManager.renderedDivs).not.toContainText(['citation form', 'citation form']);
      await expect(editorPageManager.renderedDivs).toContainText([constants.testEntry1.lexeme.th.value, constants.testEntry1.lexeme.th.value]);
      await expect(editorPageManager.renderedDivs).toContainText([constants.testEntry1.lexeme['th-fonipa'].value, constants.testEntry1.lexeme['th-fonipa'].value]);
    });

    test.describe('Picture', () => {
      test('First picture and caption is present', async () => {
        await editorPageManager.goto();
        await expect(editorPageManager.page).toHaveScreenshot(); // ensure the screenshot (incuding the image) stays the same
        const picture: Locator = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).not.toBeUndefined();
        const caption = await editorPageManager.getPictureCaption(picture);
        expect(caption).not.toBeUndefined();
        await expect(caption).toHaveValue(constants.testEntry1.senses[0].pictures[0].caption.en.value);
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

      test('Can change config to show pictures and hide empty captions & can change config to show empty captions', async ({managerTab}) => {
        // can change config to show pictures and hide empty captions
        const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
        await configurationPage.tabLinks.fields.click();

        await (await configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).uncheck();
        await configurationPage.toggleField('Meaning Fields', 'Pictures');
        await (await configurationPage.getFieldCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).check();
        await configurationPage.applyButton.click();

        await editorPageManager.goto();
        await editorPageManager.showExtraFields(false);
        const picture: Locator = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
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

      test('Picture is removed when Delete is clicked & can change config to hide pictures and hide captions', async ({managerTab}) => {
        await editorPageManager.goto();
        // Picture is removed when Delete is clicked
        let picture: Locator = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).not.toBeUndefined();
        await (await editorPageManager.getPictureDeleteButton(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName)).click();
        const confirmModal = new ConfirmModalElement(editorPageManager.page);
        await confirmModal.confirmButton.click();
        picture = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();

        const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project).goto();
        await configurationPage.goto();
        await configurationPage.tabLinks.fields.click();
        await (await configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).check();
        await configurationPage.toggleField('Meaning Fields', 'Pictures');
        await (await configurationPage.getFieldCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).uncheck();
        await configurationPage.applyButton.click();

        // can change config to hide pictures and hide captions
        await editorPageManager.goto();
        picture = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();
        expect(editorPageManager.getPicturesOuterDiv(editorPageManager.senseCard)).not.toBeVisible();
        await editorPageManager.showExtraFields();
        expect(editorPageManager.getPicturesOuterDiv(editorPageManager.senseCard)).toBeVisible();
        await editorPageManager.showExtraFields(false);
        expect(editorPageManager.getPicturesOuterDiv(editorPageManager.senseCard)).not.toBeVisible();
        picture = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();
      });
    });

    test.describe('Audio', () => {
      test.beforeAll(async ({managerTab}) => {
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
          const audio: Locator = editorPageMember.getSoundplayer(editorPageMember.entryCard, lexemeLabel, 'taud');
          await expect(audio).toBeVisible();
          await expect(audio.locator(editorPageMember.audioPlayer.playIconSelector)).toBeVisible();
          // check if this audio player is the only one in this card
          await expect(editorPageMember.entryCard.locator(editorPageMember.audioPlayer.playIconSelector + ' >> visible=true')).toHaveCount(1);
          await expect(audio.locator(editorPageMember.audioPlayer.togglePlaybackAnchorSelector)).toBeEnabled();

          await expect(audio.locator(editorPageMember.audioPlayer.dropdownToggleSelector)).toBeVisible();
          await expect(audio.locator(editorPageMember.audioPlayer.dropdownToggleSelector)).toBeEnabled();
          await expect(audio.locator(editorPageMember.audioPlayer.uploadButtonSelector)).not.toBeVisible();
          // this button is only visible when user is observer and has only the right to download
          await expect(audio.locator(editorPageMember.audioPlayer.downloadButtonSelector)).not.toBeVisible();
        });

        test('Word 2 (without audio): audio input system is not playable but has "upload" button (member)', async () => {
          await editorPageMember.goto({entryId: lexEntriesIds[1]});
          const audio: Locator = editorPageMember.getSoundplayer(editorPageMember.entryCard, lexemeLabel, 'taud');
          await expect(editorPageMember.entryCard.locator(editorPageMember.audioPlayer.playIconSelector + ' >> visible=true')).toHaveCount(0);
          await expect(audio.locator(editorPageMember.audioPlayer.togglePlaybackAnchorSelector)).not.toBeVisible();
          await expect(audio.locator(editorPageMember.audioPlayer.dropdownToggleSelector)).toBeEnabled();
          await expect(audio.locator(editorPageMember.audioPlayer.uploadButtonSelector)).toBeVisible();
          await expect(audio.locator(editorPageMember.audioPlayer.uploadButtonSelector)).toBeEnabled();
          await expect(audio.locator(editorPageMember.audioPlayer.downloadButtonSelector)).not.toBeVisible();
        });
      });

      test.describe('Observer', () => {
        let editorPageObserver: EditorPage;

        test.beforeAll(async ({ member2Tab }) => {
          editorPageObserver = new EditorPage(member2Tab, project);
        });

        test('Audio Input System is playable but does not have "more" control (observer)', async () => {
          await editorPageObserver.goto();
          const audio: Locator = editorPageObserver.getSoundplayer(editorPageObserver.entryCard, lexemeLabel, 'taud');
          await expect(audio.locator(editorPageObserver.audioPlayer.playIconSelector)).toBeVisible();
          // check if this audio player is the only one in this card
          await expect(editorPageObserver.entryCard.locator(editorPageObserver.audioPlayer.playIconSelector + ' >> visible=true')).toHaveCount(1);
          await expect(audio.locator(editorPageObserver.audioPlayer.togglePlaybackAnchorSelector)).toBeVisible();
          await expect(audio.locator(editorPageObserver.audioPlayer.togglePlaybackAnchorSelector)).toBeEnabled();
          await expect(audio.locator(editorPageObserver.audioPlayer.dropdownToggleSelector)).not.toBeVisible();
          await expect(audio.locator(editorPageObserver.audioPlayer.uploadButtonSelector)).not.toBeVisible();
          await expect(audio.locator(editorPageObserver.audioPlayer.downloadButtonSelector)).toBeVisible();
        });

        test('Word 2 (without audio): audio input system is not playable and does not have "upload" button (observer)', async () => {
          await editorPageObserver.goto({entryId: lexEntriesIds[1]});
          const audio: Locator = editorPageObserver.getSoundplayer(editorPageObserver.entryCard, lexemeLabel, 'taud');
          await expect(editorPageObserver.entryCard.locator(editorPageObserver.audioPlayer.playIconSelector + ' >> visible=true')).toHaveCount(0);
          await expect(audio.locator(editorPageObserver.audioPlayer.togglePlaybackAnchorSelector)).not.toBeVisible();
          await expect(audio.locator(editorPageObserver.audioPlayer.dropdownToggleSelector)).not.toBeVisible();
          await expect(audio.locator(editorPageObserver.audioPlayer.uploadButtonSelector)).not.toBeVisible();
          await expect(audio.locator(editorPageObserver.audioPlayer.downloadButtonSelector)).not.toBeVisible();
        });
      });

      test.describe('Manager', () => {
        let audio: Locator;
        test.beforeAll(async () => {
          audio = editorPageManager.getSoundplayer(editorPageManager.entryCard, lexemeLabel, 'taud');
        })

        test('Audio input system is present, playable and has "more" control (manager)', async () => {
          await editorPageManager.goto();
          await expect(audio).toBeVisible();
          await expect(audio.locator(editorPageManager.audioPlayer.playIconSelector)).toBeVisible();
          // check if this audio player is the only one in this card
          await expect(editorPageManager.entryCard.locator(editorPageManager.audioPlayer.playIconSelector + ' >> visible=true')).toHaveCount(1);
          await expect(audio.locator(editorPageManager.audioPlayer.togglePlaybackAnchorSelector)).toBeEnabled();
          await expect(audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector)).toBeVisible();
          await expect(audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector)).toBeEnabled();
          await expect(audio.locator(editorPageManager.audioPlayer.uploadButtonSelector)).not.toBeVisible();
          // this button is only visible when user is observer and has only the right to download
          await expect(audio.locator(editorPageManager.audioPlayer.downloadButtonSelector)).not.toBeVisible();
        });


        test('Slider is present and updates with seeking', async () => {
          await editorPageManager.goto();
          await expect(audio.locator(editorPageManager.audioPlayer.slider)).toBeVisible();
          const slider = audio.locator(editorPageManager.audioPlayer.slider);
          let originalTime = (await audio.locator(editorPageManager.audioPlayer.audioProgressTime).innerText()).substring(3, 4);
          let bounds = await slider.boundingBox();
          let yMiddle = bounds.y + bounds.height/2;
          await editorPageManager.page.mouse.click(bounds.x+200, yMiddle);
          await expect(audio.locator(editorPageManager.audioPlayer.audioProgressTime)).toContainText("0:01 / 0:02");
        });


        test('File upload drop box is displayed when Upload is clicked & not displayed if upload cancelled (manager)', async () => {
          await editorPageManager.goto();
          const dropbox = editorPageManager.entryCard.locator(editorPageManager.dropbox.dragoverFieldSelector);
          await expect(dropbox).not.toBeVisible();

          const cancelAddingAudio = editorPageManager.getCancelDropboxButton(editorPageManager.entryCard, 'Audio');
          await expect(cancelAddingAudio).not.toBeVisible();

          await audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector).click();
          await editorPageManager.entryCard.locator(editorPageManager.audioDropdownMenu.uploadReplacementButtonSelector).click();
          await expect(audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector)).not.toBeVisible();
          await expect(dropbox).toBeVisible();

          await expect(cancelAddingAudio).toBeVisible();
          await cancelAddingAudio.click();
          await expect(audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector)).toBeVisible();
          await expect(dropbox).not.toBeVisible();
          await expect(cancelAddingAudio).not.toBeVisible();
        });

        test('Navigate to other entries with left entry bar', async () => {
          await editorPageManager.goto({entryId: lexEntriesIds[1]});
          await editorPageManager.page.locator('text=' + constants.testMultipleMeaningEntry1.senses[0].definition.en.value).click();

          await editorPageManager.page.waitForURL(
            new RegExp(`.*\/app\/lexicon\/${project.id}\/#!\/editor\/entry\/${lexEntriesIds[2]}.*`, 'gm')
          );
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en')).toHaveValue(constants.testMultipleMeaningEntry1.senses[0].definition.en.value);
        });

        test('Word 2 (without audio): audio input system is not playable but has "upload" button (manager)', async () => {
          await editorPageManager.goto({entryId: lexEntriesIds[1]});
          await expect(editorPageManager.entryCard.locator(editorPageManager.audioPlayer.playIconSelector)).not.toBeVisible();

          await expect(audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector)).not.toBeVisible();
          await expect(audio.locator(editorPageManager.audioPlayer.uploadButtonSelector)).toBeVisible();
          await expect(audio.locator(editorPageManager.audioPlayer.uploadButtonSelector)).toBeEnabled();
          await expect(audio.locator(editorPageManager.audioPlayer.downloadButtonSelector)).not.toBeVisible();
        });

        test('Can delete audio input system (manager)', async () => {
          await editorPageManager.goto();
          // there is a beforeEach above so we are now on the right page
          await audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector).click();
          await audio.locator(editorPageManager.audioDropdownMenu.deleteAudioButtonSelector).click();
          const confirmModal = new ConfirmModalElement(editorPageManager.page);
          await confirmModal.confirmButton.click();
          await expect(audio.locator(editorPageManager.audioPlayer.uploadButtonSelector)).toBeVisible();
        });

        test('Can\'t upload a non-audio file & can upload audio file', async () => {
          // to be independent from the audio deletion test above, go to entry 2 (has no audio)
          await editorPageManager.goto({entryId: lexEntriesIds[1]});
          const noticeElement = new NoticeElement(editorPageManager.page);
          await expect(noticeElement.notice).toHaveCount(0);

          // Can't upload a non-audio file
          await audio.locator(editorPageManager.audioPlayer.uploadButtonSelector).click();

          // Note that Promise.all prevents a race condition between clicking and waiting for the file chooser.
          const [fileChooser] = await Promise.all([
            // It is important to call waitForEvent before click to set up waiting.
            editorPageManager.page.waitForEvent('filechooser'),
            editorPageManager.page.locator(editorPageManager.dropbox.browseButtonSelector).click(),
          ]);
          await fileChooser.setFiles(testFile(constants.testMockPngUploadFile.name));

          await expect(noticeElement.notice).toHaveCount(1);
          await expect(noticeElement.notice).toBeVisible();
          await expect(noticeElement.notice).toContainText(constants.testMockPngUploadFile.name + ' is not an allowed audio file. Ensure the file is');
          const dropbox = editorPageManager.entryCard.locator(editorPageManager.dropbox.dragoverFieldSelector);
          await expect(dropbox).toBeVisible();
          await noticeElement.closeButton.click();
          await expect(noticeElement.notice).toHaveCount(0);

          // Can upload audio file
          const [fileChooser2] = await Promise.all([
            editorPageManager.page.waitForEvent('filechooser'),
            editorPageManager.page.locator(editorPageManager.dropbox.browseButtonSelector).click(),
          ]);
          await fileChooser2.setFiles(testFile(constants.testMockMp3UploadFile.name));
          await expect(noticeElement.notice).toHaveCount(1);
          await expect(noticeElement.notice).toBeVisible();
          await expect(noticeElement.notice).toContainText('File uploaded successfully');
          await expect(editorPageManager.entryCard.locator(editorPageManager.audioPlayer.playIconSelector + ' >> visible=true')).toHaveCount(1);
          await expect(audio.locator(editorPageManager.audioPlayer.togglePlaybackAnchorSelector)).toBeEnabled();
          await expect(audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector)).toBeVisible();
        });

        test('Word 2: edit page has correct definition, part of speech', async () => {
          await editorPageManager.goto({entryId: lexEntriesIds[1]});
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard, 'Definition', 'en'))
            .toHaveValue(constants.testEntry2.senses[0].definition.en.value);

          expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard, 'Part of Speech'))
            .toEqual(constants.testEntry2.senses[0].partOfSpeech.displayName);
        });

        test('Dictionary citation reflects example sentences and translations', async () => {
          await editorPageManager.goto({entryId: lexEntriesIds[2]});

          await expect(editorPageManager.renderedDivs).toContainText([constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value, constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value]);
          await expect(editorPageManager.renderedDivs).toContainText([constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value, constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value]);
          await expect(editorPageManager.renderedDivs).toContainText([constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value, constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value]);
          await expect(editorPageManager.renderedDivs).toContainText([constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value, constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value]);
          await expect(editorPageManager.renderedDivs).toContainText([constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value, constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value]);
          await expect(editorPageManager.renderedDivs).toContainText([constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value, constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value]);
          await expect(editorPageManager.renderedDivs).toContainText([constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value, constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value]);
          await expect(editorPageManager.renderedDivs).toContainText([constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value, constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value]);
        });

        test('Word with multiple definitions: edit page has correct definitions, parts of speech', async () => {
          await editorPageManager.goto({entryId: lexEntriesIds[2]});
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[0].definition.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Definition', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[1].definition.en.value);

          expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard.nth(0), 'Part of Speech'))
            .toEqual(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.displayName);
          expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard.nth(1), 'Part of Speech'))
            .toEqual(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.displayName);
        });

        test('Word with multiple meanings: edit page has correct example sentences, translations', async () => {
          await editorPageManager.goto({entryId: lexEntriesIds[2]});

          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Sentence', 'th'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Translation', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Sentence', 'th'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Translation', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Sentence', 'th'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Translation', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Sentence', 'th'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Translation', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value);
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
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[0].generalNote.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'General Note', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[1].generalNote.en.value);
          await editorPageManager.showExtraFields();
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'Source', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[0].source.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Source', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[1].source.en.value);
        });

        test('Senses can be reordered and deleted', async () => {
          await editorPageManager.goto({entryId: lexEntriesIds[2]});
          await editorPageManager.senseCard.first().locator(editorPageManager.moveDownButtonSelector).first().click();
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[1].definition.en.value);
          await expect(editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Definition', 'en'))
            .toHaveValue(constants.testMultipleMeaningEntry1.senses[0].definition.en.value);
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
            .fill(constants.testEntry3.lexeme.th.value);
          await (editorPageManager.getTextarea(editorPageManager.senseCard, 'Definition', 'en'))
            .fill(constants.testEntry3.senses[0].definition.en.value);

          const partOfSpeedDropdown = editorPageManager.getDropdown(editorPageManager.senseCard, 'Part of Speech');
          partOfSpeedDropdown.selectOption({label: 'Noun (n)'});

          // Autosaves changes
          await editorPageManager.page.waitForURL(url => !url.hash.includes('editor/entry/_new_'));
          await editorPageManager.page.reload();

          await expect(partOfSpeedDropdown).toHaveSelectedOption({label: 'Noun (n)'});

          const alreadyThere: string = await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th').inputValue();
          await (editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .fill(alreadyThere + 'a');
          await editorPageManager.page.reload();
          await expect((editorPageManager.getTextarea(
            editorPageManager.entryCard, lexemeLabel, 'th')))
            .toHaveValue(constants.testEntry3.lexeme.th.value + 'a');
          await (editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .fill(constants.testEntry3.lexeme.th.value);

          // New word is visible in edit page
          await editorPageManager.search.searchInput.fill(constants.testEntry3.senses[0].definition.en.value);
          await expect(editorPageManager.search.matchCount).toContainText(/1(?= \/)/);

          // new word is visible in list page
          await entryListPage.goto();
          await entryListPage.filterInput.fill(constants.testEntry3.senses[0].definition.en.value);
          await expect(entryListPage.matchCount).toContainText(/1(?= \/)/);
          await entryListPage.filterInputClearButton.click();

          // word count is still correct in browse page
          await entryListPage.expectTotalNumberOfEntries(entryCount);

          // remove new word to restore original word count
          await entryListPage.clickOnEntry(constants.testEntry3.lexeme.th.value);
          await editorPageManager.entryCard.first().locator(editorPageManager.deleteCardButtonSelector).first().click();

          const confirmModal = new ConfirmModalElement(editorPageManager.page);
          await confirmModal.confirmButton.click();

          await expect(editorPageManager.compactEntryListItem).toHaveCount(lexEntriesIds.length);

          // previous entry is selected after delete
          await expect(editorPageManager.getTextarea(
              editorPageManager.entryCard, lexemeLabel, 'th'))
            .toHaveValue(constants.testEntry1.lexeme.th.value);
        });
      });

    });

    test.describe('Entry ID in URL', () => {
      test('URL entry id matches selected entry', async () => {
        await editorPageManager.goto({entryId: lexEntriesIds[1]});
        expect(editorPageManager.page.url()).toContain(lexEntriesIds[1]);
        expect(editorPageManager.page.url()).not.toContain(lexEntriesIds[0]);

        await editorPageManager.goto({entryId: lexEntriesIds[0]});
        expect(editorPageManager.page.url()).toContain(lexEntriesIds[0]);
        expect(editorPageManager.page.url()).not.toContain(lexEntriesIds[1]);

        await editorPageManager.goto({entryId: lexEntriesIds[1]});
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

      test('Can change configuration to make a writing system visible or invisible', async ({managerTab}) => {
        await editorPageManager.goto();
        // word has only "th", "tipa" and "taud" visible
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(3);
        await expect(editorPageManager.label(lexemeLabel, editorPageManager.entryCard)).toHaveCount(3);
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toBeVisible();
        await expect(editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'tipa')).toBeVisible();
        await expect(editorPageManager.getSoundplayer(editorPageManager.entryCard, lexemeLabel, 'taud')).toBeVisible();

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

      test('Make "taud" input system invisible for "Word" field and "tipa" invisible for manager role, then ensure it worked and change it back', async ({managerTab, memberTab}) => {
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
        await expect(editorPageManager.getSoundplayer(editorPageManager.entryCard, lexemeLabel, 'taud')).toBeVisible();

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
