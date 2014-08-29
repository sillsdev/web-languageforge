'use strict';

describe('Browse and edit page (DBE)', function() {
	var constants    = require('../../../testConstants');
	var loginPage    = require('../../../bellows/pages/loginPage.js');
	var projectsPage = require('../../../bellows/pages/projectsPage.js');
	var dbePage      = require('../../pages/dbePage.js');
	var dbeUtil      = require('../../pages/dbeUtil.js');
	
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
		expect(dbePage.edit.getFieldsWithValues('Meaning')).toEqual([
			{'en': constants.testEntry1.senses[0].definition.en.value},
		]);
		expect(dbePage.edit.getFieldsWithValues('Part of Speech')).toEqual([
			dbeUtil.expandPartOfSpeech(constants.testEntry1.senses[0].partOfSpeech.value),
		]);
	});

	it('click on second word (found by definition)', function() {
		dbePage.edit.clickEntryByDefinition(constants.testEntry2.senses[0].definition.en.value);
	});

	it('word 2: edit page has correct meaning, part of speech', function() {
		expect(dbePage.edit.getFieldsWithValues('Meaning')).toEqual([
			{'en': constants.testEntry2.senses[0].definition.en.value},
		]);
		expect(dbePage.edit.getFieldsWithValues('Part of Speech')).toEqual([
			dbeUtil.expandPartOfSpeech(constants.testEntry2.senses[0].partOfSpeech.value),
		]);
	});

	it('setup: click on word with multiple meanings (found by lexeme)', function() {
		dbePage.edit.clickEntryByLexeme(constants.testMultipleMeaningEntry1.lexeme.th.value);
	});

	it('word with multiple meanings: edit page has correct meanings, parts of speech', function() {
		expect(dbePage.edit.getFieldsWithValues('Meaning')).toEqual([
			{'en': constants.testMultipleMeaningEntry1.senses[0].definition.en.value},
			{'en': constants.testMultipleMeaningEntry1.senses[1].definition.en.value},
		]);
		expect(dbePage.edit.getFieldsWithValues('Part of Speech')).toEqual([
			dbeUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[0].partOfSpeech.value),
			dbeUtil.expandPartOfSpeech(constants.testMultipleMeaningEntry1.senses[1].partOfSpeech.value),
		]);
	});

	it('word with multiple meanings: edit page has correct examples, translations', function() {
		expect(dbePage.edit.getFieldsWithValues('Example')).toEqual([
			{'th': constants.testMultipleMeaningEntry1.senses[0].examples[0].sentence.th.value},
			{'th': constants.testMultipleMeaningEntry1.senses[0].examples[1].sentence.th.value},
			{'th': constants.testMultipleMeaningEntry1.senses[1].examples[0].sentence.th.value},
			{'th': constants.testMultipleMeaningEntry1.senses[1].examples[1].sentence.th.value},
		]);
		expect(dbePage.edit.getFieldsWithValues('Translation')).toEqual([
			{'en': constants.testMultipleMeaningEntry1.senses[0].examples[0].translation.en.value},
			{'en': constants.testMultipleMeaningEntry1.senses[0].examples[1].translation.en.value},
			{'en': constants.testMultipleMeaningEntry1.senses[1].examples[0].translation.en.value},
			{'en': constants.testMultipleMeaningEntry1.senses[1].examples[1].translation.en.value},
		]);
	});
});
