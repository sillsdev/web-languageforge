import {browser, by, element, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {ConfigurationPage} from '../shared/configuration.page';
import {EditorPage} from '../shared/editor.page';
import {EditorUtil} from '../shared/editor.util';

describe('Lexicon E2E Editor List and Entry', async () => {
  const constants = require('../../../testConstants.json');
  const loginPage    = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const util         = new Utils();
  const editorPage   = new EditorPage();
  const editorUtil   = new EditorUtil();
  const configPage   = new ConfigurationPage();

  const lexemeLabel = 'Word';

  it('setup: login, click on test project', async () => {
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.clickOnProjectName(constants.testProjectName);
  });

  it('browse page has correct word count', async () => {
    // flaky assertion
    await expect(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    await expect<any>(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('search function works correctly', async () => {
    await editorPage.browse.search.input.sendKeys('asparagus');
    await expect<any>(editorPage.browse.search.getMatchCount()).toBe(1);
    await editorPage.browse.search.clearBtn.click();
    await editorPage.browse.search.input.sendKeys('Asparagus');
    await expect<any>(editorPage.browse.search.getMatchCount()).toBe(1);
    await editorPage.browse.search.clearBtn.click();
  });

  it('refresh returns to list view', async () => {
    await browser.refresh();
    await expect<any>(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', async () => {
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('refresh returns to entry view', async () => {
    await expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    await browser.driver.navigate().refresh();
    await expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('edit page has correct word count', async () => {
    await expect(editorPage.edit.entriesList.count()).toEqual(editorPage.edit.getEntryCount());
    await expect<any>(editorPage.edit.getEntryCount()).toBe(3);
  });

  it('word 1: edit page has correct definition, part of speech', async  () => {
    await expect<any>(editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testEntry1.senses[0].definition.en.value }
    ]);
    await expect<any>(editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testEntry1.senses[0].partOfSpeech.value)
    ]);
  });

  it('dictionary citation reflects lexeme form', async () => {
    await expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    await expect(editorPage.edit.renderedDiv.getText()).not.toContain('citation form');
  });

  it('add citation form as visible field', async () => {
    await configPage.get();
    await configPage.tabs.unified.click();
    await util.setCheckbox(configPage.unifiedPane.hiddenIfEmptyCheckbox('Citation Form'), false);
    await configPage.applyButton.click();
    await Utils.clickBreadcrumb(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('citation form field overrides lexeme form in dictionary citation view', async () => {
    // browser.sleep needs to avoid warnings
    await browser.sleep(300);
    await editorPage.edit.showHiddenFields();
    const citationFormMultiTextInputs = editorPage.edit.getMultiTextInputs('Citation Form');
    await editorPage.edit.selectElement.sendKeys(citationFormMultiTextInputs.first(), 'citation form');
    await expect(editorPage.edit.renderedDiv.getText()).toContain('citation form');
    await expect(editorPage.edit.renderedDiv.getText()).not.toContain(constants.testEntry1.lexeme.th.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    await editorPage.edit.selectElement.clear(citationFormMultiTextInputs.first());
    await expect(editorPage.edit.renderedDiv.getText()).not.toContain('citation form');
    await expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    await editorPage.edit.hideHiddenFields();
  });

  it('one picture and caption is present', async () => {
    // browser.sleep needs to avoid warnings
    await browser.sleep(1000);
    await browser.wait(() => editorPage.edit.pictures.getFileName(0), constants.conditionTimeout);
    await expect(editorPage.edit.pictures.getFileName(0))
      .toContain('_' + constants.testEntry1.senses[0].pictures[0].fileName);
    await browser.wait(() => editorPage.edit.pictures.getCaption(0), constants.conditionTimeout);
    await expect(editorPage.edit.pictures.getCaption(0))
      .toEqual({ en: constants.testEntry1.senses[0].pictures[0].caption.en.value });
  });

  it('file upload drop box is displayed when Add Picture is clicked', async () => {
    await expect<any>(editorPage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    await expect<any>(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);

    // fix problem with protractor not scrolling to element before click
    await browser.driver.executeScript('arguments[0].scrollIntoView();',
      editorPage.edit.pictures.addPictureLink.getWebElement());
    await editorPage.edit.pictures.addPictureLink.click();
    await expect<any>(editorPage.edit.pictures.addPictureLink.isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Adding Picture is clicked', async () => {
    await expect<any>(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(true);
    await editorPage.edit.pictures.addCancelButton.click();
    await expect<any>(editorPage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    await expect<any>(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);
  });

  it('change config to show Pictures and hide captions', async () => {
    await configPage.get();
    await configPage.tabs.unified.click();
    await util.setCheckbox(configPage.unifiedPane.hiddenIfEmptyCheckbox('Pictures'), false);
    await configPage.unifiedPane.fieldSpecificButton('Pictures').click();
    await util.setCheckbox(configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox('Pictures'), true);
    await configPage.applyButton.click();
  });

  it('caption is hidden when empty if "Hidden if empty" is set in config', async () => {
    await Utils.clickBreadcrumb(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await editorPage.edit.hideHiddenFields();
    await expect<any>(editorPage.edit.pictures.captions.first().isDisplayed()).toBe(true);
    await editorPage.edit.selectElement.clear(editorPage.edit.pictures.captions.first());
    await expect<any>(editorPage.edit.pictures.captions.count()).toBe(0);
  });

  it('change config to show Pictures and show captions', async () => {
    await configPage.get();
    await configPage.tabs.unified.click();
    await util.setCheckbox(configPage.unifiedPane.hiddenIfEmptyCheckbox('Pictures'), false);
    await configPage.unifiedPane.fieldSpecificButton('Pictures').click();
    await util.setCheckbox(configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox('Pictures'), false);
    await configPage.applyButton.click();
  });

  it('when caption is empty, it is visible if "Hidden if empty" is cleared in config', async () => {
    await Utils.clickBreadcrumb(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect<any>(editorPage.edit.pictures.captions.first().isDisplayed()).toBe(true);
  });

  it('picture is removed when Delete is clicked', async () => {
    await expect<any>(editorPage.edit.pictures.images.first().isPresent()).toBe(true);
    await expect<any>(editorPage.edit.pictures.removeImages.first().isPresent()).toBe(true);
    await editorPage.edit.pictures.removeImages.first().click();
    await Utils.clickModalButton('Delete Picture');
    await expect<any>(editorPage.edit.pictures.images.count()).toBe(0);
  });

  it('change config to hide Pictures and hide captions', async () => {
    await configPage.get();
    await configPage.tabs.unified.click();
    await util.setCheckbox(configPage.unifiedPane.hiddenIfEmptyCheckbox('Pictures'), true);
    await configPage.unifiedPane.fieldSpecificButton('Pictures').click();
    await util.setCheckbox(configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox('Pictures'), true);
    await configPage.applyButton.click();
  });

  it('while Show Hidden Fields has not been clicked, Pictures field is hidden', async () => {
    await Utils.clickBreadcrumb(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect<any>(editorPage.edit.getFields('Pictures').count()).toBe(0);
    await editorPage.edit.showHiddenFields();
    await expect<any>(editorPage.edit.pictures.list.isPresent()).toBe(true);
    await editorPage.edit.hideHiddenFields();
    await expect<any>(editorPage.edit.getFields('Pictures').count()).toBe(0);
  });

  it('audio Input System is present, playable and has "more" control (manager)', async () => {
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).count()).toEqual(1);
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class'))
      .toContain('fa-play');
    await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isEnabled()).toBe(true);
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('file upload drop box is displayed when Upload is clicked', async () => {
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    await editorPage.edit.audio.moreControls(lexemeLabel).first().click();
    await editorPage.edit.audio.moreUpload(lexemeLabel, 0).click();
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Uploading Audio is clicked', async () => {
    await expect<any>(editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().click();
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('click on second word (found by definition)', async () => {
    await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
  });

  it('word 2: audio Input System is not playable but has "upload" button (manager)', async () => {
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().isPresent()).toBe(false);
    await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isPresent()).toBe(false);
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isEnabled()).toBe(true);
    await expect<any>(editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('login as member, click on first word', async () => {
    await loginPage.loginAsMember();
    await projectsPage.get();
    await projectsPage.clickOnProjectName(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('audio Input System is present, playable and has "more" control (member)', async () => {
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).count()).toEqual(1);
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class'))
      .toContain('fa-play');
    await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isEnabled()).toBe(true);
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('click on second word (found by definition)', async () => {
    await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value)
      .click();
  });

  it('word 2: audio Input System is not playable but has "upload" button (member)', async () => {
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().isPresent()).toBe(false);
    await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isPresent()).toBe(false);
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isEnabled()).toBe(true);
    await expect<any>(editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('login as observer, click on first word', async () => {
    // browser.sleep needs to avoid warnings
    await browser.sleep(1500);
    await loginPage.loginAsObserver();
    await projectsPage.get();
    await projectsPage.clickOnProjectName(constants.testProjectName);
    // browser.sleep needs to avoid warnings
    await browser.sleep(500);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('audio Input System is playable but does not have "more" control (observer)', async () => {
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).count()).toEqual(1);
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class')).
      toContain('fa-play');
    await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
  });

  it('click on second word (found by definition)', async () => {
    await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
  });

  it('word 2: audio Input System is not playable and does not have "upload" button (observer)',
    async () => {
      await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().isPresent()).toBe(false);
      await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isPresent()).toBe(false);
      await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
      await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
      await expect<any>(editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    });

  it('login as manager, click on first word', async () => {
    // browser.sleep needs to avoid warnings
    await browser.sleep(1500);
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.clickOnProjectName(constants.testProjectName);
    // browser.sleep needs to avoid warnings
    await browser.sleep(500);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('can delete audio Input System', async () => {
    await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    await editorPage.edit.audio.moreControls(lexemeLabel).first().click();
    await editorPage.edit.audio.moreDelete(lexemeLabel, 0).click();
    await Utils.clickModalButton('Delete Audio');
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is displayed when Upload is clicked', async () => {
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    await editorPage.edit.audio.uploadButtons(lexemeLabel).first().click();
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Uploading Audio is clicked', async () => {
    await browser.wait(() => editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first(),
      constants.conditionTimeout);
    await expect<any>(editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().click();
    await expect<any>(editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    await expect<any>(editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
    await expect<any>(editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  describe('Mock file upload', async () => {

    it('can\'t upload a non-audio file', async () => {
      await expect<any>(editorPage.noticeList.count()).toBe(0);
      await editorPage.edit.audio.uploadButtons(lexemeLabel).first().click();
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.enableButton.click();
      await expect(editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput.isDisplayed()).toBe(true);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput
        .sendKeys(constants.testMockPngUploadFile.name);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput
        .sendKeys(constants.testMockPngUploadFile.size);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.uploadButton.click();
      await expect<any>(editorPage.noticeList.count()).toBe(1);
      await expect<any>(editorPage.noticeList.first().getText()).toContain(constants.testMockPngUploadFile.name +
          ' is not an allowed audio file. Ensure the file is');
      await expect<any>(editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(true);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput.clear();
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput.clear();
      await editorPage.firstNoticeCloseButton.click();
      // added browser.sleep to avoid Timeout warnings information
      await browser.sleep(1000);
    });

    it('can upload an audio file', async () => {
      await expect<any>(editorPage.noticeList.count()).toBe(0);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput
        .sendKeys(constants.testMockMp3UploadFile.name);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput
        .sendKeys(constants.testMockMp3UploadFile.size);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.uploadButton.click();
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.enableButton.click();
      await expect<any>(editorPage.noticeList.count()).toBe(1);
      await expect<any>(editorPage.noticeList.first().getText()).toContain('File uploaded successfully');
      await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
      await expect<any>(editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class')).
        toContain('fa-play');
      await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
      await expect<any>(editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
      await expect<any>(editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
      // added browser.sleep to avoid Timeout warnings information
      await browser.sleep(1000);
    });

  });

  it('click on second word (found by definition)', async () => {
    await browser.wait(() => editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value),
      Utils.conditionTimeout);
    await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
    // added browser.sleep to avoid Timeout warnings information
    await browser.sleep(1000);
  });

  it('word 2: edit page has correct definition, part of speech', async () => {
    await browser.wait(() => editorUtil.getFieldValues('Definition'), Utils.conditionTimeout);
    await expect<any>(editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testEntry2.senses[0].definition.en.value }
    ]);
    await expect<any>(editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testEntry2.senses[0].partOfSpeech.value)
    ]);
  });

  it('setup: click on word with multiple definitions (found by lexeme)', async () => {
    await editorPage.edit.findEntryByLexeme(constants.testMultipleMeaningEntry1.lexeme.th.value).click();
    await console.log('Start Test 1');
    // fix problem with protractor not scrolling to element before click
    await browser.driver.executeScript('arguments[0].scrollIntoView();',
      editorPage.edit.senses.first().getWebElement());
    await editorPage.edit.senses.first().click();
  });

  it('dictionary citation reflects example sentences and translations', async () => {
    await expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value);
    await expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value);
  });

  it('word with multiple definitions: edit page has correct definitions, parts of speech',
  async () => {
    await expect<any>(editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].definition.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].definition.en.value }
    ]);
    await expect<any>(editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.value),
      editorUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.value)
    ]);
  });

  it('word with multiple meanings: edit page has correct example sentences, translations', async () => {
    await browser.wait(() => editorUtil.getFieldValues('Sentence'), Utils.conditionTimeout);
    await expect<any>(editorUtil.getFieldValues('Sentence')).toEqual([
      { th: constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value }
    ]);
    await browser.wait(() => editorUtil.getFieldValues('Translation'), Utils.conditionTimeout);
    await expect<any>(editorUtil.getFieldValues('Translation')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value }
    ]);
  });

  it('while Show Hidden Fields has not been clicked, hidden fields are hidden if they are empty', async () => {
    await expect<any>(editorPage.edit.getFields('Semantics Note').count()).toBe(0);
    await expect<any>(editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
    await editorPage.edit.showHiddenFields();
    await expect<any>(editorPage.edit.getOneField('Semantics Note').isPresent()).toBe(true);
    await expect<any>(editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
  });

  it('word with multiple meanings: edit page has correct general notes, sources', async () => {
    await expect<any>(editorUtil.getFieldValues('General Note')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].generalNote.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].generalNote.en.value }
    ]);

    // First item is empty Etymology Source, now that View Settings all default to visible. IJH
    await expect<any>(editorUtil.getFieldValues('Source')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].source.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].source.en.value }
    ]);
  });

  it('senses can be reordered and deleted', async () => {
    await editorPage.edit.sense.actionMenus.first().click();
    await editorPage.edit.sense.moveDown.first().click();
    await expect<any>(editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[1].definition.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[0].definition.en.value }
    ]);
    await editorPage.edit.saveBtn.click();
  });

  it('back to browse page, create new word', async () => {
    await editorPage.edit.toListLink.click();
    await editorPage.browse.newWordBtn.click();
  });

  it('check that word count is still correct', async () => {
    await expect(editorPage.edit.entriesList.count()).toEqual(editorPage.edit.getEntryCount());
    await expect<any>(editorPage.edit.getEntryCount()).toEqual(4);
  });

  it('modify new word', async () => {
    const word = constants.testEntry3.lexeme.th.value;
    const definition = constants.testEntry3.senses[0].definition.en.value;
    await editorPage.edit.getMultiTextInputs(lexemeLabel).first().sendKeys(word);
    await editorPage.edit.getMultiTextInputs('Definition').first().sendKeys(definition);
    await Utils.clickDropdownByValue(editorPage.edit.getOneField('Part of Speech').element(by.css('select')),
      new RegExp('Noun \\(n\\)'));
    await Utils.scrollTop();
    await editorPage.edit.saveBtn.click();
  });

  it('new word is visible in edit page', async () => {
    await editorPage.edit.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    await expect<any>(editorPage.edit.search.getMatchCount()).toBe(1);
    await editorPage.edit.search.clearBtn.click();
  });

  it('check that Semantic Domain field is visible (for view settings test later)', async () => {
      await expect(editorPage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
    });

  describe('Configuration check', async () => {
    const englishISIndex = 3;

    it('Word has only "th", "tipa" and "taud" visible', async () => {
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(3);
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
    });

    it('make "en" input system visible for "Word" field', async () => {
      await configPage.get();
      await configPage.tabs.unified.click();
      await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      await util.setCheckbox(
        configPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox(lexemeLabel, englishISIndex), true);
      await configPage.applyButton.click();
      await Utils.clickBreadcrumb(constants.testProjectName);
      await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    });

    it('Word has "th", "tipa", "taud" and "en" visible', async () => {
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(4);
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(3).getText()).toEqual('en');
    });

    it('make "en" input system invisible for "Word" field', async () => {
      await configPage.get();
      await configPage.tabs.unified.click();
      await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      await browser.wait(() => configPage.applyButton, constants.conditionTimeout);
      await util.setCheckbox(
        configPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox(lexemeLabel, englishISIndex), false);
      await configPage.applyButton.click();
      // browser.sleep needs to avoid error informations.
      await browser.sleep(500);
      await Utils.clickBreadcrumb(constants.testProjectName);
      await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    });

    it('Word has only "th", "tipa" and "taud" visible', async () => {
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(3);
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      await expect<any>(editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
    });

  });

  it('first entry is selected if entryId unknown', async () => {
    // browser.sleep needs to avoid error informations.
    await browser.sleep(1000);
    await editorPage.edit.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    await EditorPage.getProjectIdFromUrl().then(async projectId => {
      await EditorPage.get(projectId, '_unknown_id_1234');
    });
    // browser.sleep needs to avoid error informations.
    await browser.sleep(1000);
    await expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('URL entry id changes with entry', async () => {
    const entry1Id = EditorPage.getEntryIdFromUrl();
    await expect(entry1Id).toMatch(/[0-9a-z_]{6,24}/);
    await editorPage.edit.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    await expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry3.lexeme.th.value);
    const entry3Id = EditorPage.getEntryIdFromUrl();
    await expect(entry3Id).toMatch(/[0-9a-z_]{6,24}/);
    await expect(entry1Id).not.toEqual(entry3Id);
    await editorPage.edit.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    await expect(EditorPage.getEntryIdFromUrl()).not.toEqual(entry3Id);
  });

  it('new word is visible in browse page', async () => {
    await editorPage.edit.toListLink.click();
    await editorPage.browse.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    await expect<any>(editorPage.browse.search.getMatchCount()).toBe(1);
    await editorPage.browse.search.clearBtn.click();
  });

  it('check that word count is still correct in browse page', async () => {
    await expect(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    await expect<any>(editorPage.browse.getEntryCount()).toBe(4);
  });

  it('remove new word to restore original word count', async () => {
    await browser.wait(ExpectedConditions.visibilityOf(
      element(by.id('lexAppListView'))), Utils.conditionTimeout);
    await editorPage.browse.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    await editorPage.edit.actionMenu.click();
    await editorPage.edit.deleteMenuItem.click();
    await expect<any>(editorPage.modal.modalBodyText.getText()).toContain(constants.testEntry3.lexeme.th.value);
    await Utils.clickModalButton('Delete Entry');
    await expect<any>(editorPage.edit.getEntryCount()).toBe(3);
  });

  it('previous entry is selected after delete', async () => {
    await expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });
});
