'use strict';

var constants    = require('../../../../testConstants');

var SfActivity = function() {

};

describe('E2E testing: User Activity page', function() {
	var sfUserActivity    = new SfActivity();
	
	var testText          = 'Chapter 3';
	var testQuestion      = 'Who is speaking?';

	// Script of actions to perform which will then be verified on the activity feed.
	// Currently, this list assumes test normal user has the role permissions for the actions
	// scope options:  {'answers', 'comments'}
	// action options: {'add', 'addToLastAnswer', 'edit', 'upvote', 'archive'}
	// value: normally free text.  Can be an integer when used as index into the answers.list
	//        If value is left blank, then perform the action on the last item
	var script = [
		{scope: 'answers',  action: 'add',              value: 'Beethoven was the speaker.'},
		{scope: 'comments', action: 'addToLastAnswer',  value: 'This is an original comment.'},
		{scope: 'comments', action: 'edit',             value: 'This is an edited comment for the E2E test.'},
		{scope: 'answers',  action: 'edit',             value: 'Mozart was also the speaker.'},
		{scope: 'answers',  action: 'upvote',           value: 1},
		{scope: 'answers',  action: 'downvote',         value: 1},
		{scope: 'comments', action: 'archive',          value: 1},
		{scope: 'answers',  action: 'archive',          value: 1},
		{scope: 'comments', action: 'archive',          value: ''},
		{scope: 'answers',  action: 'archive',          value: ''},
	];
	
	var activityPage    = require('../../../pages/activityPage');
	var projectListPage = require('../../../pages/projectsPage');
	var projectPage     = require('../../../pages/projectPage');
	var questionPage    = require('../../../pages/questionPage');
	var textPage        = require('../../../pages/textPage');
	var loginPage       = require('../../../pages/loginPage');

	loginPage.loginAsUser();
	
	it('should perform some actions to populate the activity feed', function() {

		// Perform the following actions to populate the activity feed.
		// Assumes admin/project manager has add a text and test question to the project
		
		// Navigate to the Test Project -> Text -> Question
		projectListPage.get();
		projectListPage.clickOnProject(constants.testProjectName);
		projectPage.clickOnText(testText);
		textPage.clickOnQuestion(testQuestion);

		// Evaluate the script actions
		for (var i=0; i<script.length; i++) {
			// Append timestamp for answer add/edit actions
			if ((script[i].scope == 'answers') && 
				((script[i].action == 'add') || (script[i].action == 'edit'))) {
				script[i].value = script[i].value + new Date();
			}
			
			//console.log('Scope: ' + script[i].scope + ' Action: ' + script[i].action + ' Value: ' + script[i].value);
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
			// Skip verifying the following actions because they don't appear in the activity feed
			if ((script[scriptIndex].action == 'archive') ||
				(script[scriptIndex].action == 'downvote')) {
				//console.log('skip verifying action ' + script[scriptIndex].action);
				scriptIndex--;
				continue;
			}

			// Expect some combinations of username, script scope, action, and value
			// to appear in the activity feed
			activityText = activityPage.getActivityText(activityIndex);
			expect(activityText).toContain(constants.memberUsername);
			
			// Truncate the ending 's' of the action string to match string comparison tenses
			var expectedString = script[scriptIndex].scope;
			expectedString = expectedString.replace(/s$/gi, '');
			expect(activityText).toContain(expectedString);
			

			// TODO: Any expections on other actions?  2014-05 DDW
			if (script[scriptIndex].action == 'edit') {
				expect(activityText).toContain('updated');
			} else if (script[scriptIndex].action == 'upvote') {
				expect(activityText).toContain('+1\'d')
			};
			
			if (typeof script[scriptIndex].value == 'string') {
				expect(activityText).toContain(script[scriptIndex].value);
			};

			scriptIndex--;
			activityIndex++;
			
		};
	});
	
	it ('should verify filters work on the activity page', function() {
		// Additional tests to verify activity page filtering
		var activityText = '';
		
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

