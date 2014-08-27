'use strict';

describe('E2E testing: sample LF test', function() {
	var constants    = require('../../../testConstants');
	var loginPage    = require('../../../bellows/pages/loginPage.js');
	var projectsPage = require('../../../bellows/pages/projectsPage.js');
	var dbePage      = require('../../pages/dbePage.js');
	
	it('setup: login', function() {
		loginPage.loginAsManager();
	});
	it('clicking on browse page takes you to edit page for that word', function() {
		projectsPage.get();
		projectsPage.clickOnProject(constants.testProjectName);

		expect(dbePage.browse.entriesList.count()).toEqual(dbePage.browse.getEntryCount());
		expect(dbePage.browse.getEntryCount()).toBe(2);

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
	});
});
