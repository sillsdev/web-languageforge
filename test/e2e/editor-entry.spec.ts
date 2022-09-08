import { expect, Locator } from '@playwright/test';
import { test } from './utils/fixtures';

import { EditorPage } from './pages/editor.page';
import { ConfirmModalElement } from './components/confirm-modal.component';
import { NoticeElement } from './components/notice.component';

import { Project } from './utils/types';
import { addAudioVisualFileToProject, addLexEntry, addPictureFileToProject, addUserToProject, addWritingSystemToProject, initTestProject } from './utils/testSetup';
import constants from './testConstants.json';

test.describe('Lexicon E2E Entry Editor and Entries List', () => {

  const lexemeLabel = 'Word';
  let editorPageManager: EditorPage;

  const project: Project = {
    name: 'editor_entry_spec_ts Project 01',
    code: 'p01_editor_entry_spec_ts__project_01',
    id: ''
  };
  let lexEntriesIds: string[] = [];

  test.beforeAll(async ({ request, manager, managerTab, member, member2 }) => {
    project.id = await initTestProject(request, project.code, project.name, manager.username, [member.username]);
    await addUserToProject(request, project.code, member2.username, "observer");
    await addWritingSystemToProject(request, project.code, 'th-fonipa', 'tipa');
    await addWritingSystemToProject(request, project.code, 'th-Zxxx-x-audio', 'taud');

    await addPictureFileToProject(request, project.code, constants.testEntry1.senses[0].pictures[0].fileName);
    await addAudioVisualFileToProject(request, project.code, constants.testEntry1.lexeme['th-Zxxx-x-audio'].value);
    // put in data
    lexEntriesIds.push(await addLexEntry(request, project.code, constants.testEntry1));
    lexEntriesIds.push(await addLexEntry(request, project.code, constants.testEntry2));
    lexEntriesIds.push(await addLexEntry(request, project.code, constants.testMultipleMeaningEntry1));
    editorPageManager = new EditorPage(managerTab, project.id, lexEntriesIds[0]);
  });

  test.describe('Entries List', () => {
    test.beforeEach(async ({ }) => {
      await editorPageManager.entriesListPage.goto();
    });

    test.afterEach(async ({ }, testInfo) => {
      if (testInfo.status !== testInfo.expectedStatus)
        await editorPageManager.page.reload();
    });

    test('Entries list has correct number of entries', async () => {
      expect(await editorPageManager.entriesListPage.getTotalNumberOfEntries()).toEqual(lexEntriesIds.length.toString());
    });

    test('Search function works correctly', async () => {
      await editorPageManager.entriesListPage.filterInput.fill('asparagus');
      await expect(editorPageManager.entriesListPage.matchCount).toContainText(/1(?= \/)/);

      // remove filter, filter again, have same result
      await editorPageManager.entriesListPage.filterInputClearButton.click();
      await editorPageManager.entriesListPage.filterInput.fill('asparagus');
      await expect(editorPageManager.entriesListPage.matchCount).toContainText(/1(?= \/)/);
      // remove filter for next test - if this tests fails, the afterEach ensure that it does not impact the next test
      await editorPageManager.entriesListPage.filterInputClearButton.click();
    });

    test('Can click on first entry', async () => {
      await editorPageManager.entriesListPage.clickOnEntry(constants.testEntry1.lexeme.th.value);
      //expect(await editorPage.entryCard.entryName.inputValue()).toEqual(constants.testEntry1.lexeme.th.value);
      expect(await (await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).inputValue()).toEqual(constants.testEntry1.lexeme.th.value);
    });

  });

  test.describe('Entry Editor', () => {
    // test.beforeEach(async () => {
    //   await editorPageManager.goto();
    // });

    // TODO: even though a timeout was added, the test still fails when run headlessly but succeeds when run in slowly in debug mode
    test.skip('Can go from entry editor to entries list', async () => {
      await editorPageManager.goto();
      await editorPageManager.page.pause();
      await editorPageManager.navigateToEntriesList();
      // TODO: wait for an element on the page to be visible
      await editorPageManager.page.waitForTimeout(3000);
      expect(editorPageManager.page.url()).toContain(editorPageManager.entriesListPage.url);
    });

    // left side bar entries list
    test('Editor page has correct entry count in left side bar entries list', async () => {
      await editorPageManager.goto();
      await expect(editorPageManager.compactEntryListItem).toHaveCount(lexEntriesIds.length);
    });

    test('Entry 1: edit page has correct definition, part of speech', async () => {
      await editorPageManager.goto();
      expect(await (await editorPageManager.getTextarea(editorPageManager.senseCard, 'Definition', 'en')).inputValue()).toEqual(constants.testEntry1.senses[0].definition.en.value);
      // TODO: when the partOfSpeech bug is fixed, we can uncomment the following line
      //expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard, 'Part of Speech'))
      //   .toEqual(constants.testEntry1.senses[0].partOfSpeech.value);
    });

    test('Add citation form as visible field', async () => {
      await editorPageManager.configurationPage.goto();
      await editorPageManager.configurationPage.tabs.fields.click();
      await (await editorPageManager.configurationPage.getCheckbox('Entry Fields', 'Citation Form', 'Hidden if Empty')).uncheck();
      await editorPageManager.configurationPage.applyButton.click();
      await editorPageManager.goto();
      await expect(await editorPageManager.getTextarea(editorPageManager.entryCard, 'Citation Form', 'th')).toBeVisible();
    });

    test('Citation form field overrides lexeme form in dictionary citation view', async () => {
      await editorPageManager.goto();
      // Dictionary citation reflects lexeme form when citation form is empty
      await expect(editorPageManager.renderedDivs).toContainText([constants.testEntry1.lexeme.th.value, constants.testEntry1.lexeme.th.value]);
      // TODO: uncomment when testSetup has a call to add writing systems to a field (e.g., th-fonipa to the Word field)  - 2022-06 RM
      // await expect(editorPage.renderedDivs).toContainText([constants.testEntry1.lexeme['th-fonipa'].value, constants.testEntry1.lexeme['th-fonipa'].value]);
      await expect(editorPageManager.renderedDivs).not.toContainText(['citation form', 'citation form']);
      if ((await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.innerText()).includes('Show Extra Fields')) {
        await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.click();
      }
      const citationFormInput = await editorPageManager.getTextarea(editorPageManager.entryCard, 'Citation Form', 'th');
      await citationFormInput.fill('citation form');

      await expect(editorPageManager.renderedDivs).toContainText(['citation form', 'citation form']);
      await expect(editorPageManager.renderedDivs).not.toContainText([constants.testEntry1.lexeme.th.value, constants.testEntry1.lexeme.th.value]);
      // await expect(editorPage.renderedDivs).toContainText([constants.testEntry1.lexeme['th-fonipa'].value, constants.testEntry1.lexeme['th-fonipa'].value]);

      await citationFormInput.fill('');
      await expect(editorPageManager.renderedDivs).not.toContainText(['citation form', 'citation form']);
      await expect(editorPageManager.renderedDivs).toContainText([constants.testEntry1.lexeme.th.value, constants.testEntry1.lexeme.th.value]);
      // await expect(editorPage.renderedDivs).toContainText([constants.testEntry1.lexeme['th-fonipa'].value, constants.testEntry1.lexeme['th-fonipa'].value]);
    });

    test.describe('Picture', () => {
      test('First picture and caption is present', async () => {
        await editorPageManager.goto();
        // TODO: eventually use locator.screenshot https://playwright.dev/docs/screenshots#element-screenshot
        const picture: Locator = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).not.toBeUndefined();
        const caption = await editorPageManager.getPictureCaption(picture);
        expect(caption).not.toBeUndefined();
        expect(await caption.inputValue()).toEqual(constants.testEntry1.senses[0].pictures[0].caption.en.value);
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

      test('Can change config to show pictures and hide empty captions & can change config to show empty captions', async () => {
        // can change config to show pictures and hide empty captions
        await editorPageManager.configurationPage.goto();
        await editorPageManager.configurationPage.tabs.fields.click();

        await (await editorPageManager.configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).uncheck();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Meaning Fields', 'Pictures')).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).check();
        await editorPageManager.configurationPage.applyButton.click();

        await editorPageManager.goto();
        if ((await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.innerText()).includes('Hide Extra Fields')) {
          await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.click();
        }
        const picture: Locator = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).not.toBeUndefined();
        const caption = await editorPageManager.getPictureCaption(picture);
        await expect(caption).toBeVisible();
        await caption.fill('');

        // can change config to show empty captions
        await editorPageManager.configurationPage.goto();
        await editorPageManager.configurationPage.tabs.fields.click();
        await (await editorPageManager.configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).uncheck();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Meaning Fields', 'Pictures')).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).uncheck();
        await editorPageManager.configurationPage.applyButton.click();

        await editorPageManager.goto();
        await expect(caption).toBeVisible();
      });

      test('Picture is removed when Delete is clicked & can change config to hide pictures and hide captions', async () => {
        await editorPageManager.goto();
        // Picture is removed when Delete is clicked
        let picture: Locator = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).not.toBeUndefined();
        await (await editorPageManager.getPictureDeleteButton(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName)).click();
        const confirmModal = new ConfirmModalElement(editorPageManager.page);
        await confirmModal.confirmButton.click();
        picture = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();

        await editorPageManager.configurationPage.goto();
        await editorPageManager.configurationPage.tabs.fields.click();
        await (await editorPageManager.configurationPage.getCheckbox('Meaning Fields', 'Pictures', 'Hidden if Empty')).check();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Meaning Fields', 'Pictures')).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Meaning Fields', 'Pictures', 'Hide Caption If Empty')).uncheck();
        await editorPageManager.configurationPage.applyButton.click();

        // can change config to hide pictures and hide captions
        await editorPageManager.goto();
        picture = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();
        expect(await editorPageManager.getPicturesOuterDiv(editorPageManager.senseCard)).not.toBeVisible();
        // TODO: potentially put this in a function
        if ((await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.innerText()).includes('Show Extra Fields')) {
          await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.click();
        }
        expect(await editorPageManager.getPicturesOuterDiv(editorPageManager.senseCard)).toBeVisible();
        // hide extra fields
        await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.click();
        expect(await editorPageManager.getPicturesOuterDiv(editorPageManager.senseCard)).not.toBeVisible();
        picture = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
        expect(picture).toBeUndefined();
      });
    });

    test.describe('Audio', () => {
      test.beforeAll(async () => {
        await editorPageManager.configurationPage.goto();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Entry Fields', lexemeLabel)).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', lexemeLabel, 'IPA')).check();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', lexemeLabel, 'Voice')).check();
        await editorPageManager.configurationPage.applyButton.click();
      });


      test.describe('Member', () => {
        let editorPageMember: EditorPage;

        test.beforeAll(async ({ memberTab }) => {
          editorPageMember = new EditorPage(memberTab, project.id, lexEntriesIds[0]);
        });

        test('Audio input system is present, playable and has "more" control (member)', async () => {
          await editorPageMember.goto();
          const audio: Locator = await editorPageMember.getSoundplayer(editorPageMember.entryCard, lexemeLabel, 'taud');
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
          await editorPageMember.goto(lexEntriesIds[1]);
          const audio: Locator = await editorPageMember.getSoundplayer(editorPageMember.entryCard, lexemeLabel, 'taud');
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
          editorPageObserver = new EditorPage(member2Tab, project.id, lexEntriesIds[0]);
        });

        test('Audio Input System is playable but does not have "more" control (observer)', async () => {
          await editorPageObserver.goto();
          const audio: Locator = await editorPageObserver.getSoundplayer(editorPageObserver.entryCard, lexemeLabel, 'taud');
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
          await editorPageObserver.goto(lexEntriesIds[1]);
          const audio: Locator = await editorPageObserver.getSoundplayer(editorPageObserver.entryCard, lexemeLabel, 'taud');
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
          audio = await editorPageManager.getSoundplayer(editorPageManager.entryCard, lexemeLabel, 'taud');
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
          await editorPageManager.goto(lexEntriesIds[1]);
          await editorPageManager.page.locator('text=' + constants.testMultipleMeaningEntry1.senses[0].definition.en.value).click();

          await editorPageManager.page.waitForURL(
            new RegExp(`.*\/app\/lexicon\/${project.id}\/#!\/editor\/entry\/${lexEntriesIds[2]}.*`, 'gm')
          );
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en')).inputValue()
          ).toEqual(constants.testMultipleMeaningEntry1.senses[0].definition.en.value);
        });

        test('Word 2 (without audio): audio input system is not playable but has "upload" button (manager)', async () => {
          await editorPageManager.goto(lexEntriesIds[1]);
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
          await editorPageManager.goto(lexEntriesIds[1]);
          const noticeElement = new NoticeElement(editorPageManager.page);
          expect(noticeElement.notice).toHaveCount(0);

          // Can't upload a non-audio file
          await audio.locator(editorPageManager.audioPlayer.uploadButtonSelector).click();

          // Note that Promise.all prevents a race condition between clicking and waiting for the file chooser.
          const [fileChooser] = await Promise.all([
            // It is important to call waitForEvent before click to set up waiting.
            editorPageManager.page.waitForEvent('filechooser'),
            editorPageManager.page.locator(editorPageManager.dropbox.browseButtonSelector).click(),
          ]);
          await fileChooser.setFiles('test/e2e/shared-files/' + constants.testMockPngUploadFile.name);

          expect(noticeElement.notice).toHaveCount(1);
          await expect(noticeElement.notice).toBeVisible();
          await expect(noticeElement.notice).toContainText(constants.testMockPngUploadFile.name + ' is not an allowed audio file. Ensure the file is');
          const dropbox = editorPageManager.entryCard.locator(editorPageManager.dropbox.dragoverFieldSelector);
          await expect(dropbox).toBeVisible();
          await noticeElement.closeButton.click();
          expect(noticeElement.notice).toHaveCount(0);

          // Can upload audio file
          const [fileChooser2] = await Promise.all([
            editorPageManager.page.waitForEvent('filechooser'),
            editorPageManager.page.locator(editorPageManager.dropbox.browseButtonSelector).click(),
          ]);
          await fileChooser2.setFiles('test/e2e/shared-files/' + constants.testMockMp3UploadFile.name);
          expect(noticeElement.notice).toHaveCount(1);
          await expect(noticeElement.notice).toBeVisible();
          await expect(noticeElement.notice).toContainText('File uploaded successfully');
          await expect(editorPageManager.entryCard.locator(editorPageManager.audioPlayer.playIconSelector + ' >> visible=true')).toHaveCount(1);
          await expect(audio.locator(editorPageManager.audioPlayer.togglePlaybackAnchorSelector)).toBeEnabled();
          await expect(audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector)).toBeVisible();
        });


        // TODO: convert to navigation test
        //   test('click on second word (found by definition)', async () => {
        //     // await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
        //   });

        test('Word 2: edit page has correct definition, part of speech', async () => {
          await editorPageManager.goto(lexEntriesIds[1]);
          expect(await (await editorPageManager.getTextarea(editorPageManager.senseCard, 'Definition', 'en')).inputValue()).toEqual(constants.testEntry2.senses[0].definition.en.value);

          // TODO: when part of speech is fixed, uncomment and fix test
          // expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard, 'Part of Speech'))
          //   .toEqual(constants.testEntry2.senses[0].partOfSpeech.value);
        });

        test('Dictionary citation reflects example sentences and translations', async () => {
          await editorPageManager.goto(lexEntriesIds[2]);

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
          await editorPageManager.goto(lexEntriesIds[2]);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[0].definition.en.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Definition', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[1].definition.en.value);

          // TODO: when part of speech is fixed, uncomment and fix test
          // expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard.nth(0), 'Part of Speech'))
          //   .toEqual(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.value);
          // expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard.nth(1), 'Part of Speech'))
          //   .toEqual(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.value);
        });

        test('Word with multiple meanings: edit page has correct example sentences, translations', async () => {
          await editorPageManager.goto(lexEntriesIds[2]);

          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Sentence', 'th'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Translation', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Sentence', 'th'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Translation', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Sentence', 'th'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Translation', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Sentence', 'th'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Translation', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value);
        });

        test('While Show Hidden Fields has not been clicked, hidden fields are hidden if they are empty', async () => {
          await editorPageManager.goto(lexEntriesIds[2]);
          expect(await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'Semantics Note', 'en')).toHaveCount(0);
          expect(await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'General Note', 'en')).toBeVisible();
          if ((await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.innerText()).includes('Show Extra Fields')) {
            await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.click();
          }
          expect(await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'Semantics Note', 'en')).toBeVisible();
          expect(await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'General Note', 'en')).toBeVisible();
        });

        test('Word with multiple meanings: edit page has correct general notes, sources', async () => {
          await editorPageManager.goto(lexEntriesIds[2]);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'General Note', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[0].generalNote.en.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'General Note', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[1].generalNote.en.value);
          if ((await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.innerText()).includes('Show Extra Fields')) {
            await editorPageManager.lexAppToolbar.toggleExtraFieldsButton.click();
          }
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(0), 'Source', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[0].source.en.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Source', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[1].source.en.value);
        });

        test('Senses can be reordered and deleted', async () => {
          await editorPageManager.goto(lexEntriesIds[2]);
          await editorPageManager.senseCard.first().locator(editorPageManager.actionMenu.toggleMenuButtonSelector).first().click();
          await editorPageManager.senseCard.first().locator(editorPageManager.actionMenu.moveDownButtonSelector).first().click();
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.first(), 'Definition', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[1].definition.en.value);
          expect(await (await editorPageManager.getTextarea(
            editorPageManager.senseCard.nth(1), 'Definition', 'en'))
            .inputValue()).toEqual(constants.testMultipleMeaningEntry1.senses[0].definition.en.value);
        });

        test('Back to browse page, create new word, check word count, modify new word, autosaves changes, new word visible in editor and list', async () => {
          await editorPageManager.entriesListPage.goto();
          await editorPageManager.entriesListPage.createNewWordButton.click();
          // clicking on new word button automatically takes user to entry editor
          const entryCount = lexEntriesIds.length + 1;

          await expect(editorPageManager.compactEntryListItem).toHaveCount(entryCount);

          await editorPageManager.entriesListPage.goto();
          expect(await editorPageManager.entriesListPage.getTotalNumberOfEntries()).toEqual(entryCount.toString());

          // go back to editor
          await editorPageManager.page.goBack();
          await (await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .fill(constants.testEntry3.lexeme.th.value);
          await (await editorPageManager.getTextarea(editorPageManager.senseCard, 'Definition', 'en'))
            .fill(constants.testEntry3.senses[0].definition.en.value);

          // TODO: when the partOfSpeech bug is fixed, fix this code
          // await editorPageManager.getDropdown(editorPageManager.senseCard, 'Part of Speech');
          // await Utils.clickDropdownByValue(await editorPage.edit.getOneField('Part of Speech').element(by.css('select')),
          //   new RegExp('Noun \\(n\\)'));
          //   await Utils.scrollTop();

          // Autosaves changes
          await editorPageManager.page.waitForURL(url => !url.hash.includes('editor/entry/_new_'));
          await editorPageManager.page.reload();

          const alreadyThere: string = await (await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).inputValue();
          await (await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .fill(alreadyThere + 'a');
          await editorPageManager.page.reload();
          expect(await (await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).inputValue()).toEqual(constants.testEntry3.lexeme.th.value + 'a');
          await (await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .fill(constants.testEntry3.lexeme.th.value);

          // New word is visible in edit page
          await editorPageManager.search.searchInput.fill(constants.testEntry3.senses[0].definition.en.value);
          await expect(editorPageManager.search.matchCount).toContainText(/1(?= \/)/);

          // new word is visible in list page
          await editorPageManager.entriesListPage.goto();
          await editorPageManager.entriesListPage.filterInput.fill(constants.testEntry3.senses[0].definition.en.value);
          await expect(editorPageManager.entriesListPage.matchCount).toContainText(/1(?= \/)/);
          await editorPageManager.entriesListPage.filterInputClearButton.click();

          // word count is still correct in browse page
          expect(await editorPageManager.entriesListPage.getTotalNumberOfEntries()).toEqual(entryCount.toString());

          // remove new word to restore original word count
          await editorPageManager.entriesListPage.clickOnEntry(constants.testEntry3.lexeme.th.value);
          await editorPageManager.entryCard.first().locator(editorPageManager.actionMenu.toggleMenuButtonSelector).first().click();
          await editorPageManager.entryCard.first().locator(editorPageManager.actionMenu.deleteCardButtonSelector).first().click();

          const confirmModal = new ConfirmModalElement(editorPageManager.page);
          await confirmModal.confirmButton.click();

          await expect(editorPageManager.compactEntryListItem).toHaveCount(lexEntriesIds.length);

          // previous entry is selected after delete
          expect(await (await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th'))
            .inputValue()).toEqual(constants.testEntry1.lexeme.th.value);
        });

        test('Check that Semantic Domain field is visible (for view settings test later)', async () => {
          await editorPageManager.goto();
          // check if label is present
          await expect(await editorPageManager.getLabel(editorPageManager.senseCard.first(), 'Semantic Domain')).not.toHaveCount(0);
        });
      });

    });

    test.describe('Configuration check', async () => {

      let editorPageMember: EditorPage;
      test.beforeAll(async ({ memberTab }) => {
        editorPageMember = new EditorPage(memberTab, project.id, lexEntriesIds[0]);

        // copied from above from audio tests, because also needed here
        // TODO: eventually put this code somewhere else and in only one in this file

        // in the Protractor tests, the row label 'Thai Voice (Voice)' was used. Here, we only
        // require the row label to contain the substring 'Voice' as the label was changed to 'ภาษาไทย (Voice)'
        await editorPageManager.configurationPage.goto();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Entry Fields', lexemeLabel)).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', lexemeLabel, 'IPA')).check();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', lexemeLabel, 'Voice')).check();
        await editorPageManager.configurationPage.applyButton.click();
      });

      test('Can change configuration to make a writing system visible or invisible', async () => {
        await editorPageManager.goto();
        // word has only "th", "tipa" and "taud" visible
        expect(await editorPageManager.getNumberOfElementsWithSameLabel(editorPageManager.entryCard, lexemeLabel)).toEqual(3);
        await expect(await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toBeVisible();
        await expect(await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'tipa')).toBeVisible();
        await expect(await editorPageManager.getSoundplayer(editorPageManager.entryCard, lexemeLabel, 'taud')).toBeVisible();

        // make "en" input system visible for "Word" field
        await editorPageManager.configurationPage.goto();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Entry Fields', lexemeLabel)).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', lexemeLabel, 'English')).check();
        await editorPageManager.configurationPage.applyButton.click();

        // check if "en" is visible
        await editorPageManager.goto();
        expect(await editorPageManager.getNumberOfElementsWithSameLabel(editorPageManager.entryCard, lexemeLabel)).toEqual(4);
        await expect(await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'en')).toBeVisible();

        // make "en" input system invisible for "Word" field
        await editorPageManager.configurationPage.goto();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Entry Fields', lexemeLabel)).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', lexemeLabel, 'English')).uncheck();
        await editorPageManager.configurationPage.applyButton.click();


        // check if "en" is invisible
        await editorPageManager.goto();
        expect(await editorPageManager.getNumberOfElementsWithSameLabel(editorPageManager.entryCard, lexemeLabel)).toEqual(3);
        await expect(await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'en')).not.toBeVisible();
      });


      test('Make "taud" input system invisible for "Word" field and "tipa" invisible for manager role, then ensure it worked and change it back', async () => {
        await editorPageManager.configurationPage.goto();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Entry Fields', lexemeLabel)).click();
        // Make "taud" input system invisible for "Word" field....
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', lexemeLabel, '(Voice)')).uncheck();
        // ....and "tipa" invisible for manager role
        await (await editorPageManager.configurationPage.getCheckbox('Input Systems', 'IPA', 'Manager')).uncheck();
        await editorPageManager.configurationPage.applyButton.click();

        // verify that contributor can still see "tipa"
        await editorPageMember.goto();
        expect(await editorPageMember.getNumberOfElementsWithSameLabel(editorPageMember.entryCard, lexemeLabel)).toEqual(2);
        await expect(await editorPageMember.getTextarea(editorPageMember.entryCard, lexemeLabel, 'th')).toBeVisible();
        await expect(await editorPageMember.getTextarea(editorPageMember.entryCard, lexemeLabel, 'tipa')).toBeVisible();

        // Word then only has "th" visible for manager role
        await editorPageManager.goto();
        expect(await editorPageManager.getNumberOfElementsWithSameLabel(editorPageManager.entryCard, lexemeLabel)).toEqual(1);
        await expect(await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toBeVisible();

        // restore visibility of "taud" for "Word" field
        await editorPageManager.configurationPage.goto();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Entry Fields', lexemeLabel)).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', lexemeLabel, '(Voice)')).check();
        await editorPageManager.configurationPage.applyButton.click();

        // Word has only "th" and "taud" visible for manager role
        await editorPageManager.goto();
        expect(await editorPageManager.getNumberOfElementsWithSameLabel(editorPageManager.entryCard, lexemeLabel)).toEqual(2);
        await expect(await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'th')).toBeVisible();
        await expect(await editorPageManager.getSoundplayer(editorPageManager.entryCard, lexemeLabel, 'taud')).toBeVisible();

        // restore visibility of "tipa" input system for manager role
        await editorPageManager.configurationPage.goto();
        await (await editorPageManager.configurationPage.getCheckbox('Input Systems', 'IPA', 'Manager')).check();
        await editorPageManager.configurationPage.applyButton.click();

        // Word has "th", "tipa" and "taud" visible again for manager role
        await editorPageManager.goto();
        expect(await editorPageManager.getNumberOfElementsWithSameLabel(editorPageManager.entryCard, lexemeLabel)).toEqual(3);
        await expect(await editorPageManager.getTextarea(editorPageManager.entryCard, lexemeLabel, 'tipa')).toBeVisible();
      });

    });

  });
});
