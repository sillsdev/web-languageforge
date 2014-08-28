'use strict';

describe('E2E testing: sample LF test', function() {
	var constants    = require('../../../testConstants');
	var loginPage    = require('../../../bellows/pages/loginPage.js');
	var projectsPage = require('../../../bellows/pages/projectsPage.js');
	var dbePage      = require('../../pages/dbePage.js');
	var dbeUtil      = require('../../pages/dbeUtil.js');
	
	it('setup: login', function() {
		loginPage.loginAsManager();
	});
	it('clicking on browse page takes you to edit page for that word', function() {
		projectsPage.get();
		projectsPage.clickOnProject(constants.testProjectName);

		expect(dbePage.browse.entriesList.count()).toEqual(dbePage.browse.getEntryCount());
		expect(dbePage.browse.getEntryCount()).toBe(3);

		dbePage.browse.search.input.sendKeys('asparagus');
		expect(dbePage.browse.search.getMatchCount()).toBe(1);
		dbePage.browse.search.clearBtn.click();

		// Word 1
		dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
		dbePage.edit.getLexemeByWsid('th').then(function(word) {
			expect(word).toBe(constants.testEntry1.lexeme.th.value);
		});
		dbePage.edit.getLexemes().then(console.log);
//		dbePage.edit.getVisibleFieldsByLabel().then(function(fields) {
//			dbePage.dcOptionListToValue(fields['Part of Speech']).then(console.log);
//		});
		
		// Back to list to check word 2
		dbePage.edit.toListLink.click();
		
		// Word 2
		dbePage.browse.clickEntryByLexeme(constants.testEntry2.lexeme.th.value);
		dbePage.edit.getLexemeByWsid('th').then(function(word) {
			expect(word).toBe(constants.testEntry2.lexeme.th.value);
		});
//		dbePage.edit.getLabelsOfVisibleFields().then(console.log);
//		dbePage.edit.showUncommonFields();
//		dbePage.edit.getLabelsOfVisibleFields().then(console.log);
//		dbePage.edit.hideUncommonFields();
//		dbePage.edit.getLabelsOfVisibleFields().then(console.log);
		dbePage.edit.getVisibleFieldsAndValues().then(function(fields) {
			for (var key in fields) {
				console.log("Field", key, "has value:");
				fields[key].then(console.log);
			};
			expect(fields['Part of Speech']).toBe("Noun (n)");
		});
		dbePage.edit.renderedDiv.getText().then(function(text) {
			console.log('Rendered:', text);
		});
		
		// Back to list to check word 3
		dbePage.edit.toListLink.click();

		// Word 3 (multiple meaning entry 1)
		dbePage.browse.clickEntryByLexeme(constants.testMultipleMeaningEntry1.lexeme.th.value);

		var elems = dbeUtil.parseDcEntry(element(by.css("dc-entry")));
		elems.then(function(data) {
			data.senses.then(function(sensesData) {
				sensesData.forEach(function(sense) {
					sense.Meaning.then(function(meaning) {
						console.log('Meaning:', meaning);
					});
					sense['Part of Speech'].then(function(pos) {
						console.log('Part of Speech:', pos);
					});
					sense.examples.forEach(function(example) {
						example.Example.then(function(exampleText) {
							console.log('Example:', exampleText);
						});
						example.Translation.then(function(translationText) {
							console.log('Translation:', translationText);
						});
					});
				});
			});
		});
	});
});
