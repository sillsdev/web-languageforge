'use strict';

describe('Browse and edit page (DBE)', function() {
  var constants    = require('../../../testConstants');
  var loginPage    = require('../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../bellows/pages/projectsPage.js');
  var util         = require('../../../bellows/pages/util.js');
  var dbePage      = require('../../pages/dbePage.js');
  var dbeUtil      = require('../../pages/dbeUtil.js');
  var configPage   = require('../../pages/configurationPage.js');

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
    expect(dbePage.edit.pictures.captions.first().isDisplayed()).toBe(false);
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
    expect(dbePage.edit.getFieldValues('Source')).toEqual([
      {'en': ''}, // Searching for "Source" also matches "Etymology Source", which is empty
      {'en': constants.testMultipleMeaningEntry1.senses[0].source.en.value},
      {'en': constants.testMultipleMeaningEntry1.senses[1].source.en.value},
    ]);
  });

  it('switch to comments page, add one comment', function() {
    dbePage.edit.toCommentsLink.click();
    dbePage.comment.newComment.textarea.sendKeys('First comment on this word.');
    dbePage.comment.newComment.postBtn.click();
  });

  it('comments page: check that comment shows up', function() {
    var comment = dbePage.comment.getComment(0);
    expect(comment.wholeComment.isPresent()).toBe(true);
    // Earlier tests modify the avatar and name of the manager user; don't check those
    //expect(comment.avatar.getAttribute('src')).toContain(constants.avatar);
    //expect(comment.author.getText()).toEqual(constants.managerName);
    expect(comment.date.getText()).toContain('ago');
    expect(comment.score.getText()).toEqual('0');
    expect(comment.plusOne.isPresent()).toBe(true);
    expect(comment.content.getText()).toEqual('First comment on this word.');
    // This comment should have no "regarding" section
    expect(comment.regarding.fieldLabel.isDisplayed()).toBe(false);
  });

  it('comments page: add comment about a specific part of the entry', function() {
    dbePage.comment.newComment.textarea.clear();
    dbePage.comment.newComment.textarea.sendKeys('Second comment.');
    dbePage.comment.entry.getOneField('Word').then(function(elem) {
      elem.$$('span.wsid').first().click();
    });
    dbePage.comment.newComment.postBtn.click();
  });

  it('comments page: check that second comment shows up', function() {
    var comment = dbePage.comment.getComment(-1);
    expect(comment.wholeComment.isPresent()).toBe(true);
    // Earlier tests modify the avatar and name of the manager user; don't check those
    //expect(comment.avatar.getAttribute('src')).toContain(constants.avatar);
    //expect(comment.author.getText()).toEqual(constants.managerName);
    expect(comment.date.getText()).toContain('ago');
    expect(comment.score.getText()).toEqual('0');
    expect(comment.plusOne.isPresent()).toBe(true);
    expect(comment.content.getText()).toEqual('Second comment.');
    // This comment should have a "regarding" section
    expect(comment.regarding.fieldLabel.isDisplayed()).toBe(true);
    var word    = constants.testMultipleMeaningEntry1.lexeme.th.value;
    var meaning = constants.testMultipleMeaningEntry1.senses[0].definition.en.value;
    expect(comment.regarding.word.getText()).toEqual(word);
    expect(comment.regarding.meaning.getText()).toEqual(meaning);
    expect(comment.regarding.fieldLabel.getText()).toEqual('Word');
    expect(comment.regarding.fieldWsid .getText()).toEqual('th');
    expect(comment.regarding.fieldValue.getText()).toEqual(word);
  });

  it('comments page: click +1 button on first comment', function() {
    var comment = dbePage.comment.getComment(0);
    expect(comment.plusOne.getAttribute('ng-click')).not.toBe(null); // Should be clickable
    comment.plusOne.click();
    expect(comment.score.getText()).toEqual('1');
  });

  it('comments page: +1 button disabled after clicking', function() {
    var comment = dbePage.comment.getComment(0);
    expect(comment.plusOne.getAttribute('ng-click')).toBe(null); // Should NOT be clickable
    comment.plusOne.click();
    expect(comment.score.getText()).toEqual('1'); // Should not change from previous test
  });

  it('back to browse page, create new word', function() {
    dbePage.comment.toEditLink.click();
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
    // TODO: Figure out a good page-object API for entering values in these fields; this is a bit clunky.
    dbePage.edit.getOneField('Word').$$('input').first().sendKeys(word);
    dbePage.edit.getOneField('Meaning').$('input').sendKeys(meaning);
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

describe('View settings page', function() {
  var constants    = require('../../../testConstants');
  var loginPage    = require('../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../bellows/pages/projectsPage.js');
  var util         = require('../../../bellows/pages/util.js');
  var dbePage      = require('../../pages/dbePage.js');
  var dbeUtil      = require('../../pages/dbeUtil.js');
  var viewSettingsPage = require('../../pages/viewSettingsPage.js');
  it('setup: check that DBE tests have just been run', function() {
    expect(dbePage.browse.getEntryCount()).toBe(4);
  });

  it('setup: go to the View Settings page', function() {
    viewSettingsPage.get();
  });

  it('setup: click Manager tab', function() {
    viewSettingsPage.clickTabByName('Manager');
  });

  it('Hide Semantic Domain field for Manager', function() {
    var vsp = viewSettingsPage;
    // Eye icon should be present iff "Show field" is checked for that field
    vsp.getFieldByName('Semantic Domain').then(function(elem) {
      var icon = elem.$('i');
      expect(icon.getAttribute('class')).toMatch('icon-eye-open');
    });
    vsp.clickFieldByName('Semantic Domain');
    util.setCheckbox(vsp.showField, false);
    vsp.getFieldByName('Semantic Domain').then(function(elem) {
      var icon = elem.$('i');
      expect(icon.getAttribute('class')).not.toMatch('icon-eye-open');
    });
    vsp.applyBtn.click();
  });

  it('Hide Semantic Domain field for specific username of admin user', function() {
    var vsp = viewSettingsPage;
    vsp.clickTabByName('Member Specific');
    vsp.addViewSettingsForMember(constants.adminUsername);
    vsp.pickMemberWithViewSettings(constants.adminUsername);
    expect(vsp.accordionEnabledFields.getText()).toEqual(
        'Enabled Fields for ' + constants.adminName + ' (' + constants.adminUsername + ')'
    );
    vsp.clickFieldByName('Semantic Domain');
    util.setCheckbox(vsp.showField, false);
    vsp.applyBtn.click();
  });

  it('Semantic Domain field is hidden for Manager', function() {
    util.clickBreadcrumb(constants.testProjectName);
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(dbePage.edit.getOneField('Semantic Domain').isPresent()).toBeFalsy();
  });

  it('Semantic Domain field is visible for Member', function() {
    loginPage.loginAsMember();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(dbePage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
  });

  it('Semantic Domain field is hidden for admin user', function() {
    loginPage.loginAsAdmin();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(dbePage.edit.getOneField('Semantic Domain').isPresent()).toBeFalsy();
  });

  it('Return view settings to normal before next test', function() {
    var vsp = viewSettingsPage;
    vsp.get();
    vsp.clickTabByName('Member Specific');
    vsp.pickMemberWithViewSettings(constants.adminUsername);
    expect(vsp.accordionEnabledFields.getText()).toEqual(
        'Enabled Fields for ' + constants.adminName + ' (' + constants.adminUsername + ')'
    );
    vsp.clickFieldByName('Semantic Domain');
    util.setCheckbox(vsp.showField, true);
    vsp.applyBtn.click();
    vsp.clickTabByName('Manager');
    vsp.clickFieldByName('Semantic Domain');
    util.setCheckbox(vsp.showField, true);
    vsp.applyBtn.click();
  });
});
