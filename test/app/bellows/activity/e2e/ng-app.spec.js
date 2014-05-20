'use strict';

var constants    = require('../../../../testConstants');

var SfActivity = function() {

};

describe('E2E testing: User Activity page', function() {
	var sfUserActivity    = new SfActivity();
	
	var testProjectName   = 'test_project';
	var testText          = 'Chapter 3';
	var testQuestion      = 'Who is speaking?';

	// Script of actions to perform which will then be verified on the activity feed.
	// Currently, this list assumes normal user is doing the actions on his own contributions
	var script = [
		{scope: 'answers',  action: 'add',              value: 'Beethoven was the speaker.'},
		/*
		{scope: 'comments', action: 'addToLastAnswer',  value: 'This comment is added in an E2E test.'},
		/* TODO: add these actions 2014-05 DDW
		{scope: 'comments', action: 'edit',             value: 'This is an edited comment for the E2E test.'},
		{scope: 'answers',  action: 'edit',             value: 'Mozart was also the speaker.' + new Date()},
		{scope: 'answers',  action: 'upvote',           value: ''},
		{scope: 'comments', action: 'archive',          value: ''},
		{scope: 'answers',  action: 'archive',          value: ''}
		*/
	];
	
	var activityPage    = require('../../../pages/activityPage');
	var projectListPage = require('../../../pages/projectsPage');
	var projectPage     = require('../../../pages/projectPage');
	var questionPage    = require('../../../pages/questionPage');
	var textPage        = require('../../../pages/textPage');
	var loginPage       = require('../../../pages/loginPage');

	loginPage.loginAsUser();
	
	it('should perform some actions to populate the activity feed', function() {

		// Perform the following actions to populate the activity feed
		
		// Navigate to the Test Project -> Text -> Question
		projectListPage.get();
		projectListPage.clickOnProject(testProjectName);
		projectPage.clickOnText(testText);
		textPage.clickOnQuestion(testQuestion);

		// Evaluate the script actions
		for (var i=0; i<script.length; i++) {
			// Append timestamp for answer actions
			if (script[i].scope == 'answers') {
				script[i].value = script[i].value + new Date();
			}

			questionPage[script[i].scope][script[i].action](script[i].value);
		};

		console.log('Script has ' + script.length + ' actions');

	});
	
	it ('should verify user actions appear on the activity page', function() {
		// Now check the activity feed.  Current items are at the head
		// of the activity feed so traverse the script in reverse order
		activityPage.get();

		//activityPage.printActivitiesNames();
		
		activityPage.getLength().then(function(len) {

			var scriptIndex = script.length - 1;
			var activityIndex = 0;
			
			while (scriptIndex >= 0) {
				// Archive actions are not in the activity feed
				if (script[scriptIndex].action == 'archive') {
					scriptIndex--;
					console.log('skipping archive action');
					continue;
				}
				var activityString = activityPage.getActivity(activityIndex);
					 
					// Expect activity string to contain username, script scope, action, and value
					//expect(activityString).toContain(constants.memberUsername);
					//expect(activityString).toContain(script[scriptIndex].scope);
					//expect(activityString).toContain(script[scriptIndex].action);
					//expect(activityString).toContain(script[scriptIndex].value);
				scriptIndex--;
				activityIndex++;
				
			};
		});


		//browser.debugger();
	});

});







