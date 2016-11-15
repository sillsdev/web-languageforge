'use strict';

describe('Editor List and Entry', function () {
  var constants    = require('../../../../testConstants');
  var loginPage    = require('../../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../../bellows/pages/projectsPage.js');
  var util         = require('../../../../bellows/pages/util.js');
  var editorPage       = require('../../pages/editorPage.js');
  var editorUtil       = require('../../pages/editorUtil.js');
  var configPage       = require('../../pages/configurationPage.js');
  var viewSettingsPage = require('../../pages/viewSettingsPage.js');

  it('setup: login, click on test project', function () {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', function () {
    expect(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    expect(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('search function works correctly', function () {
    editorPage.browse.search.input.sendKeys('asparagus');
    expect(editorPage.browse.search.getMatchCount()).toBe(1);
    editorPage.browse.search.clearBtn.click();
  });

  it('refresh returns to list view', function () {
    browser.refresh();
    expect(editorPage.browse.getEntryCount()).toBe(3);
  });

  it('click on first word', function () {
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('refresh returns to entry view', function () {
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    browser.refresh();
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('edit page has correct word count', function () {
    expect(editorPage.edit.entriesList.count()).toEqual(editorPage.edit.getEntryCount());
    expect(editorPage.edit.getEntryCount()).toBe(3);
  });

  it('word 1: edit page has correct meaning, part of speech', function () {
    // Empty array elements are a work-around for getFieldValues after SemDom directive added. IJH
    expect(editorPage.edit.getFieldValues('Meaning')).toEqual([
      { en: constants.testEntry1.senses[0].definition.en.value }, ''
    ]);
    expect(editorPage.edit.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testEntry1.senses[0].partOfSpeech.value)
    ]);
  });

  it('dictionary citation reflects lexeme form', function () {
    expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.renderedDiv.getText())
      .toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    expect(editorPage.edit.renderedDiv.getText()).not.toContain('citation form');
  });

  it('add citation form as visible field', function () {
    configPage.get();
    configPage.getTabByName('Fields').click();
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Citation Form').click();
    util.setCheckbox(configPage.hiddenIfEmpty, false);
    configPage.applyButton.click();
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('citation form field overrides lexeme form in dictionary citation view', function () {
    editorPage.edit.showUncommonFields();
    var citationFormMultiTextInputs = editorPage.edit.getMultiTextInputs('Citation Form');
    editorPage.edit.selectElement.sendKeys(citationFormMultiTextInputs.first(), 'citation form');
    expect(editorPage.edit.renderedDiv.getText()).toContain('citation form');
    expect(editorPage.edit.renderedDiv.getText())
      .not.toContain(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.renderedDiv.getText())
      .toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    editorPage.edit.selectElement.clear(citationFormMultiTextInputs.first());
    expect(editorPage.edit.renderedDiv.getText()).not.toContain('citation form');
    expect(editorPage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.renderedDiv.getText())
      .toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    editorPage.edit.hideUncommonFields();
  });

  it('one picture and caption is present', function () {
    expect(editorPage.edit.pictures.getFileName(0))
      .toContain('_' + constants.testEntry1.senses[0].pictures[0].fileName);
    expect(editorPage.edit.pictures.getCaption(0))
      .toEqual({ en: constants.testEntry1.senses[0].pictures[0].caption.en.value });
  });

  it('file upload drop box is displayed when Add Picture is clicked', function () {
    expect(editorPage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    expect(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    expect(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);
    editorPage.edit.pictures.addPictureLink.click();
    expect(editorPage.edit.pictures.addPictureLink.isPresent()).toBe(false);
    expect(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Adding Picture is clicked', function () {
    expect(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(true);
    editorPage.edit.pictures.addCancelButton.click();
    expect(editorPage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    expect(editorPage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    expect(editorPage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);
  });

  it('change config to show Pictures and hide captions', function () {
    configPage.get();
    configPage.getTabByName('Fields').click();
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Pictures').click();
    util.setCheckbox(configPage.hiddenIfEmpty, false);
    util.setCheckbox(configPage.captionHiddenIfEmpty(), true);
    configPage.applyButton.click();
  });

  it('caption is hidden when empty if "Hidden if empty" is set in config', function () {
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    editorPage.edit.hideUncommonFields();
    expect(editorPage.edit.pictures.captions.first().isDisplayed()).toBe(true);
    editorPage.edit.selectElement.clear(editorPage.edit.pictures.captions.first());
    expect(editorPage.edit.pictures.captions.count()).toBe(0);
  });

  it('change config to show Pictures and show captions', function () {
    configPage.get();
    configPage.getTabByName('Fields').click();
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Pictures').click();
    util.setCheckbox(configPage.hiddenIfEmpty, false);
    util.setCheckbox(configPage.captionHiddenIfEmpty(), false);
    configPage.applyButton.click();
  });

  it('when caption is empty, it is visible if "Hidden if empty" is cleared in config', function () {
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect(editorPage.edit.pictures.captions.first().isDisplayed()).toBe(true);
  });

  it('picture is removed when Delete is clicked', function () {
    expect(editorPage.edit.pictures.images.first().isPresent()).toBe(true);
    expect(editorPage.edit.pictures.removeImages.first().isPresent()).toBe(true);
    editorPage.edit.pictures.removeImages.first().click();
    util.clickModalButton('Delete Picture');
    expect(editorPage.edit.pictures.images.count()).toBe(0);
  });

  it('change config to hide Pictures and hide captions', function () {
    configPage.get();
    configPage.getTabByName('Fields').click();
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Pictures').click();
    util.setCheckbox(configPage.hiddenIfEmpty, true);
    util.setCheckbox(configPage.captionHiddenIfEmpty(), true);
    configPage.applyButton.click();
  });

  it('while Show All Fields has not been clicked, Pictures field is hidden', function () {
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect(editorPage.edit.getFields('Pictures').count()).toBe(0);
    editorPage.edit.showUncommonFields();
    expect(editorPage.edit.pictures.list.isPresent()).toBe(true);
    editorPage.edit.hideUncommonFields();
    expect(editorPage.edit.getFields('Pictures').count()).toBe(0);
  });

  it('audio Input System is present, playable and has "more" control (manager)', function () {
    expect(editorPage.edit.audio.playerIcons('Word').count()).toEqual(1);
    expect(editorPage.edit.audio.playerIcons('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.playerIcons('Word').first().getAttribute('class'))
      .toContain('fa-play');
    expect(editorPage.edit.audio.players('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.players('Word').first().isEnabled()).toBe(true);
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.moreControls('Word').first().isEnabled()).toBe(true);
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.downloadButtons('Word').first().isDisplayed()).toBe(false);
  });

  it('file upload drop box is displayed when Upload is clicked', function () {
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.uploadDropBoxes('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadCancelButtons('Word').first().isDisplayed()).toBe(false);
    editorPage.edit.audio.moreControls('Word').first().click();
    editorPage.edit.audio.moreUpload('Word', 0).click();
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadDropBoxes('Word').first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Uploading Audio is clicked', function () {
    expect(editorPage.edit.audio.uploadCancelButtons('Word').first().isDisplayed()).toBe(true);
    editorPage.edit.audio.uploadCancelButtons('Word').first().click();
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.uploadDropBoxes('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadCancelButtons('Word').first().isDisplayed()).toBe(false);
  });

  it('click on second word (found by definition)', function () {
    editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value)
      .click();
  });

  it('word 2: audio Input System is not playable but has "upload" button (manager)', function () {
    expect(editorPage.edit.audio.playerIcons('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.players('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.uploadButtons('Word').first().isEnabled()).toBe(true);
    expect(editorPage.edit.audio.downloadButtons('Word').first().isDisplayed()).toBe(false);
  });

  it('login as member, click on first word', function () {
    loginPage.loginAsMember();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('audio Input System is present, playable and has "more" control (member)', function () {
    expect(editorPage.edit.audio.playerIcons('Word').count()).toEqual(1);
    expect(editorPage.edit.audio.playerIcons('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.playerIcons('Word').first().getAttribute('class'))
      .toContain('fa-play');
    expect(editorPage.edit.audio.players('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.players('Word').first().isEnabled()).toBe(true);
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.moreControls('Word').first().isEnabled()).toBe(true);
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.downloadButtons('Word').first().isDisplayed()).toBe(false);
  });

  it('click on second word (found by definition)', function () {
    editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value)
      .click();
  });

  it('word 2: audio Input System is not playable but has "upload" button (member)', function () {
    expect(editorPage.edit.audio.playerIcons('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.players('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.uploadButtons('Word').first().isEnabled()).toBe(true);
    expect(editorPage.edit.audio.downloadButtons('Word').first().isDisplayed()).toBe(false);
  });

  it('login as observer, click on first word', function () {
    loginPage.loginAsObserver();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('audio Input System is playable but does not have "more" control (observer)', function () {
    expect(editorPage.edit.audio.playerIcons('Word').count()).toEqual(1);
    expect(editorPage.edit.audio.playerIcons('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.playerIcons('Word').first().getAttribute('class'))
      .toContain('fa-play');
    expect(editorPage.edit.audio.players('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.players('Word').first().isEnabled()).toBe(true);
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.downloadButtons('Word').first().isDisplayed()).toBe(true);
  });

  it('click on second word (found by definition)', function () {
    editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value)
      .click();
  });

  it('word 2: audio Input System is not playable and does not have "upload" button (observer)',
    function () {
      expect(editorPage.edit.audio.playerIcons('Word').first().isDisplayed()).toBe(false);
      expect(editorPage.edit.audio.players('Word').first().isDisplayed()).toBe(false);
      expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(false);
      expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(false);
      expect(editorPage.edit.audio.downloadButtons('Word').first().isDisplayed()).toBe(false);
    });

  it('login as manager, click on first word', function () {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
  });

  it('can delete audio Input System', function () {
    expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(true);
    editorPage.edit.audio.moreControls('Word').first().click();
    editorPage.edit.audio.moreDelete('Word', 0).click();
    util.clickModalButton('Delete Audio');
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is displayed when Upload is clicked', function () {
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.uploadDropBoxes('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadCancelButtons('Word').first().isDisplayed()).toBe(false);
    editorPage.edit.audio.uploadButtons('Word').first().click();
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadDropBoxes('Word').first().isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Uploading Audio is clicked', function () {
    expect(editorPage.edit.audio.uploadCancelButtons('Word').first().isDisplayed()).toBe(true);
    editorPage.edit.audio.uploadCancelButtons('Word').first().click();
    expect(editorPage.edit.audio.uploadButtons('Word').first().isDisplayed()).toBe(true);
    expect(editorPage.edit.audio.uploadDropBoxes('Word').first().isDisplayed()).toBe(false);
    expect(editorPage.edit.audio.uploadCancelButtons('Word').first().isDisplayed()).toBe(false);
  });

  describe('Mock file upload', function () {

    it('can\'t upload a non-audio file', function () {
      expect(editorPage.noticeList.count()).toBe(0);
      editorPage.edit.audio.uploadButtons('Word').first().click();
      editorPage.edit.audio.control('Word', 0).mockUpload.enableButton.click();
      expect(editorPage.edit.audio.control('Word', 0).mockUpload.fileNameInput.isDisplayed())
        .toBe(true);
      editorPage.edit.audio.control('Word', 0).mockUpload.fileNameInput
        .sendKeys(constants.testMockPngUploadFile.name);
      editorPage.edit.audio.control('Word', 0).mockUpload.fileSizeInput
        .sendKeys(constants.testMockPngUploadFile.size);
      editorPage.edit.audio.control('Word', 0).mockUpload.uploadButton.click();
      expect(editorPage.noticeList.count()).toBe(1);
      expect(editorPage.noticeList.first().getText())
        .toContain(constants.testMockPngUploadFile.name +
          ' is not an allowed audio file. Ensure the file is');
      expect(editorPage.edit.audio.uploadDropBoxes('Word').first().isDisplayed()).toBe(true);
      editorPage.edit.audio.control('Word', 0).mockUpload.fileNameInput.clear();
      editorPage.edit.audio.control('Word', 0).mockUpload.fileSizeInput.clear();
      editorPage.firstNoticeCloseButton.click();
    });

    it('can upload an audio file', function () {
      expect(editorPage.noticeList.count()).toBe(0);
      editorPage.edit.audio.control('Word', 0).mockUpload.fileNameInput
        .sendKeys(constants.testMockMp3UploadFile.name);
      editorPage.edit.audio.control('Word', 0).mockUpload.fileSizeInput
        .sendKeys(constants.testMockMp3UploadFile.size);
      editorPage.edit.audio.control('Word', 0).mockUpload.uploadButton.click();
      editorPage.edit.audio.control('Word', 0).mockUpload.enableButton.click();
      expect(editorPage.noticeList.count()).toBe(1);
      expect(editorPage.noticeList.first().getText()).toContain('File uploaded successfully');
      expect(editorPage.edit.audio.playerIcons('Word').first().isDisplayed()).toBe(true);
      expect(editorPage.edit.audio.playerIcons('Word').first().getAttribute('class'))
        .toContain('fa-play');
      expect(editorPage.edit.audio.players('Word').first().isDisplayed()).toBe(true);
      expect(editorPage.edit.audio.players('Word').first().isEnabled()).toBe(true);
      expect(editorPage.edit.audio.moreControls('Word').first().isDisplayed()).toBe(true);
    });

  });

  it('click on second word (found by definition)', function () {
    editorPage.edit.findEntryByDefinition(constants.testEntry2.senses[0].definition.en.value)
      .click();
  });

  it('word 2: edit page has correct meaning, part of speech', function () {
    // Empty array elements are a work-around for getFieldValues after SemDom directive added. IJH
    expect(editorPage.edit.getFieldValues('Meaning')).toEqual([
      { en: constants.testEntry2.senses[0].definition.en.value }, ''
    ]);
    expect(editorPage.edit.getFieldValues('Part of Speech')).toEqual([
      editorUtil.expandPartOfSpeech(constants.testEntry2.senses[0].partOfSpeech.value)
    ]);
  });

  it('setup: click on word with multiple meanings (found by lexeme)', function () {
    editorPage.edit.findEntryByLexeme(constants.testMultipleMeaningEntry1.lexeme.th.value).click();
    editorPage.edit.senses.first().click();
  });

  it('word with multiple meanings: edit page has correct meanings, parts of speech', function () {
    // Empty array elements are a work-around for getFieldValues after SemDom directive added. IJH
    expect(editorPage.edit.getFieldValues('Meaning')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].definition.en.value }, '',
      { en: constants.testMultipleMeaningEntry1.senses[1].definition.en.value }, ''
    ]);
    expect(editorPage.edit.getFieldValues('Part of Speech')).toEqual([
      editorUtil
        .expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.value),
      editorUtil
        .expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.value)
    ]);
  });

  it('word with multiple meanings: edit page has correct examples, translations', function () {
    expect(editorPage.edit.getFieldValues('Example')).toEqual([
      { th: constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value },
      { th: constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value }
    ]);
    expect(editorPage.edit.getFieldValues('Translation')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value }
    ]);
  });

  it('while Show All Fields has not been clicked, uncommon fields are hidden if they are empty',
  function () {
    expect(editorPage.edit.getFields('Semantics Note').count()).toBe(0);
    expect(editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
    editorPage.edit.showUncommonFields();
    expect(editorPage.edit.getOneField('Semantics Note').isPresent()).toBe(true);
    expect(editorPage.edit.getOneField('General Note').isPresent()).toBe(true);
  });

  it('word with multiple meanings: edit page has correct general notes, sources', function () {
    expect(editorPage.edit.getFieldValues('General Note')).toEqual([
      { en: constants.testMultipleMeaningEntry1.senses[0].generalNote.en.value },
      { en: constants.testMultipleMeaningEntry1.senses[1].generalNote.en.value }
    ]);

    // First item is empty Etymology Source, now that View Settings all default to visible. IJH
    // Empty array elements are a work-around for getFieldValues after SemDom directive added. IJH
    expect(editorPage.edit.getFieldValues('Source')).toEqual([
      { en: '' }, '',
      { en: constants.testMultipleMeaningEntry1.senses[0].source.en.value }, '',
      { en: constants.testMultipleMeaningEntry1.senses[1].source.en.value }
    ]);
  });

  it('back to browse page, create new word', function () {
    editorPage.edit.toListLink.click();
    editorPage.browse.newWordBtn.click();
  });

  it('check that word count is still correct', function () {
    expect(editorPage.edit.entriesList.count()).toEqual(editorPage.edit.getEntryCount());
    expect(editorPage.edit.getEntryCount()).toEqual(4);
  });

  it('modify new word', function () {
    var word    = constants.testEntry3.lexeme.th.value;
    var meaning = constants.testEntry3.senses[0].definition.en.value;
    editorPage.edit.getMultiTextInputs('Word').first().sendKeys(word);
    editorPage.edit.getMultiTextInputs('Meaning').first().sendKeys(meaning);
    util.clickDropdownByValue(editorPage.edit.getOneField('Part of Speech').$('select'),
      'Noun \\(n\\)');
    editorPage.edit.saveBtn.click();
  });

  it('new word is visible in edit page', function () {
    editorPage.edit.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    expect(editorPage.edit.search.getMatchCount()).toBe(1);
    editorPage.edit.search.clearBtn.click();
  });

  it('check that Semantic Domain field is visible (for view settings test later)', function () {
      expect(editorPage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
    });

  describe('Dictionary Configuration check', function () {

    it('Word has only "th", "tipa" and "taud" visible', function () {
      expect(editorPage.edit.getMultiTextInputSystems('Word').count()).toEqual(3);
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(0).getText()).toEqual('th');
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(1).getText()).toEqual('tipa');
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(2).getText()).toEqual('taud');
    });

    it('make "en" input system visible for "Word" field', function () {
      configPage.get();
      configPage.getTabByName('Fields').click();
      configPage.getFieldByName('Word').click();
      expect(configPage.fieldsTab.inputSystemTags.get(3).getText()).toEqual('en');
      util.setCheckbox(configPage.fieldsTab.inputSystemCheckboxes.get(3), true);
      configPage.applyButton.click();
      util.clickBreadcrumb(constants.testProjectName);
      editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    });

    it('Word has "th", "tipa", "taud" and "en" visible', function () {
      expect(editorPage.edit.getMultiTextInputSystems('Word').count()).toEqual(4);
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(0).getText()).toEqual('th');
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(1).getText()).toEqual('tipa');
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(2).getText()).toEqual('taud');
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(3).getText()).toEqual('en');
    });

    it('make "en" input system invisible for "Word" field', function () {
      configPage.get();
      configPage.getTabByName('Fields').click();
      configPage.getFieldByName('Word').click();
      expect(configPage.fieldsTab.inputSystemTags.get(3).getText()).toEqual('en');
      util.setCheckbox(configPage.fieldsTab.inputSystemCheckboxes.get(3), false);
      configPage.applyButton.click();
      util.clickBreadcrumb(constants.testProjectName);
      editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    });

    it('Word has only "th", "tipa" and "taud" visible', function () {
      expect(editorPage.edit.getMultiTextInputSystems('Word').count()).toEqual(3);
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(0).getText()).toEqual('th');
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(1).getText()).toEqual('tipa');
      expect(editorPage.edit.getMultiTextInputSystems('Word').get(2).getText()).toEqual('taud');
    });

  });

  it('first entry is selected if entryId unknown', function () {
    editorPage.edit.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    editorPage.getProjectIdFromUrl().then(function (projectId) {
      editorPage.get(projectId, '_unknown_id_1234');
    });

    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('URL entry id changes with entry', function () {
    var entry1Id = editorPage.getEntryIdFromUrl();
    expect(entry1Id).toMatch(/[0-9a-z_]{6,24}/);
    editorPage.edit.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry3.lexeme.th.value);
    var entry3Id = editorPage.getEntryIdFromUrl();
    expect(entry3Id).toMatch(/[0-9a-z_]{6,24}/);
    expect(entry1Id).not.toEqual(entry3Id);
    editorPage.edit.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
    expect(editorPage.getEntryIdFromUrl()).not.toEqual(entry3Id);
  });

  it('new word is visible in browse page', function () {
    editorPage.edit.toListLink.click();
    editorPage.browse.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    expect(editorPage.browse.search.getMatchCount()).toBe(1);
    editorPage.browse.search.clearBtn.click();
  });

  it('check that word count is still correct in browse page', function () {
    expect(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
    expect(editorPage.browse.getEntryCount()).toBe(4);
  });

  it('remove new word to restore original word count', function () {
    editorPage.browse.findEntryByLexeme(constants.testEntry3.lexeme.th.value).click();
    editorPage.edit.deleteBtn.click();
    util.clickModalButton('Delete Entry');
    expect(editorPage.edit.getEntryCount()).toBe(3);
  });

  it('previous entry is selected after delete', function () {
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });
});
