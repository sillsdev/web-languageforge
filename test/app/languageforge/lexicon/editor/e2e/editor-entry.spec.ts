import {browser, by} from 'protractor';

import {BellowsLoginPage} from '../../../../bellows/pages/loginPage';
import {ProjectsPage} from '../../../../bellows/pages/projectsPage';
import {Utils} from '../../../../bellows/pages/utils';
import {ConfigurationPage} from '../../pages/configurationPage';
import {EditorPage} from '../../pages/editorPage';
import {EditorUtil} from '../../pages/editorUtil';

describe('Editor List and Entry', () => {
  const constants = require('../../../../testConstants.json');
  const loginPage    = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const util         = new Utils();
  const editorPage   = new EditorPage();
  const editorUtil   = new EditorUtil();
  const configPage   = new ConfigurationPage();

  const LEXEME_LABEL = 'Word';

  it('setup: login, click on test project', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', () => {
    // flaky assertion
    expect(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    expect<any>(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('search function works correctly', () => {
    editorPage.browse.search.input.sendKeys('asparagus');
    expect<any>(editorPage.browse.search.getMatchCount()).toBe(1);
    editorPage.browse.search.clearBtn.click();
  });

  it('refresh returns to list view', () => {
    browser.refresh();
    expect<any>(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', () => {
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('refresh returns to entry view', () => {
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    browser.refresh();
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('edit page has correct word count', () => {
    expect(editorPage.edit.entriesList.count()).toEqual(editorPage.edit.getEntryCount());
    expect<any>(editorPage.edit.getEntryCount()).toBe(3);
  });

  it('word 1: edit page has correct definition, part of speech', () => {
    expect<any>(editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testEntry1.senses[0].definition.en.value }
    ]);
    expect<any>(editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testEntry1.senses[0].partOfSpeech.value)
    ]);
  });

  it('dictionary citation reflects lexeme form', () => {
    expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    expect(editorPage.edit.renderedDiv.getText()).not.toContain('citation form');
  });

  it('add citation form as visible field', () => {
    configPage.get();
    configPage.tabs.unified.click();
    util.setCheckbox(configPage.unifiedTab.hiddenIfEmptyCheckbox('Citation Form'), false);
    configPage.applyButton.click();
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('citation form field overrides lexeme form in dictionary citation view', () => {
    editorPage.edit.showHiddenFields();
    const citationFormMultiTextInputs = editorPage.edit.getMultiTextInputs('Citation Form');
    editorPage.edit.selectElement.sendKeys(citationFormMultiTextInputs.first(), 'citation form');
    expect(editorPage.edit.renderedDiv.getText()).toContain('citation form');
    expect(editorPage.edit.renderedDiv.getText()).not.toContain(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    editorPage.edit.selectElement.clear(citationFormMultiTextInputs.first());
    expect(editorPage.edit.renderedDiv.getText()).not.toContain('citation form');
    expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    editorPage.edit.hideHiddenFields();
  });

  it('one picture and caption is present', () => {
    expect(editorPage.edit.pictures.getFileName(0))
      .toContain('_' + constants.testEntry1.senses[0].pictures[0].fileName);
    expect(editorPage.edit.pictures.getCaption(0))
      .toEqual({ en: constants.testEntry1.senses[0].pictures[0].caption.en.value });
  });

  it('file upload drop box is displayed when Add Picture is clicked', () => {
    expect<any>(editorPage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    expect<any>(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);

    // fix problem with protractor not scrolling to element before click
    browser.driver.executeScript('arguments[0].scrollIntoView();',
      editorPage.edit.pictures.addPictureLink.getWebElement());
    editorPage.edit.pictures.addPictureLink.click();
    expect<any>(editorPage.edit.pictures.addPictureLink.isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Adding Picture is clicked', () => {
    expect<any>(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(true);
    editorPage.edit.pictures.addCancelButton.click();
    expect<any>(editorPage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    expect<any>(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);
  });

  it('change config to show Pictures and hide captions', () => {
    configPage.get();
    configPage.tabs.unified.click();
    util.setCheckbox(configPage.unifiedTab.hiddenIfEmptyCheckbox('Pictures'), false);
    configPage.unifiedTab.fieldSpecificButton('Pictures').click();
    util.setCheckbox(configPage.unifiedTab.sense.fieldSpecificCaptionHiddenIfEmptyCheckbox('Pictures'), true);
    configPage.applyButton.click();
  });

  it('caption is hidden when empty if "Hidden if empty" is set in config', () => {
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    editorPage.edit.hideHiddenFields();
    expect<any>(editorPage.edit.pictures.captions.first().isDisplayed()).toBe(true);
    editorPage.edit.selectElement.clear(editorPage.edit.pictures.captions.first());
    expect<any>(editorPage.edit.pictures.captions.count()).toBe(0);
  });

  it('change config to show Pictures and show captions', () => {
    configPage.get();
    configPage.tabs.unified.click();
    util.setCheckbox(configPage.unifiedTab.hiddenIfEmptyCheckbox('Pictures'), false);
    configPage.unifiedTab.fieldSpecificButton('Pictures').click();
    util.setCheckbox(configPage.unifiedTab.sense.fieldSpecificCaptionHiddenIfEmptyCheckbox('Pictures'), false);
    configPage.applyButton.click();
  });

  it('when caption is empty, it is visible if "Hidden if empty" is cleared in config', () => {
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect<any>(editorPage.edit.pictures.captions.first().isDisplayed()).toBe(true);
  });

  it('picture is removed when Delete is clicked', () => {
    expect<any>(editorPage.edit.pictures.images.first().isPresent()).toBe(true);
    expect<any>(editorPage.edit.pictures.removeImages.first().isPresent()).toBe(true);
    editorPage.edit.pictures.removeImages.first().click();
    util.clickModalButton('Delete Picture');
    expect<any>(editorPage.edit.pictures.images.count()).toBe(0);
  });

  it('change config to hide Pictures and hide captions', () => {
    configPage.get();
    configPage.tabs.unified.click();
    util.setCheckbox(configPage.unifiedTab.hiddenIfEmptyCheckbox('Pictures'), true);
    configPage.unifiedTab.fieldSpecificButton('Pictures').click();
    util.setCheckbox(configPage.unifiedTab.sense.fieldSpecificCaptionHiddenIfEmptyCheckbox('Pictures'), true);
    configPage.applyButton.click();
  });

  it('while Show Hidden Fields has not been clicked, Pictures field is hidden', () => {
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect<any>(editorPage.edit.getFields('Pictures').count()).toBe(0);
    editorPage.edit.showHiddenFields();
    expect<any>(editorPage.edit.pictures.list.isPresent()).toBe(true);
    editorPage.edit.hideHiddenFields();
    expect<any>(editorPage.edit.getFields('Pictures').count()).toBe(0);
  });

  it('audio Input System is present, playable and has "more" control (manager)', () => {
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).count()).toEqual(1);
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().getAttribute('class')).toContain('fa-play');
    expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isEnabled()).toBe(true);
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isEnabled()).toBe(true);
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.downloadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
  });

  it('file upload drop box is displayed when Upload is clicked', () => {
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.uploadDropBoxes(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadCancelButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    editorPage.edit.audio.moreControls(LEXEME_LABEL).first().click();
    editorPage.edit.audio.moreUpload(LEXEME_LABEL, 0).click();
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadDropBoxes(LEXEME_LABEL).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Uploading Audio is clicked', () => {
    expect<any>(editorPage.edit.audio.uploadCancelButtons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    editorPage.edit.audio.uploadCancelButtons(LEXEME_LABEL).first().click();
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.uploadDropBoxes(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadCancelButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
  });

  it('click on second word (found by definition)', () => {
    editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
  });

  it('word 2: audio Input System is not playable but has "upload" button (manager)', () => {
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isEnabled()).toBe(true);
    expect<any>(editorPage.edit.audio.downloadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
  });

  it('login as member, click on first word', () => {
    loginPage.loginAsMember();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('audio Input System is present, playable and has "more" control (member)', () => {
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).count()).toEqual(1);
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().getAttribute('class')).toContain('fa-play');
    expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isEnabled()).toBe(true);
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isEnabled()).toBe(true);
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.downloadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
  });

  it('click on second word (found by definition)', () => {
    editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value)
      .click();
  });

  it('word 2: audio Input System is not playable but has "upload" button (member)', () => {
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isEnabled()).toBe(true);
    expect<any>(editorPage.edit.audio.downloadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
  });

  it('login as observer, click on first word', () => {
    loginPage.loginAsObserver();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('audio Input System is playable but does not have "more" control (observer)', () => {
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).count()).toEqual(1);
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().getAttribute('class')).toContain('fa-play');
    expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isEnabled()).toBe(true);
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.downloadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
  });

  it('click on second word (found by definition)', () => {
    editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
  });

  it('word 2: audio Input System is not playable and does not have "upload" button (observer)',
    () => {
      expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
      expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isDisplayed()).toBe(false);
      expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(false);
      expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
      expect<any>(editorPage.edit.audio.downloadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    });

  it('login as manager, click on first word', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('can delete audio Input System', () => {
    expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    editorPage.edit.audio.moreControls(LEXEME_LABEL).first().click();
    editorPage.edit.audio.moreDelete(LEXEME_LABEL, 0).click();
    util.clickModalButton('Delete Audio');
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is displayed when Upload is clicked', () => {
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.uploadDropBoxes(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadCancelButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().click();
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadDropBoxes(LEXEME_LABEL).first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Uploading Audio is clicked', () => {
    expect<any>(editorPage.edit.audio.uploadCancelButtons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    editorPage.edit.audio.uploadCancelButtons(LEXEME_LABEL).first().click();
    expect<any>(editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    expect<any>(editorPage.edit.audio.uploadDropBoxes(LEXEME_LABEL).first().isDisplayed()).toBe(false);
    expect<any>(editorPage.edit.audio.uploadCancelButtons(LEXEME_LABEL).first().isDisplayed()).toBe(false);
  });

  describe('Mock file upload', () => {

    it('can\'t upload a non-audio file', () => {
      expect<any>(editorPage.noticeList.count()).toBe(0);
      editorPage.edit.audio.uploadButtons(LEXEME_LABEL).first().click();
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.enableButton.click();
      expect(editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.fileNameInput.isDisplayed()).toBe(true);
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.fileNameInput
        .sendKeys(constants.testMockPngUploadFile.name);
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.fileSizeInput
        .sendKeys(constants.testMockPngUploadFile.size);
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.uploadButton.click();
      expect<any>(editorPage.noticeList.count()).toBe(1);
      expect<any>(editorPage.noticeList.first().getText()).toContain(constants.testMockPngUploadFile.name +
          ' is not an allowed audio file. Ensure the file is');
      expect<any>(editorPage.edit.audio.uploadDropBoxes(LEXEME_LABEL).first().isDisplayed()).toBe(true);
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.fileNameInput.clear();
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.fileSizeInput.clear();
      editorPage.firstNoticeCloseButton.click();
    });

    it('can upload an audio file', () => {
      expect<any>(editorPage.noticeList.count()).toBe(0);
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.fileNameInput
        .sendKeys(constants.testMockMp3UploadFile.name);
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.fileSizeInput
        .sendKeys(constants.testMockMp3UploadFile.size);
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.uploadButton.click();
      editorPage.edit.audio.control(LEXEME_LABEL, 0).mockUpload.enableButton.click();
      expect<any>(editorPage.noticeList.count()).toBe(1);
      expect<any>(editorPage.noticeList.first().getText()).toContain('File uploaded successfully');
      expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().isDisplayed()).toBe(true);
      expect<any>(editorPage.edit.audio.playerIcons(LEXEME_LABEL).first().getAttribute('class')).toContain('fa-play');
      expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isDisplayed()).toBe(true);
      expect<any>(editorPage.edit.audio.players(LEXEME_LABEL).first().isEnabled()).toBe(true);
      expect<any>(editorPage.edit.audio.moreControls(LEXEME_LABEL).first().isDisplayed()).toBe(true);
    });

  });

  it('click on second word (found by definition)', () => {
    editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value).click();
  });

  it('word 2: edit page has correct definition, part of speech', () => {
    expect<any>(editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testEntry2.senses[0].definition.en.value }
    ]);
    expect<any>(editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testEntry2.senses[0].partOfSpeech.value)
    ]);
  });

  it('setup: click on word with multiple definitions (found by lexeme)', () => {
    editorPage.edit.findEntryByLexeme(constants.testMultipleMeaningEntry1.lexeme.th.value).click();

    // fix problem with protractor not scrolling to element before click
    browser.driver.executeScript('arguments[0].scrollIntoView();',
      editorPage.edit.senses.first().getWebElement());
    editorPage.edit.senses.first().click();
  });

  it('dictionary citation reflects example sentences and translations', () => {
    expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value);
    expect(editorPage.edit.renderedDiv.getText()).toContain(
      constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value);
  });

  it('word with multiple definitions: edit page has correct definitions, parts of speech',
  () => {
    expect<any>(editorUtil.getFieldValues('Definition')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].definition.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].definition.en.value }
    ]);
    expect<any>(editorUtil.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.value),
      editorUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.value)
    ]);
  });

  it('word with multiple meanings: edit page has correct example sentences, translations', () => {
    // Empty array elements are a work-around for getFieldValues after SemDom directive added. DDW
    expect<any>(editorUtil.getFieldValues('Sentence')).toEqual([
      '', { th: constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value },
      '', { th: constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value }
    ]);
    expect<any>(editorUtil.getFieldValues('Translation')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value }
    ]);
  });

  it('while Show Hidden Fields has not been clicked, hidden fields are hidden if they are empty', () => {
    expect<any>(editorPage.edit.getFields('Semantics Note').count()).toBe(0);
    expect<any>(editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
    editorPage.edit.showHiddenFields();
    expect<any>(editorPage.edit.getOneField('Semantics Note').isPresent()).toBe(true);
    expect<any>(editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
  });

  it('word with multiple meanings: edit page has correct general notes, sources', () => {
    expect<any>(editorUtil.getFieldValues('General Note')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].generalNote.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].generalNote.en.value }
    ]);

    // First item is empty Etymology Source, now that View Settings all default to visible. IJH
    // Empty array elements are a work-around for getFieldValues after SemDom directive added. IJH
    expect<any>(editorUtil.getFieldValues('Source')).toEqual([
      { en: '' }, '',
      { en: constants.testMultipleMeaningEntry1.senses[0].source.en.value }, '',
      { en: constants.testMultipleMeaningEntry1.senses[1].source.en.value }
    ]);
  });

  it('back to browse page, create new word', () => {
    editorPage.edit.toListLink.click();
    editorPage.browse.newWordBtn.click();
  });

  it('check that word count is still correct', () => {
    expect(editorPage.edit.entriesList.count()).toEqual(editorPage.edit.getEntryCount());
    expect<any>(editorPage.edit.getEntryCount()).toEqual(4);
  });

  it('modify new word', () => {
    const word = constants.testEntry3.lexeme.th.value;
    const definition = constants.testEntry3.senses[0].definition.en.value;
    editorPage.edit.getMultiTextInputs(LEXEME_LABEL).first().sendKeys(word);
    editorPage.edit.getMultiTextInputs('Definition').first().sendKeys(definition);
    util.clickDropdownByValue(editorPage.edit.getOneField('Part of Speech').element(by.css('select')),
      new RegExp('Noun \\(n\\)'));
    util.scrollTop();
    editorPage.edit.saveBtn.click();
  });

  it('new word is visible in edit page', () => {
    editorPage.edit.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    expect<any>(editorPage.edit.search.getMatchCount()).toBe(1);
    editorPage.edit.search.clearBtn.click();
  });

  it('check that Semantic Domain field is visible (for view settings test later)', () => {
      expect(editorPage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
    });

  describe('Configuration check', () => {
    const ENGLISH_I_S_INDEX = 3;

    it('Word has only "th", "tipa" and "taud" visible', () => {
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).count()).toEqual(3);
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(0).getText()).toEqual('th');
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(1).getText()).toEqual('tipa');
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(2).getText()).toEqual('taud');
    });

    it('make "en" input system visible for "Word" field', () => {
      configPage.get();
      configPage.tabs.unified.click();
      configPage.unifiedTab.fieldSpecificButton(LEXEME_LABEL).click();
      util.setCheckbox(
        configPage.unifiedTab.entry.fieldSpecificInputSystemCheckbox(LEXEME_LABEL, ENGLISH_I_S_INDEX), true);
      configPage.applyButton.click();
      util.clickBreadcrumb(constants.testProjectName);
      editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    });

    it('Word has "th", "tipa", "taud" and "en" visible', () => {
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).count()).toEqual(4);
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(0).getText()).toEqual('th');
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(1).getText()).toEqual('tipa');
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(2).getText()).toEqual('taud');
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(3).getText()).toEqual('en');
    });

    it('make "en" input system invisible for "Word" field', () => {
      configPage.get();
      configPage.tabs.unified.click();
      configPage.unifiedTab.fieldSpecificButton(LEXEME_LABEL).click();
      util.setCheckbox(
        configPage.unifiedTab.entry.fieldSpecificInputSystemCheckbox(LEXEME_LABEL, ENGLISH_I_S_INDEX), false);
      configPage.applyButton.click();
      util.clickBreadcrumb(constants.testProjectName);
      editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    });

    it('Word has only "th", "tipa" and "taud" visible', () => {
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).count()).toEqual(3);
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(0).getText()).toEqual('th');
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(1).getText()).toEqual('tipa');
      expect<any>(editorPage.edit.getMultiTextInputSystems(LEXEME_LABEL).get(2).getText()).toEqual('taud');
    });

  });

  it('first entry is selected if entryId unknown', () => {
    editorPage.edit.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    editorPage.getProjectIdFromUrl().then(projectId => {
      editorPage.get(projectId, '_unknown_id_1234');
    });

    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('URL entry id changes with entry', () => {
    const entry1Id = editorPage.getEntryIdFromUrl();
    expect(entry1Id).toMatch(/[0-9a-z_]{6,24}/);
    editorPage.edit.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry3.lexeme.th.value);
    const entry3Id = editorPage.getEntryIdFromUrl();
    expect(entry3Id).toMatch(/[0-9a-z_]{6,24}/);
    expect(entry1Id).not.toEqual(entry3Id);
    editorPage.edit.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    expect(editorPage.getEntryIdFromUrl()).not.toEqual(entry3Id);
  });

  it('new word is visible in browse page', () => {
    editorPage.edit.toListLink.click();
    editorPage.browse.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    expect<any>(editorPage.browse.search.getMatchCount()).toBe(1);
    editorPage.browse.search.clearBtn.click();
  });

  it('check that word count is still correct in browse page', () => {
    expect(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    expect<any>(editorPage.browse.getEntryCount()).toBe(4);
  });

  it('remove new word to restore original word count', () => {
    editorPage.browse.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    editorPage.edit.actionMenu.click();
    editorPage.edit.deleteMenuItem.click();
    util.clickModalButton('Delete Entry');
    expect<any>(editorPage.edit.getEntryCount()).toBe(3);
  });

  it('previous entry is selected after delete', () => {
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });
});
