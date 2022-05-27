

// remaining TODO: convert the rest of the tests, reorganizing nesting of test.describe blocks


import { expect, Locator } from '@playwright/test';
import { test } from './utils/fixtures';

import { EditorPage } from './pages/editor.page';
import { ConfirmModalElement } from './components/confirm-modal.component';

import { Project } from './utils/types';
import { addAudioVisualFileToProject, addLexEntry, addPictureFileToProject, addWritingSystemToProject, initTestProject } from './utils/testSetup';

test.describe('Lexicon E2E Entry Editor and Entries List', () => {
  const constants = require('./testConstants.json');

  const lexemeLabel = 'Word';
  let editorPageManager: EditorPage;

  const project: Project = {
    name: 'editor_entry_spec_ts Project 01',
    code: 'p01_editor_entry_spec_ts__project_01',
    id: ''
  };
  let lexEntriesIds: string[] = [];

  test.beforeAll(async ({ request, manager, managerTab, member }) => {
    // TODO: change initTestProject to allow adding more writing systems to the test project
    project.id = await initTestProject(request, project.code, project.name, manager.username, [member.username]);
    await addWritingSystemToProject(request, project.code, 'th-fonipa', 'tipa');
    await addWritingSystemToProject(request, project.code, 'th-Zxxx-x-audio', 'taud');
    // TOASK: why does the following line not work
    await addPictureFileToProject(request, project.code, constants.testEntry1.senses[0].pictures[0].fileName);
    await addAudioVisualFileToProject(request, project.code, constants.testEntry1.lexeme['th-Zxxx-x-audio'].value);
    // put in data
    lexEntriesIds.push(await addLexEntry(request, project.code, constants.testEntry1));
    lexEntriesIds.push(await addLexEntry(request, project.code, constants.testEntry2));
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
      expect(await (await editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'th')).inputValue()).toEqual(constants.testEntry1.lexeme.th.value);
    });

  });

  test.describe('Entry Editor', () => {
    test.beforeEach(async () => {
      await editorPageManager.goto();
    });

    // JeanneSonTODO: even though a timeout was added, the test still fails when run headlessly but succeeds when run in slowly in debug mode
    test.skip('Can go from entry editor to entries list', async () => {
      await editorPageManager.page.pause();
      await editorPageManager.navigateToEntriesList();
      // JeanneSonTODO: wait for an element on the page to be visible
      await editorPageManager.page.waitForTimeout(3000);
      expect(editorPageManager.page.url()).toContain(editorPageManager.entriesListPage.url);
    });

    // left side bar entries list
    test('Editor page has correct entry count in left side bar entries list', async () => {
      expect(editorPageManager.compactEntryListItem).toHaveCount(lexEntriesIds.length);
    });

    test('Entry 1: edit page has correct definition, part of speech', async () => {
      // JeanneSonTODO: fix this
      //expect(await editorPage.senseCard.definitionInput.inputValue()).toEqual(constants.testEntry1.senses[0].definition.en.value);
      // JeanneSonTODO: when the partOfSpeech bug is fixed, we can uncomment the following line
      // expect(await editorPage.senseCard.partOfSpeechDropdown.inputValue()).toEqual(constants.testEntry1.senses[0].partOfSpeech.value);
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
      // Dictionary citation reflects lexeme form when citation form is empty
      await expect(editorPageManager.renderedDivs).toContainText([constants.testEntry1.lexeme.th.value, constants.testEntry1.lexeme.th.value]);
      // TODO: uncomment when initTestProject allows multiple writing systems
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
      // await editorPage.edit.hideHiddenFields();
    });

    test('First picture and caption is present', async () => {
      // eventually use locator.screenshot https://playwright.dev/docs/screenshots#element-screenshot
      const picture: Locator = await editorPageManager.getPicture(editorPageManager.senseCard, constants.testEntry1.senses[0].pictures[0].fileName);
      expect(picture).not.toBeUndefined();
      const caption = await editorPageManager.getPictureCaption(picture);
      expect(caption).not.toBeUndefined();
      expect(await caption.inputValue()).toEqual(constants.testEntry1.senses[0].pictures[0].caption.en.value);
    });

    test('File upload drop box is displayed when Add Picture is clicked and can be cancelled', async () => {
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

    test.describe('Audio', () => {
      test.beforeAll(async () => {
        await editorPageManager.configurationPage.goto();
        await (await editorPageManager.configurationPage.getFieldSpecificButton('Entry Fields', 'Word')).click();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', 'Word', 'IPA')).check();
        await (await editorPageManager.configurationPage.getFieldSpecificCheckbox('Entry Fields', 'Word', 'Voice')).check();
        await editorPageManager.configurationPage.applyButton.click();
        // await editorPageManager.goto();
      });

      test('Audio input system is present, playable and has "more" control (manager)', async () => {
        const audio: Locator = await editorPageManager.getSoundplayer(editorPageManager.entryCard, 'Word', 'taud');
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

      test('File upload drop box is displayed when Upload is clicked & not displayed if upload cancelled', async () => {
        const audio: Locator = await editorPageManager.getSoundplayer(editorPageManager.entryCard, 'Word', 'taud');
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

      // JeanneSonTODO: test for navigation to other entries with left entry bar

      test('Word 2 (without audio): audio input system is not playable but has "upload" button (manager)', async () => {
        await editorPageManager.goto(lexEntriesIds[1]);
        await expect(editorPageManager.entryCard.locator(editorPageManager.audioPlayer.playIconSelector)).not.toBeVisible();

        const audio: Locator = await editorPageManager.getSoundplayer(editorPageManager.entryCard, 'Word', 'taud');
        await expect(audio.locator(editorPageManager.audioPlayer.dropdownToggleSelector)).not.toBeVisible();
        await expect(audio.locator(editorPageManager.audioPlayer.uploadButtonSelector)).toBeVisible();
        await expect(audio.locator(editorPageManager.audioPlayer.uploadButtonSelector)).toBeEnabled();
        await expect(audio.locator(editorPageManager.audioPlayer.downloadButtonSelector)).not.toBeVisible();
      });

      test.describe('Member', () => {
        let editorPageMember: EditorPage;

        test.beforeAll(async ({ memberTab }) => {
          editorPageMember = new EditorPage(memberTab, project.id, lexEntriesIds[0]);
        });

        test('Audio input system is present, playable and has "more" control (member)', async () => {
          await editorPageMember.goto();
          const audio: Locator = await editorPageMember.getSoundplayer(editorPageMember.entryCard, 'Word', 'taud');
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
          // expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isPresent()).toBe(false);
          // expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isPresent()).toBe(false);
          // expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
          // expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
          // expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isEnabled()).toBe(true);
          // expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
        });
      });


      //   test('login as observer, click on first word', async () => {
      //     // await loginPage.loginAsObserver();
      //     // await projectsPage.get();
      //     // await projectsPage.clickOnProject(constants.testProjectName);
      //     // await editorPage.edit.toListLink.click();
      //     // await editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
      //   });

      //   test('audio Input System is playable but does not have "more" control (observer)', async () => {
      //     // expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).count()).toEqual(1);
      //     // expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
      //     // expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class')).toContain('fa-play');
      //     // expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
      //     // expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
      //     // expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
      //     // expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
      //     // expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
      //   });

      //   test('click on second word (found by definition)', async () => {
      //     // await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
      //   });

      //   test('word 2: audio Input System is not playable and does not have "upload" button (observer)',
      //     async () => {
      //       // expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isPresent()).toBe(false);
      //       // expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isPresent()).toBe(false);
      //       // expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
      //       // expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
      //       // expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
      //     });

      //   test('login as manager, click on first word', async () => {
      //     // await loginPage.loginAsManager();
      //     // await projectsPage.get();
      //     // await projectsPage.clickOnProject(constants.testProjectName);
      //     // await editorPage.edit.toListLink.click();
      //     // await editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
      //   });

      //   test('can delete audio Input System', async () => {
      //     // expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
      //     // await editorPage.edit.audio.moreControls(lexemeLabel).first().click();
      //     // await editorPage.edit.audio.moreDelete(lexemeLabel, 0).click();
      //     // await Utils.clickModalButton('Delete Audio');
      //     // expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
      //   });

      //   test('file upload drop box is displayed when Upload is clicked', async () => {
      //     // expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
      //     // expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
      //     // expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
      //     // await editorPage.edit.audio.uploadButtons(lexemeLabel).first().click();
      //     // expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
      //     // expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(true);
      //   });

      //   test('file upload drop box is not displayed when Cancel Uploading Audio is clicked', async () => {
      //     // expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(true);
      //     // await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().click();
      //     // expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
      //     // expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
      //     // expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
      //   });

      //   test.describe('Mock file upload', async () => {

      //     test('can\'t upload a non-audio file', async () => {
      //       // expect<any>(await editorPage.noticeList.count()).toBe(0);
      //       // await editorPage.edit.audio.uploadButtons(lexemeLabel).first().click();
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.enableButton.click();
      //       // expect(await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput.isDisplayed()).toBe(true);
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput
      //       //   .sendKeys(constants.testMockPngUploadFile.name);
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput
      //       //   .sendKeys(constants.testMockPngUploadFile.size);
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.uploadButton.click();
      //       // expect<any>(await editorPage.noticeList.count()).toBe(1);
      //       // expect<any>(await editorPage.noticeList.first().getText()).toContain(constants.testMockPngUploadFile.name +
      //       //     ' is not an allowed audio file. Ensure the file is');
      //       // expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(true);
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput.clear();
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput.clear();
      //       // await editorPage.firstNoticeCloseButton.click();
      //     });

      //     test('can upload an audio file', async () => {
      //       // expect<any>(await editorPage.noticeList.count()).toBe(0);
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput
      //       //   .sendKeys(constants.testMockMp3UploadFile.name);
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput
      //       //   .sendKeys(constants.testMockMp3UploadFile.size);
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.uploadButton.click();
      //       // await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.enableButton.click();
      //       // expect<any>(await editorPage.noticeList.count()).toBe(1);
      //       // expect<any>(await editorPage.noticeList.first().getText()).toContain('File uploaded successfully');
      //       // expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
      //       // expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class')).toContain('fa-play');
      //       // expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
      //       // expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
      //       // expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
      //     });

      //   });

      //   test('click on second word (found by definition)', async () => {
      //     // await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
      //   });

      //   test('word 2: edit page has correct definition, part of speech', async () => {
      //     // expect<any>(await editorUtil.getFieldValues('Definition')).toEqual([
      //     //   { en: constants.testEntry2.senses[0].definition.en.value }
      //     // ]);
      //     // expect<any>(await editorUtil.getFieldValues('Part of Speech')).toEqual([
      //     //   editorUtil.expandPartOfSpeech(constants.testEntry2.senses[0].partOfSpeech.value)
      //     // ]);
      //   });

      //   test('setup: click on word with multiple definitions (found by lexeme)', async () => {
      //     // await editorPage.edit.toListLink.click();
      //     // await editorPage.browse.clickEntryByLexeme(constants.testMultipleMeaningEntry1.lexeme.th.value);

      //     // // fix problem with protractor not scrolling to element before click
      //     // await browser.driver.executeScript('arguments[0].scrollIntoView();',
      //     //   editorPage.edit.senses.first().getWebElement());
      //     // await editorPage.edit.senses.first().click();
      //   });

      //   test('dictionary citation reflects example sentences and translations', async () => {
      //     // expect(await editorPage.edit.renderedDiv.getText()).toContain(
      //     //   constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value);
      //     // expect(await editorPage.edit.renderedDiv.getText()).toContain(
      //     //   constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value);
      //     // expect(await editorPage.edit.renderedDiv.getText()).toContain(
      //     //   constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value);
      //     // expect(await editorPage.edit.renderedDiv.getText()).toContain(
      //     //   constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value);
      //     // expect(await editorPage.edit.renderedDiv.getText()).toContain(
      //     //   constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value);
      //     // expect(await editorPage.edit.renderedDiv.getText()).toContain(
      //     //   constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value);
      //     // expect(await editorPage.edit.renderedDiv.getText()).toContain(
      //     //   constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value);
      //     // expect(await editorPage.edit.renderedDiv.getText()).toContain(
      //     //   constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value);
      //   });

      //   test('word with multiple definitions: edit page has correct definitions, parts of speech',
      //     async () => {
      //       // expect<any>(await editorUtil.getFieldValues('Definition')).toEqual([
      //       //   { en: constants.testMultipleMeaningEntry1.senses[0].definition.en.value },
      //       //   { en: constants.testMultipleMeaningEntry1.senses[1].definition.en.value }
      //       // ]);
      //       // expect<any>(await editorUtil.getFieldValues('Part of Speech')).toEqual([
      //       //   editorUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.value),
      //       //   editorUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.value)
      //       // ]);
      //     });

      //   test('word with multiple meanings: edit page has correct example sentences, translations', async () => {
      //     // expect<any>(await editorUtil.getFieldValues('Sentence')).toEqual([
      //     //   { th: constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value },
      //     //   { th: constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value },
      //     //   { th: constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value },
      //     //   { th: constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value }
      //     // ]);
      //     // expect<any>(await editorUtil.getFieldValues('Translation')).toEqual([
      //     //   { en: constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value },
      //     //   { en: constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value },
      //     //   { en: constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value },
      //     //   { en: constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value }
      //     // ]);
      //   });

      //   test('while Show Hidden Fields has not been clicked, hidden fields are hidden if they are empty', async () => {
      //     // expect<any>(await editorPage.edit.getFields('Semantics Note').count()).toBe(0);
      //     // expect<any>(await editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
      //     // await editorPage.edit.showHiddenFields();
      //     // expect<any>(await editorPage.edit.getOneField('Semantics Note').isPresent()).toBe(true);
      //     // expect<any>(await editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
      //   });

      //   test('word with multiple meanings: edit page has correct general notes, sources', async () => {
      //     // expect<any>(await editorUtil.getFieldValues('General Note')).toEqual([
      //     //   { en: constants.testMultipleMeaningEntry1.senses[0].generalNote.en.value },
      //     //   { en: constants.testMultipleMeaningEntry1.senses[1].generalNote.en.value }
      //     // ]);

      //     // // First item is empty Etymology Source, now that View Settings all default to visible. IJH
      //     // expect<any>(await editorUtil.getFieldValues('Source')).toEqual([
      //     //   { en: constants.testMultipleMeaningEntry1.senses[0].source.en.value },
      //     //   { en: constants.testMultipleMeaningEntry1.senses[1].source.en.value }
      //     // ]);
      //   });

      //   test('senses can be reordered and deleted', async () => {
      //     // await editorPage.edit.sense.actionMenus.first().click();
      //     // await editorPage.edit.sense.moveDown.first().click();
      //     // expect<any>(await editorUtil.getFieldValues('Definition')).toEqual([
      //     //   { en: constants.testMultipleMeaningEntry1.senses[1].definition.en.value },
      //     //   { en: constants.testMultipleMeaningEntry1.senses[0].definition.en.value }
      //     // ]);
      //   });

      //   test('back to browse page, create new word', async () => {
      //     // await editorPage.edit.toListLink.click();
      //     // await editorPage.browse.newWordBtn.click();
      //   });

      //   test('check that word count is still correct', async () => {
      //     // expect(await editorPage.edit.entriesList.count()).toEqual(await editorPage.edit.getEntryCount());
      //     // expect<any>(await editorPage.edit.getEntryCount()).toEqual(4);
      //   });

      //   test('modify new word', async () => {
      //     // const word = constants.testEntry3.lexeme.th.value;
      //     // const definition = constants.testEntry3.senses[0].definition.en.value;
      //     // await editorPage.edit.getMultiTextInputs(lexemeLabel).first().sendKeys(word);
      //     // await editorPage.edit.getMultiTextInputs('Definition').first().sendKeys(definition);
      //     // await Utils.clickDropdownByValue(await editorPage.edit.getOneField('Part of Speech').element(by.css('select')),
      //     //   new RegExp('Noun \\(n\\)'));
      //     //   await Utils.scrollTop();
      //   });

      //   test('autosaves changes', async () => {
      //     // await browser.refresh();
      //     // await browser.wait(ExpectedConditions.visibilityOf(await editorPage.edit.fields.last()));
      //     // await editorPage.edit.getMultiTextInputs(lexemeLabel).first().getAttribute('value').then(async text => {
      //     //   await editorPage.edit.getMultiTextInputs(lexemeLabel).first().sendKeys('a');
      //     //   await browser.refresh();
      //     //   await browser.wait(ExpectedConditions.visibilityOf(await editorPage.edit.fields.last()));
      //     //   expect<any>(await editorPage.edit.getMultiTextInputs(lexemeLabel).first().getAttribute('value')).toEqual(text + 'a');
      //     //   await editorPage.edit.getMultiTextInputs(lexemeLabel).first().sendKeys(protractor.Key.BACK_SPACE);
      //     // });
      //   });

      //   test('new word is visible in edit page', async () => {
      //     // await editorPage.edit.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
      //     // expect<any>(await editorPage.edit.search.getMatchCount()).toBe(1);
      //     // await editorPage.edit.search.clearBtn.click();
      //   });

      //   test('check that Semantic Domain field is visible (for view settings test later)', async () => {
      //     // await browser.wait(ExpectedConditions.visibilityOf(await editorPage.edit.fields.last()));
      //     // expect(await editorPage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
      //   });

      //   test.describe('Configuration check', async () => {

      //     // const ipaRowLabel = /^Thai \(IPA\)$/;
      //     // const thaiAudioRowLabel = 'Thai Voice (Voice)';
      //     // const englishRowLabel = 'English';

      //     // test('Word has only "th", "tipa" and "taud" visible', async () => {
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toBeGreaterThanOrEqual(3);
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(3);
      //     // });

      //     // test('make "en" input system visible for "Word" field', async () => {
      //     //   await configPage.get();
      //     //   await configPage.tabs.unified.click();
      //     //   await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      //     //   await util.setCheckbox(
      //     //     configPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox(lexemeLabel, englishRowLabel), true);
      //     //   await configPage.applyButton.click();
      //     //   await Utils.clickBreadcrumb(constants.testProjectName);
      //     //   await editorPage.edit.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
      //     // });

      //     // test('Word has "th", "tipa", "taud" and "en" visible', async () => {
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toBeGreaterThanOrEqual(4);
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(3).getText()).toEqual('en');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(4);
      //     // });

      //     // test('make "en" input system invisible for "Word" field', async () => {
      //     //   await configPage.get();
      //     //   await configPage.tabs.unified.click();
      //     //   await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      //     //   await util.setCheckbox(
      //     //     configPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox(lexemeLabel, englishRowLabel), false);
      //     //   await configPage.applyButton.click();
      //     //   await Utils.clickBreadcrumb(constants.testProjectName);
      //     //   await editorPage.edit.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
      //     // });

      //     // test('Word has only "th", "tipa" and "taud" visible again', async () => {
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toBeGreaterThanOrEqual(3);
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(3);
      //     // });

      //     // test('make "taud" input system invisible for "Word" field and "tipa" invisible for manager role', async () => {
      //     //   await configPage.get();
      //     //   await configPage.tabs.unified.click();

      //     //   // Ensure field-specific input systems for Word are visible
      //     //   const wordChevron = await configPage.unifiedPane.fieldSpecificIcon(lexemeLabel).getAttribute('class');
      //     //   if (wordChevron.includes('fa-chevron-down')) {
      //     //     await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      //     //   }

      //     //   // Alternately, just do it regardless
      //     //   // await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      //     //   await util.setCheckbox(
      //     //     configPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox(lexemeLabel, thaiAudioRowLabel), false);
      //     //   await util.setCheckbox(configPage.unifiedPane.managerCheckbox(ipaRowLabel), false);

      //     //   await configPage.applyButton.click();
      //     //   await Utils.clickBreadcrumb(constants.testProjectName);
      //     // });

      //     // test('Word has only "th" visible', async () => {
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toBeGreaterThanOrEqual(1);
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(1);
      //     // });

      //     // test('restore visibility of "taud" for "Word" field', async () => {
      //     //   await configPage.get();
      //     //   await configPage.tabs.unified.click();
      //     //   // Ensure field-specific input systems for Word are visible
      //     //   const wordChevron = await configPage.unifiedPane.fieldSpecificIcon(lexemeLabel).getAttribute('class');
      //     //   if (wordChevron.includes('fa-chevron-down')) {
      //     //     await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      //     //   }
      //     //   // await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      //     //   await util.setCheckbox(
      //     //     configPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox(lexemeLabel, thaiAudioRowLabel), true);
      //     //   await configPage.applyButton.click();
      //     //   await Utils.clickBreadcrumb(constants.testProjectName);
      //     //   await editorPage.edit.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
      //     // });

      //     // test('Word has only "th" and "taud" visible for manager role', async () => {
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toBeGreaterThanOrEqual(2);
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('taud');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(2);
      //     // });

      //     // test('restore visibility of "tipa" input system for manager role', async () => {
      //     //   await configPage.get();
      //     //   await configPage.tabs.unified.click();
      //     //   await util.setCheckbox(configPage.unifiedPane.managerCheckbox(ipaRowLabel), true);
      //     //   await configPage.applyButton.click();
      //     //   await Utils.clickBreadcrumb(constants.testProjectName);
      //     //   await editorPage.edit.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
      //     // });

      //     // test('Word has "th", "tipa" and "taud" visible again for manager role', async () => {
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toBeGreaterThanOrEqual(3);
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
      //     //   expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(3);
      //     // });

      //   });

      //   test('new word is visible in browse page', async () => {
      //     // await editorPage.edit.toListLink.click();
      //     // await editorPage.browse.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
      //     // expect<any>(await editorPage.browse.search.getMatchCount()).toBe(1);
      //     // await editorPage.browse.search.clearBtn.click();
      //   });

      //   test('check that word count is still correct in browse page', async () => {
      //     // expect(await editorPage.browse.entriesList.count()).toEqual(await editorPage.browse.getEntryCount());
      //     // expect<any>(await editorPage.browse.getEntryCount()).toBe(4);
      //   });

      //   test('remove new word to restore original word count', async () => {
      //     // await editorPage.browse.clickEntryByLexeme(constants.testEntry3.lexeme.th.value);
      //     // await editorPage.edit.actionMenu.click();
      //     // await editorPage.edit.deleteMenuItem.click();
      //     // await browser.waitForAngular();
      //     // await browser.wait(ExpectedConditions.visibilityOf(await editorPage.modal.modalBodyText));
      //     // await Utils.clickModalButton('Delete Entry');
      //     // await browser.waitForAngular();
      //     // expect<any>(await editorPage.edit.getEntryCount()).toBe(3);
      //   });

      //   test('previous entry is selected after delete', async () => {
      //     // expect(await editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
      //   });
    });
  });
});
