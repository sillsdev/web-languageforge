'use strict';

var constants       = require('../../../../testConstants');
var activityPage    = require('../../../pages/activityPage');
var projectListPage = require('../../../pages/projectsPage');
var projectPage     = require('../../../pages/projectPage');
var questionPage    = require('../../../pages/questionPage');
var textPage        = require('../../../pages/textPage');
var loginPage       = require('../../../pages/loginPage');


// Script of actions to perform which will then be verified on the activity feed.
// Currently, this list assumes test normal user has the role permissions for the actions
// scope options:  {'answers', 'comments'}
// action options: {'add', 'addToLastAnswer', 'edit', 'upvote', 'archive'}
// value: normally free text.  Can be an integer when used as 0-based index into the answers.list
//        If value is left blank, then perform the action on the last item
var script = [
	/*{scope: 'answers',   action: 'add',              value: 'Beethoven was the speaker.'},
	{scope: 'comments',  action: 'addToLastAnswer',  value: 'This is an original comment.'},
	{scope: 'comments',  action: 'edit',             value: 'This is an edited comment for the E2E test.'},
	{scope: 'answers',   action: 'edit',             value: 'Mozart was also the speaker.'},
	{scope: 'answers',   action: 'upvote',           value: 1},
	{scope: 'answers',   action: 'downvote',         value: 1},
	/* 
	// archiving a comment/answer at a specific answer works, but the verification process doesn't
	// know which indices were removed.
	// Also, normal user isn't guaranteed to have permissions to archive answer at index 1
	//{scope: 'comments',  action: 'archive',          value: 1},
	//{scope: 'answers',   action: 'archive',          value: 1},
	*/
	/*{scope: 'comments',  action: 'archive',          value: ''},
	{scope: 'answers',   action: 'archive',          value: ''},
	/*
	// TODO: Manager actions to add   2014-05 DDW */
	{scope: 'texts',     action: 'add',             value: constants.testText3Title},
	//{scope: 'questions', action: 'add',             value: 'Some question to add'},
	//{scope: 'users',     action: 'add',             value: 'Some Username to add to project'},
	//*/
];


// Comment out Manager while we troubleshoot control flow
// Array of test usernames to test Activity page with different roles
var usernames = [//constants.memberUsername,
                 constants.managerUsername
				 ];

// Run the Activity E2E as each test user
usernames.forEach(function(expectedUsername){

	// Perform activity E2E tests according to the different roles
	describe('Activity Page E2E testing as: ' + expectedUsername, function() {

		it('should populate the activity feed as ' + expectedUsername, function() {
			// Login before test to ensure proper role
			if (expectedUsername == constants.memberUsername) {
				loginPage.loginAsUser();
			} else if (expectedUsername == constants.managerUsername) {
				loginPage.loginAsManager();
			};

			// Perform the following actions to populate the activity feed.
			// Assumes test project has already been populated with a test text and question
			
			// Navigate to the Test Project -> Text -> Question
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.clickOnText(constants.testText1Title);
			textPage.clickOnQuestion(constants.testText1Question1Title);

			// Evaluate the script actions
			for (var i=0; i<script.length; i++) {
				// Append timestamp for answer/comment add/edit actions
				if (((script[i].scope == 'answers') || (script[i].scope == 'comments')) && 
					 ((script[i].action == 'add') || (script[i].action == 'edit')) ) {
					script[i].value = script[i].value + Math.floor(new Date().getTime() / 1000);
				}
				
				switch (script[i].scope) {
					case 'texts' :
						console.log('Attempting to create new text');
						projectListPage.get();
						projectListPage.clickOnProject(constants.testProjectName);
						projectPage.addNewText(script[i].value, projectPage.testData);


					break;
					case 'questions' :
					textPage.clickOnQuestion(constants.testText1Question1Title);

					break;
					case 'users' :
					break;
					default :
						//console.log('Scope: ' + script[i].scope + ' Action: ' + script[i].action + ' Value: ' + script[i].value);

						questionPage[script[i].scope][script[i].action](script[i].value);
				}
				browser.debugger();
			};

			// Debug statement to check script actions
			//console.log('Script has ' + script.length + ' actions');

		});

		it ('should verify actions appear on the activity feed as ' + expectedUsername, function() {
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
				expect(activityText).toContain(expectedUsername);
				
				// Truncate the ending 's' of the action string to partially match strings with different verb tenses
				var expectedString = script[scriptIndex].scope;
				expectedString = expectedString.replace(/s$/gi, '');
				if (expectedString == 'text') {
					expect(activityText).toContain(script[scriptIndex].value);
				} else {
					expect(activityText).toContain(expectedString);
				};
				
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

			activityPage.get();
			
			// Expect the last activity to be performed by admin
			activityPage.getLength().then(function(len) {
				activityText = activityPage.getActivityText(len - 1);
				expect(activityText).toContain('admin');
			});
			
			// Show only my activity
			activityPage.clickOnShowOnlyMyActivity();
			
			// Expect the last activity to be performed by current username
			// If scope isn't texts
			activityPage.getLength().then(function(len) {
				activityText = activityPage.getActivityText(len - 1);
				if (script[script.lastIndex].scope != 'texts') {
					expect(activityText).toContain(expectedUsername);
				};
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
});
