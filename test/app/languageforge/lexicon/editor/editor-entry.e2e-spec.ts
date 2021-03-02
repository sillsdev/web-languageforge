import {browser, by, ExpectedConditions} from 'protractor';

import { protractor } from 'protractor/built/ptor';
import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {ConfigurationPage} from '../shared/configuration.page';
import {EditorPage} from '../shared/editor.page';
import {EditorUtil} from '../shared/editor.util';

describe('Lexicon E2E Editor List and Entry', () => {
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
    await projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', async () => {
    // flaky assertion
    expect(await editorPage.browse.entriesList.count()).toEqual(await editorPage.browse.getEntryCount());
    expect<any>(await editorPage.browse.getEntryCount()).toBe(3);
  });

  it('search function works correctly', async () => {
    await editorPage.browse.search.input.sendKeys('asparagus');
    expect<any>(await editorPage.browse.search.getMatchCount()).toBe(1);
    await editorPage.browse.search.clearBtn.click();
    await editorPage.browse.search.input.sendKeys('Asparagus');
    expect<any>(await editorPage.browse.search.getMatchCount()).toBe(1);
    await editorPage.browse.search.clearBtn.click();
  });

  it('refresh returns to list view', async () => {
    await browser.refresh();
    expect<any>(await editorPage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', async () => {
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('refresh returns to entry view', async () => {
    expect(await editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    await browser.refresh();
    expect(await editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('edit page has correct word count', async () => {
    expect(await editorPage.edit.entriesList.count()).toEqual(await editorPage.edit.getEntryCount());
    expect<any>(await editorPage.edit.getEntryCount()).toBe(3);
  });

  it('word 1: edit page has correct definition, part of speech', async () => {
    expect<any>(await editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testEntry1.senses[0].definition.en.value }
    ]);
    expect<any>(await editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testEntry1.senses[0].partOfSpeech.value)
    ]);
  });

  it('dictionary citation reflects lexeme form', async () => {
    expect(await editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    expect(await editorPage.edit.renderedDiv.getText()).not.toContain('citation form');
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
    await editorPage.edit.showHiddenFields();
    const citationFormMultiTextInputs = editorPage.edit.getMultiTextInputs('Citation Form');
    await editorPage.edit.selectElement.sendKeys(citationFormMultiTextInputs.first(), 'citation form');
    expect(await editorPage.edit.renderedDiv.getText()).toContain('citation form');
    expect(await editorPage.edit.renderedDiv.getText()).not.toContain(constants.testEntry1.lexeme.th.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    await editorPage.edit.selectElement.clear(citationFormMultiTextInputs.first());
    expect(await editorPage.edit.renderedDiv.getText()).not.toContain('citation form');
    expect(await editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    await editorPage.edit.hideHiddenFields();
  });

  it('one picture and caption is present', async () => {
    expect(await editorPage.edit.pictures.getFileName(0))
      .toContain('_' + constants.testEntry1.senses[0].pictures[0].fileName);
    expect(await editorPage.edit.pictures.getCaption(0))
      .toEqual({ en: constants.testEntry1.senses[0].pictures[0].caption.en.value });
  });

  it('file upload drop box is displayed when Add Picture is clicked', async () => {
    expect<any>(await editorPage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    expect<any>(await editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);

    // fix problem with protractor not scrolling to element before click
    await browser.driver.executeScript('arguments[0].scrollIntoView();',
      editorPage.edit.pictures.addPictureLink.getWebElement());
    await editorPage.edit.pictures.addPictureLink.click();
    expect<any>(await editorPage.edit.pictures.addPictureLink.isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Adding Picture is clicked', async () => {
    expect<any>(await editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(true);
    await editorPage.edit.pictures.addCancelButton.click();
    expect<any>(await editorPage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    expect<any>(await editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);
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
    expect<any>(await editorPage.edit.pictures.captions.first().isDisplayed()).toBe(true);
    await editorPage.edit.selectElement.clear(editorPage.edit.pictures.captions.first());
    expect<any>(await editorPage.edit.pictures.captions.count()).toBe(0);
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
    expect<any>(await editorPage.edit.pictures.captions.first().isDisplayed()).toBe(true);
  });

  it('picture is removed when Delete is clicked', async () => {
    expect<any>(await editorPage.edit.pictures.images.first().isPresent()).toBe(true);
    expect<any>(await editorPage.edit.pictures.removeImages.first().isPresent()).toBe(true);
    await editorPage.edit.pictures.removeImages.first().click();
    await Utils.clickModalButton('Delete Picture');
    expect<any>(await editorPage.edit.pictures.images.count()).toBe(0);
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
    expect<any>(await editorPage.edit.getFields('Pictures').count()).toBe(0);
    await editorPage.edit.showHiddenFields();
    expect<any>(await editorPage.edit.pictures.list.isPresent()).toBe(true);
    await editorPage.edit.hideHiddenFields();
    expect<any>(await editorPage.edit.getFields('Pictures').count()).toBe(0);
  });

  it('audio Input System is present, playable and has "more" control (manager)', async () => {
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).count()).toEqual(1);
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class')).toContain('fa-play');
    expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isEnabled()).toBe(true);
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('file upload drop box is displayed when Upload is clicked', async () => {
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    await editorPage.edit.audio.moreControls(lexemeLabel).first().click();
    await editorPage.edit.audio.moreUpload(lexemeLabel, 0).click();
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Uploading Audio is clicked', async () => {
    expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().click();
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('click on second word (found by definition)', async () => {
    await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
  });

  it('word 2: audio Input System is not playable but has "upload" button (manager)', async () => {
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isPresent()).toBe(false);
    expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isPresent()).toBe(false);
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isEnabled()).toBe(true);
    expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('login as member, click on first word', async () => {
    await loginPage.loginAsMember();
    await projectsPage.get();
    await projectsPage.clickOnProject(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('audio Input System is present, playable and has "more" control (member)', async () => {
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).count()).toEqual(1);
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class')).toContain('fa-play');
    expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isEnabled()).toBe(true);
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('click on second word (found by definition)', async () => {
    await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value)
      .click();
  });

  it('word 2: audio Input System is not playable but has "upload" button (member)', async () => {
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isPresent()).toBe(false);
    expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isPresent()).toBe(false);
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isEnabled()).toBe(true);
    expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  it('login as observer, click on first word', async () => {
    await loginPage.loginAsObserver();
    await projectsPage.get();
    await projectsPage.clickOnProject(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('audio Input System is playable but does not have "more" control (observer)', async () => {
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).count()).toEqual(1);
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class')).toContain('fa-play');
    expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
  });

  it('click on second word (found by definition)', async () => {
    await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
  });

  it('word 2: audio Input System is not playable and does not have "upload" button (observer)',
    async () => {
      expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isPresent()).toBe(false);
      expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isPresent()).toBe(false);
      expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(false);
      expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
      expect<any>(await editorPage.edit.audio.downloadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    });

  it('login as manager, click on first word', async () => {
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.clickOnProject(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('can delete audio Input System', async () => {
    expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    await editorPage.edit.audio.moreControls(lexemeLabel).first().click();
    await editorPage.edit.audio.moreDelete(lexemeLabel, 0).click();
    await Utils.clickModalButton('Delete Audio');
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is displayed when Upload is clicked', async () => {
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    await editorPage.edit.audio.uploadButtons(lexemeLabel).first().click();
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Uploading Audio is clicked', async () => {
    expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().click();
    expect<any>(await editorPage.edit.audio.uploadButtons(lexemeLabel).first().isDisplayed()).toBe(true);
    expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(false);
    expect<any>(await editorPage.edit.audio.uploadCancelButtons(lexemeLabel).first().isDisplayed()).toBe(false);
  });

  describe('Mock file upload', async () => {

    it('can\'t upload a non-audio file', async () => {
      expect<any>(await editorPage.noticeList.count()).toBe(0);
      await editorPage.edit.audio.uploadButtons(lexemeLabel).first().click();
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.enableButton.click();
      expect(await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput.isDisplayed()).toBe(true);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput
        .sendKeys(constants.testMockPngUploadFile.name);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput
        .sendKeys(constants.testMockPngUploadFile.size);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.uploadButton.click();
      expect<any>(await editorPage.noticeList.count()).toBe(1);
      expect<any>(await editorPage.noticeList.first().getText()).toContain(constants.testMockPngUploadFile.name +
          ' is not an allowed audio file. Ensure the file is');
      expect<any>(await editorPage.edit.audio.uploadDropBoxes(lexemeLabel).first().isDisplayed()).toBe(true);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput.clear();
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput.clear();
      await editorPage.firstNoticeCloseButton.click();
    });

    it('can upload an audio file', async () => {
      expect<any>(await editorPage.noticeList.count()).toBe(0);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileNameInput
        .sendKeys(constants.testMockMp3UploadFile.name);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.fileSizeInput
        .sendKeys(constants.testMockMp3UploadFile.size);
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.uploadButton.click();
      await editorPage.edit.audio.control(lexemeLabel, 0).mockUpload.enableButton.click();
      expect<any>(await editorPage.noticeList.count()).toBe(1);
      expect<any>(await editorPage.noticeList.first().getText()).toContain('File uploaded successfully');
      expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().isDisplayed()).toBe(true);
      expect<any>(await editorPage.edit.audio.playerIcons(lexemeLabel).first().getAttribute('class')).toContain('fa-play');
      expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isDisplayed()).toBe(true);
      expect<any>(await editorPage.edit.audio.players(lexemeLabel).first().isEnabled()).toBe(true);
      expect<any>(await editorPage.edit.audio.moreControls(lexemeLabel).first().isDisplayed()).toBe(true);
    });

  });

  it('click on second word (found by definition)', async () => {
    await editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
  });

  it('word 2: edit page has correct definition, part of speech', async () => {
    expect<any>(await editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testEntry2.senses[0].definition.en.value }
    ]);
    expect<any>(await editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testEntry2.senses[0].partOfSpeech.value)
    ]);
  });

  it('setup: click on word with multiple definitions (found by lexeme)', async () => {
    await editorPage.edit.findEntryByLexeme(constants.testMultipleMeaningEntry1.lexeme.th.value).click();

    // fix problem with protractor not scrolling to element before click
    await browser.driver.executeScript('arguments[0].scrollIntoView();',
      editorPage.edit.senses.first().getWebElement());
    await editorPage.edit.senses.first().click();
  });

  it('dictionary citation reflects example sentences and translations', async () => {
    expect(await editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value);
    expect(await editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value);
  });

  it('word with multiple definitions: edit page has correct definitions, parts of speech',
  async () => {
    expect<any>(await editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].definition.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].definition.en.value }
    ]);
    expect<any>(await editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.value),
      editorUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.value)
    ]);
  });

  it('word with multiple meanings: edit page has correct example sentences, translations', async () => {
    expect<any>(await editorUtil.getFieldValues('Sentence')).toEqual([
      { th: constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value }
    ]);
    expect<any>(await editorUtil.getFieldValues('Translation')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value }
    ]);
  });

  it('while Show Hidden Fields has not been clicked, hidden fields are hidden if they are empty', async () => {
    expect<any>(await editorPage.edit.getFields('Semantics Note').count()).toBe(0);
    expect<any>(await editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
    await editorPage.edit.showHiddenFields();
    expect<any>(await editorPage.edit.getOneField('Semantics Note').isPresent()).toBe(true);
    expect<any>(await editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
  });

  it('word with multiple meanings: edit page has correct general notes, sources', async () => {
    expect<any>(await editorUtil.getFieldValues('General Note')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].generalNote.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].generalNote.en.value }
    ]);

    // First item is empty Etymology Source, now that View Settings all default to visible. IJH
    expect<any>(await editorUtil.getFieldValues('Source')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].source.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].source.en.value }
    ]);
  });

  it('senses can be reordered and deleted', async () => {
    await editorPage.edit.sense.actionMenus.first().click();
    await editorPage.edit.sense.moveDown.first().click();
    expect<any>(await editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[1].definition.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[0].definition.en.value }
    ]);
  });

  it('back to browse page, create new word', async () => {
    await editorPage.edit.toListLink.click();
    await editorPage.browse.newWordBtn.click();
  });

  it('check that word count is still correct', async () => {
    expect(await editorPage.edit.entriesList.count()).toEqual(await editorPage.edit.getEntryCount());
    expect<any>(await editorPage.edit.getEntryCount()).toEqual(4);
  });

  it('modify new word', async () => {
    const word = constants.testEntry3.lexeme.th.value;
    const definition = constants.testEntry3.senses[0].definition.en.value;
    await editorPage.edit.getMultiTextInputs(lexemeLabel).first().sendKeys(word);
    await editorPage.edit.getMultiTextInputs('Definition').first().sendKeys(definition);
    await Utils.clickDropdownByValue(await editorPage.edit.getOneField('Part of Speech').element(by.css('select')),
      new RegExp('Noun \\(n\\)'));
      await Utils.scrollTop();
  });

  it('autosaves changes', async () => {
    await browser.refresh();
    await browser.wait(ExpectedConditions.visibilityOf(await editorPage.edit.fields.last()));
    await editorPage.edit.getMultiTextInputs(lexemeLabel).first().getAttribute('value').then(async text => {
      await editorPage.edit.getMultiTextInputs(lexemeLabel).first().sendKeys('a');
      await browser.refresh();
      await browser.wait(ExpectedConditions.visibilityOf(await editorPage.edit.fields.last()));
      expect<any>(await editorPage.edit.getMultiTextInputs(lexemeLabel).first().getAttribute('value')).toEqual(text + 'a');
      await editorPage.edit.getMultiTextInputs(lexemeLabel).first().sendKeys(protractor.Key.BACK_SPACE);
    });
  });

  it('new word is visible in edit page', async () => {
    await editorPage.edit.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    expect<any>(await editorPage.edit.search.getMatchCount()).toBe(1);
    await editorPage.edit.search.clearBtn.click();
  });

  it('check that Semantic Domain field is visible (for view settings test later)', async () => {
      expect(await editorPage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
    });

  describe('Configuration check', async () => {
    const englishISIndex = 3;

    it('Word has only "th", "tipa" and "taud" visible', async () => {
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(3);
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
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
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(4);
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(3).getText()).toEqual('en');
    });

    it('make "en" input system invisible for "Word" field', async () => {
      await configPage.get();
      await configPage.tabs.unified.click();
      await configPage.unifiedPane.fieldSpecificButton(lexemeLabel).click();
      await util.setCheckbox(
        configPage.unifiedPane.entry.fieldSpecificInputSystemCheckbox(lexemeLabel, englishISIndex), false);
      await configPage.applyButton.click();
      await Utils.clickBreadcrumb(constants.testProjectName);
      await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    });

    it('Word has only "th", "tipa" and "taud" visible', async () => {
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).count()).toEqual(3);
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(0).getText()).toEqual('th');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(1).getText()).toEqual('tipa');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(lexemeLabel).get(2).getText()).toEqual('taud');
    });

  });

  it('first entry is selected if entryId unknown', async () => {
    await editorPage.edit.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    await EditorPage.getProjectIdFromUrl().then(projectId => {
      return EditorPage.get(projectId, '_unknown_id_1234');
    });

    expect(await editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('URL entry id changes with entry', async () => {
    const entry1Id = await EditorPage.getEntryIdFromUrl();
    expect(entry1Id).toMatch(/[0-9a-z_]{6,24}/);
    await editorPage.edit.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    expect(await editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry3.lexeme.th.value);
    const entry3Id = await EditorPage.getEntryIdFromUrl();
    expect(entry3Id).toMatch(/[0-9a-z_]{6,24}/);
    expect(entry1Id).not.toEqual(entry3Id);
    await editorPage.edit.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect(await editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    expect(await EditorPage.getEntryIdFromUrl()).not.toEqual(entry3Id);
  });

  it('new word is visible in browse page', async () => {
    await editorPage.edit.toListLink.click();
    await editorPage.browse.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    expect<any>(await editorPage.browse.search.getMatchCount()).toBe(1);
    await editorPage.browse.search.clearBtn.click();
  });

  it('check that word count is still correct in browse page', async () => {
    expect(await editorPage.browse.entriesList.count()).toEqual(await editorPage.browse.getEntryCount());
    expect<any>(await editorPage.browse.getEntryCount()).toBe(4);
  });

  it('remove new word to restore original word count', async () => {
    await editorPage.browse.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    await editorPage.edit.actionMenu.click();
    await editorPage.edit.deleteMenuItem.click();
    expect<any>(await editorPage.modal.modalBodyText.getText()).toContain(constants.testEntry3.lexeme.th.value);
    await Utils.clickModalButton('Delete Entry');
    expect<any>(await editorPage.edit.getEntryCount()).toBe(3);
  });

  it('previous entry is selected after delete', async () => {
    expect(await editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });
});
