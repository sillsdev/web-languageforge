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

		// Word 1
		dbePage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
		dbePage.edit.getLexemeByWsid('th').then(function(word) {
			expect(word).toBe(constants.testEntry1.lexeme.th.value);
		});
		dbePage.edit.getLexemeDivByWsid('th').then(function(elems) {
			if (elems.length > 0) { elems[0].$('input').getAttribute('value').then(console.log); }
		});
		dbePage.edit.getLexemeByWsid('thipa').then(function(lexeme) {
			console.log(lexeme);
		});
		expect(dbePage.edit.getLexemes()).toEqual([
			{ wsid: 'th'   , value: constants.testEntry1.lexeme.th.value },
			{ wsid: 'thipa', value: constants.testEntry1.lexeme['th-fonipa'].value },
		]);
		dbePage.edit.getLexemesAsObject().then(console.log);
		dbePage.edit.getFirstLexeme().then(console.log);
		
		// Back to list to check word 2
		dbePage.edit.toListLink.click();
		
		// Word 2
		dbePage.browse.clickEntryByLexeme(constants.testEntry2.lexeme.th.value);
		dbePage.edit.getLexemeByWsid('th').then(function(word) {
			expect(word).toBe(constants.testEntry2.lexeme.th.value);
		});
		dbePage.edit.getLexemeDivByWsid('th').then(function(elems) {
			if (elems.length > 0) { elems[0].$('input').getAttribute('value').then(console.log); }
		});
		dbePage.edit.getLexemeByWsid('thipa').then(function(lexeme) {
			console.log(lexeme);
		});
		expect(dbePage.edit.getLexemes()).toEqual([
			{ wsid: 'th'   , value: constants.testEntry2.lexeme.th.value },
			{ wsid: 'thipa', value: constants.testEntry2.lexeme['th-fonipa'].value },
		]);
		dbePage.edit.getLexemesAsObject().then(console.log);
		dbePage.edit.getFirstLexeme().then(console.log);
	});
});