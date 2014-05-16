'use strict';

var constants   = require('../../../../testConstants');

var SfActivity = function() {
	// Get Activity feed
	this.getActivity = function() {
		this.activityURL = browser.baseUrl + '/app/activity';

		browser.driver.get(this.activityURL);
	}
};

describe('E2E testing: User Activity page', function() {
	var sfUserActivity = new SfActivity();
	var testText       = 'Chapter 3';
	var testQuestion   = 'Who is speaking?';
	var timestamp      = new Date();
	var newAnswerText  = 'Beethoven was the speaker.  ' + timestamp;
	var newCommentText = 'This comment is added in an E2E test';
	
	var SfLoginPage     = require('../../../pages/loginPage');
	var SfProjListPage  = require('../../../pages/projectsPage');
	var projectPage     = require('../../../pages/projectPage');
	var questionPage    = require('../../../pages/questionPage');
	var textPage        = require('../../../pages/textPage');

	var projectListPage = new SfProjListPage();
	
	var loginPage       = new SfLoginPage();
	loginPage.loginAsUser();
	
	it('should display user\'s activity', function() {

		// Perform some actions to populate the activity feed
		projectListPage.get();
		projectListPage.clickOnProject('test_project');
		projectPage.clickOnText(testText);
		textPage.clickOnQuestion(testQuestion);

		// Add your own answer to the end of the answers list
		questionPage.answers.add(newAnswerText);
		
		// Add your own comment to the end of the last answer
		questionPage.comments.addToLastAnswer(newCommentText);

		// Now check the activity feed
		sfUserActivity.getActivity();
		
		browser.debugger();
	});

});







