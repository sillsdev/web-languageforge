'use strict';

describe('Browse and edit page (DBE) Editor', function() {
  var constants    = require('../../../../testConstants');
  var loginPage    = require('../../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../../bellows/pages/projectsPage.js');
  var util         = require('../../../../bellows/pages/util.js');
  var dbePage      = require('../../pages/dbePage.js');
  var dbeUtil      = require('../../pages/dbeUtil.js');
  var configPage   = require('../../pages/configurationPage.js');
  var viewSettingsPage = require('../../pages/viewSettingsPage.js');

  it('setup: login, click on test project', function() {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
  });

  it('browse page has correct word count', function() {
    expect(dbePage.browse.entriesList.count()).toEqual(dbePage.browse.getEntryCount());
    expect(dbePage.browse.getEntryCount()).toBe(3);
  });

  it('search function works correctly', function() {
    dbePage.browse.search.input.sendKeys('asparagus');
    expect(dbePage.browse.search.getMatchCount()).toBe(1);
    dbePage.browse.search.clearBtn.click();
  });

  it('click on first word', function() {
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
  });

  it('edit page has correct word count', function() {
    expect(dbePage.edit.entriesList.count()).toEqual(dbePage.edit.getEntryCount());
    expect(dbePage.edit.getEntryCount()).toBe(3);
  });

  it('word 1: edit page has correct meaning, part of speech', function() {
    expect(dbePage.edit.getFieldValues('Meaning')).toEqual([
      {'en': constants.testEntry1.senses[0].definition.en.value}
    ]);
    expect(dbePage.edit.getFieldValues('Part of Speech')).toEqual([
      dbeUtil.expandPartOfSpeech(constants.testEntry1.senses[0].partOfSpeech.value)
    ]);
  });

  it('dictionary citation reflects lexeme form', function() {
    expect(dbePage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    expect(dbePage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    expect(dbePage.edit.renderedDiv.getText()).not.toContain('citation form');
  });
  
  it('add citation form as visible field', function() {
    configPage.get();
    configPage.getTabByName('Fields').click();
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Citation Form').click();
    util.setCheckbox(configPage.hiddenIfEmpty, false);
    configPage.applyButton.click();
    util.clickBreadcrumb(constants.testProjectName);
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
  });

  it('citation form field overrides lexeme form in dictionary citation view', function() {
    dbePage.edit.showUncommonFields();
    dbePage.edit.getMultiTextInputs('Citation Form').first().sendKeys('citation form');
    expect(dbePage.edit.renderedDiv.getText()).toContain('citation form');
    expect(dbePage.edit.renderedDiv.getText()).not.toContain(constants.testEntry1.lexeme.th.value);
    expect(dbePage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    dbePage.edit.getMultiTextInputs('Citation Form').first().clear();
    expect(dbePage.edit.renderedDiv.getText()).not.toContain('citation form');
    expect(dbePage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme.th.value);
    expect(dbePage.edit.renderedDiv.getText()).toContain(constants.testEntry1.lexeme['th-fonipa'].value);
    dbePage.edit.hideUncommonFields();
  });

  it('one picture and caption is present', function() {
    expect(dbePage.edit.pictures.getFileName(0)).toContain('_' + constants.testEntry1.senses[0].pictures[0].fileName);
    expect(dbePage.edit.pictures.getCaption(0)).toEqual({'en': constants.testEntry1.senses[0].pictures[0].caption.en.value});
  });
  
  it('file upload drop box is displayed when Add Picture is clicked', function() {
    expect(dbePage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    expect(dbePage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    expect(dbePage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);
    dbePage.edit.pictures.addPictureLink.click();
    expect(dbePage.edit.pictures.addPictureLink.isPresent()).toBe(false);
    expect(dbePage.edit.pictures.addDropBox.isDisplayed()).toBe(true);
  });

  it('file upload drop box is not displayed when Cancel Adding Picture is clicked', function() {
    expect(dbePage.edit.pictures.addCancelButton.isDisplayed()).toBe(true);
    dbePage.edit.pictures.addCancelButton.click();
    expect(dbePage.edit.pictures.addPictureLink.isPresent()).toBe(true);
    expect(dbePage.edit.pictures.addDropBox.isDisplayed()).toBe(false);
    expect(dbePage.edit.pictures.addCancelButton.isDisplayed()).toBe(false);
  });

  it('change config to show Pictures and hide captions', function() {
    configPage.get();
    configPage.getTabByName('Fields').click();
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Pictures').click();
    util.setCheckbox(configPage.hiddenIfEmpty, false);
    util.setCheckbox(configPage.captionHiddenIfEmpty(), true);
    configPage.applyButton.click();
  });

  it('caption is hidden when empty if "Hidden if empty" is set in config', function() {
    util.clickBreadcrumb(constants.testProjectName);
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    dbePage.edit.hideUncommonFields();
    expect(dbePage.edit.pictures.captions.first().isDisplayed()).toBe(true);
    dbePage.edit.pictures.captions.first().clear();
    expect(dbePage.edit.pictures.captions.first().isPresent()).toBe(false);
  });

  it('change config to show Pictures and show captions', function() {
    configPage.get();
    configPage.getTabByName('Fields').click();
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Pictures').click();
    util.setCheckbox(configPage.hiddenIfEmpty, false);
    util.setCheckbox(configPage.captionHiddenIfEmpty(), false);
    configPage.applyButton.click();
  });

  it('when caption is empty, it is visible if "Hidden if empty" is cleared in config', function() {
    util.clickBreadcrumb(constants.testProjectName);
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(dbePage.edit.pictures.captions.first().isDisplayed()).toBe(true);
  });

  it('picture is removed when Delete is clicked', function() {
    expect(dbePage.edit.pictures.images.first().isPresent()).toBe(true);
    expect(dbePage.edit.pictures.removeImages.first().isPresent()).toBe(true);
    dbePage.edit.pictures.removeImages.first().click();
    util.clickModalButton('Delete Picture');
    expect(dbePage.edit.pictures.images.first().isPresent()).toBe(false);
  });

  it('change config to hide Pictures and hide captions', function() {
    configPage.get();
    configPage.getTabByName('Fields').click();
    configPage.showAllFieldsButton.click();
    configPage.getFieldByName('Pictures').click();
    util.setCheckbox(configPage.hiddenIfEmpty, true);
    util.setCheckbox(configPage.captionHiddenIfEmpty(), true);
    configPage.applyButton.click();
  });

  it('while Show All Fields has not been clicked, Pictures field is hidden', function() {
    util.clickBreadcrumb(constants.testProjectName);
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(dbePage.edit.pictures.list.isPresent()).toBe(false);
    dbePage.edit.showUncommonFields();
    expect(dbePage.edit.pictures.list.isPresent()).toBe(true);
    dbePage.edit.hideUncommonFields();
    expect(dbePage.edit.pictures.list.isPresent()).toBe(false);
  });

  it('click on second word (found by definition)', function() {
    dbePage.edit.clickEntryByDefinition(constants.testEntry2.senses[0].definition.en.value);
  });

  it('word 2: edit page has correct meaning, part of speech', function() {
    expect(dbePage.edit.getFieldValues('Meaning')).toEqual([
      {'en': constants.testEntry2.senses[0].definition.en.value},
    ]);
    expect(dbePage.edit.getFieldValues('Part of Speech')).toEqual([
      dbeUtil.expandPartOfSpeech(constants.testEntry2.senses[0].partOfSpeech.value),
    ]);
  });

  it('setup: click on word with multiple meanings (found by lexeme)', function() {
    dbePage.edit.clickEntryByLexeme(constants.testMultipleMeaningEntry1.lexeme.th.value);
  });

  it('word with multiple meanings: edit page has correct meanings, parts of speech', function() {
    expect(dbePage.edit.getFieldValues('Meaning')).toEqual([
      {'en': constants.testMultipleMeaningEntry1.senses[0].definition.en.value},
      {'en': constants.testMultipleMeaningEntry1.senses[1].definition.en.value},
    ]);
    expect(dbePage.edit.getFieldValues('Part of Speech')).toEqual([
      dbeUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.value),
      dbeUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.value),
    ]);
  });

  it('word with multiple meanings: edit page has correct examples, translations', function() {
    expect(dbePage.edit.getFieldValues('Example')).toEqual([
      {'th': constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value},
      {'th': constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value},
      {'th': constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value},
      {'th': constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value},
    ]);
    expect(dbePage.edit.getFieldValues('Translation')).toEqual([
      {'en': constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value},
      {'en': constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value},
      {'en': constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value},
      {'en': constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value},
    ]);
  });

  it('while Show All Fields has not been clicked, uncommon fields are hidden if they are empty', function() {
    expect(dbePage.edit.getOneField('Semantics Note').isPresent()).toBe(false);
    expect(dbePage.edit.getOneField('General Note').isPresent()).toBe(true);
    dbePage.edit.showUncommonFields();
    expect(dbePage.edit.getOneField('Semantics Note').isPresent()).toBe(true);
    expect(dbePage.edit.getOneField('General Note').isPresent()).toBe(true);
  });

  it('word with multiple meanings: edit page has correct general notes, sources', function() {
    expect(dbePage.edit.getFieldValues('General Note')).toEqual([
      {'en': constants.testMultipleMeaningEntry1.senses[0].generalNote.en.value},
      {'en': constants.testMultipleMeaningEntry1.senses[1].generalNote.en.value},
    ]);
    // first item is empty Etymology Source, now that View Settings all default to visible. IJH 2015-03
    expect(dbePage.edit.getFieldValues('Source')).toEqual([
      {'en': ''},
      {'en': constants.testMultipleMeaningEntry1.senses[0].source.en.value},
      {'en': constants.testMultipleMeaningEntry1.senses[1].source.en.value},
    ]);
  });
  
  it('back to browse page, create new word', function() {
    dbePage.edit.toListLink.click();
    dbePage.browse.newWordBtn.click();
  });

  it('check that word count is still correct', function() {
    expect(dbePage.edit.entriesList.count()).toEqual(dbePage.edit.getEntryCount());
    expect(dbePage.edit.getEntryCount()).toBe(4);
  });

  it('create new word', function() {
    var word    = constants.testEntry3.lexeme.th.value;
    var meaning = constants.testEntry3.senses[0].definition.en.value;
    dbePage.edit.getMultiTextInputs('Word').first().sendKeys(word);
    dbePage.edit.getMultiTextInputs('Meaning').first().sendKeys(meaning);
    util.clickDropdownByValue(dbePage.edit.getOneField('Part of Speech').$('select'), 'Noun \\(n\\)');
    dbePage.edit.saveBtn.click();
  });

  it('new word is visible in edit page', function() {
    dbePage.edit.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    expect(dbePage.edit.search.getMatchCount()).toBe(1);
    dbePage.edit.search.clearBtn.click();
  });

    it('check that Semantic Domain field is visible (for view settings test later)', function() {
      expect(dbePage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
    });

  it('new word is visible in browse page', function() {
    dbePage.edit.toListLink.click();
    dbePage.browse.search.input.sendKeys(constants.testEntry3.senses[0].definition.en.value);
    expect(dbePage.browse.search.getMatchCount()).toBe(1);
    dbePage.browse.search.clearBtn.click();
  });

  it('check that word count is still correct in browse page', function() {
    expect(dbePage.browse.entriesList.count()).toEqual(dbePage.browse.getEntryCount());
    expect(dbePage.browse.getEntryCount()).toBe(4);
  });

});

