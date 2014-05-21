'use strict';

var constants    = require('../../../../testConstants');

var SfActivity = function() {

};

describe('E2E testing: User Activity page', function() {
	var sfUserActivity    = new SfActivity();
	
	var testText          = 'Chapter 3';
	var testQuestion      = 'Who is speaking?';

	// Script of actions to perform which will then be verified on the activity feed.
	// Currently, this list assumes normal user is doing the actions on his own contributions
	// scope options:  {'answers', 'comments'}
	// action options: {'add', 'addToLastAnswer', 'edit', 'upvote', 'archive'}
	// value: free text
	var script = [
		{scope: 'answers',  action: 'add',              value: 'Beethoven was the speaker.'},
		{scope: 'comments', action: 'addToLastAnswer',  value: 'This is an original comment.'},/**/
		{scope: 'comments', action: 'edit',             value: 'This is an edited comment for the E2E test.'},
		{scope: 'answers',  action: 'edit',             value: 'Mozart was also the speaker.'},
		/* TODO: add these actions 2014-05 DDW */
/*		{scope: 'answers',  action: 'upvote',           value: ''},
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
		projectListPage.clickOnProject(constants.testProjectName);
		projectPage.clickOnText(testText);
		textPage.clickOnQuestion(testQuestion);

		// Evaluate the script actions
		for (var i=0; i<script.length; i++) {
			// Append timestamp for answer actions
			if (script[i].scope == 'answers') {
				script[i].value = script[i].value + new Date();
			}
			
			//console.log('Scope: ' + script[i].scope + ' Action: ' + script[i].action);
			questionPage[script[i].scope][script[i].action](script[i].value);
			browser.debugger();
		};

		// Debug statement to check script actions
		//console.log('Script has ' + script.length + ' actions');

	});
	
	it ('should verify user actions appear on the activity page', function() {
		// Now check the activity feed.  Current items are at the head
		// of the activity feed so traverse the script in reverse order
		activityPage.get();

		// Print everything in the activity list for debugging purposes
		//activityPage.printActivitiesNames();

		var scriptIndex = script.length - 1;
		var activityIndex = 0;
		var activityText = '';
		
		while (scriptIndex >= 0) {
			// Archive actions are not in the activity feed
			if (script[scriptIndex].action == 'archive') {
				scriptIndex--;
				console.log('skipping archive action');
				continue;
			}

			// Expect activity text to contain username, script scope, action, and value
			activityText = activityPage.getActivityText(activityIndex);
			expect(activityText).toContain(constants.memberUsername);
			
			// Truncate the ending 's' of the action string to match string comparison tenses
			var expectedString = script[scriptIndex].scope;
			expectedString = expectedString.replace(/s$/gi, '');
			expect(activityText).toContain(expectedString);
			

			// TODO: Any expections on other actions?  2014-05 DDW
			if (script[scriptIndex].action == 'edit') {
				expect(activityText).toContain('updated');
			}
			
			expect(activityText).toContain(script[scriptIndex].value);

			scriptIndex--;
			activityIndex++;
			
		};

		// Expect the last activity to be performed by admin
		activityPage.getLength().then(function(len) {
			activityText = activityPage.getActivityText(len - 1);
			expect(activityText).toContain('admin');
		});
		
		// Show only my activity
		activityPage.clickOnShowOnlyMyActivity();
		
		// Expect the last activity to be performed by user
		activityPage.getLength().then(function(len) {
			activityText = activityPage.getActivityText(len - 1);
			expect(activityText).toContain(constants.memberUsername);
		});
		
		// Show all activity
		activityPage.clickOnAllActivity();
		
		// Expect the last activity to be performed by admin
		activityPage.getLength().then(function(len) {
			activityText = activityPage.getActivityText(len - 1);
			expect(activityText).toContain('admin');
		});

		//browser.debugger();
	
	});

});

