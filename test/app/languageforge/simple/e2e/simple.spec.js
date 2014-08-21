'use strict';

describe('E2E testing: pause for manual checking', function() {
	var constants    = require('../../../testConstants');
	var loginPage    = require('../../../bellows/pages/loginPage.js');
	var projectsPage = require('../../../bellows/pages/projectsPage.js');
	var dbePage      = require('../../pages/dbePage.js');
	
	it('setup: login', function() {
		loginPage.loginAsManager();
	});
	it('pause for manual testing', function() {
		projectsPage.get();
		projectsPage.clickOnProject(constants.testProjectName);
		dbePage.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
		
		browser.sleep(5000); // TODO: Do some verifying of the contents of this page
	});
});