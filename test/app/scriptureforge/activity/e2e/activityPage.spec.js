'use strict';

var constants           = require('../../../testConstants');
var loginPage           = require('../../../bellows/pages/loginPage');
var activityPage        = require('../../../bellows/pages/activityPage');
var projectListPage     = require('../../../bellows/pages/projectsPage');
var projectPage         = require('../../sfchecks/pages/projectPage');
var projectSettingsPage = require('../../sfchecks/pages/projectSettingsPage');
var questionPage        = require('../../sfchecks/pages/questionPage');
var textPage            = require('../../sfchecks/pages/textPage');

/* Script of actions to perform which will then be verified on the activity feed.
 * These actions are performed by both normal user and manager user.
 * Currently, this list assumes test normal user has the role permissions for the actions.
 * scope options:  {'answers', 'comments'}
 * action options: {'add', 'addToLastAnswer', 'edit', 'upvote', 'archive'}
 * value: normally free text.  For adding questions, the value is the question summary.
 *        Value can also be an integer when used as 0-based index into the answers.list
 *        If value is left blank, then perform the action on the last item
 */
var script = [
  {scope: 'answers',   action: 'add',              value: 'Beethoven was the speaker.'},
  {scope: 'comments',  action: 'addToLastAnswer',  value: 'This is an original comment.'},
  {scope: 'comments',  action: 'edit',             value: 'This is an edited comment for the E2E test.'},
  {scope: 'answers',   action: 'edit',             value: 'Mozart was also the speaker.'},
  {scope: 'answers',   action: 'upvote',           value: 1},
  {scope: 'answers',   action: 'downvote',         value: 1},
  /* 
   * archiving a comment/answer at a specific answer works, but the verification process doesn't
   * know which indices were removed.
   * Also, normal user isn't guaranteed to have permissions to archive answer at index 1
   * {scope: 'comments',  action: 'archive',          value: 1},
   * {scope: 'answers',   action: 'archive',          value: 1},
   */
  {scope: 'comments',  action: 'archive',          value: ''},
  {scope: 'answers',   action: 'archive',          value: ''},
  {scope: 'texts',     action: 'add',              value: constants.testText3Title},
  {scope: 'questions', action: 'add',              value: constants.testText1Question3Summary},
  {scope: 'users',     action: 'add',              value: 'jimmycricket'}
];

// Array of test usernames to test Activity page with different roles
var usernames = [
    constants.memberUsername,
    constants.managerUsername
  ];

// Utility function to determine if the current user will have the role permissions to do the scope/action
var isAllowed = function(scope, username) {

  // normal user doesn't have permissions for these scopes:
  if ( (username == constants.memberUsername) &&
       ((scope == 'texts') || (scope == 'questions') || (scope == 'users')) ) {
    return false;
  };

  // Everything else is allowed
  return true;
};

describe('Activity Page E2E Test', function() {
   
  // Run the Activity E2E as each test user
  usernames.forEach(function(expectedUsername) {
    
    // Perform activity E2E tests according to the different roles
    describe('Running as: ' + expectedUsername, function() {
      
      // Login before test to ensure proper role
      it('Logging in', function() {
        if (expectedUsername == constants.memberUsername) {
          loginPage.loginAsUser();
        } else if (expectedUsername == constants.managerUsername) {
          loginPage.loginAsManager();
        };
      });
      
      it('Navigate to the first test Question page', function() {
        projectListPage.get();
        projectListPage.clickOnProject(constants.testProjectName);
        projectPage.textLink(constants.testText1Title).click();
        textPage.clickOnQuestion(constants.testText1Question1Title);
      });
      
      // Evaluate the script actions
      for (var i = 0; i < script.length; i++) {
        
        // Append timestamp for answer/comment add/edit actions
        if ( ((script[i].scope == 'answers') || (script[i].scope == 'comments')) && 
           ((script[i].action == 'add') || (script[i].action == 'edit')) ) {
          script[i].value = script[i].value + Math.floor(new Date().getTime() / 1000);
        };
        
        // Skip if user doesn't have role permissions for the scope/action
        if (! isAllowed(script[i].scope, expectedUsername)) {
          continue;
        };
            
        // see http://stackoverflow.com/questions/21634558/looping-on-a-protractor-test-with-parameters
        (function(currentScript) {
          
          it("Performing action '" + currentScript.action + "' on '" + currentScript.scope + "'" , function() {
          
            switch (currentScript.scope) {
              case 'texts' :
                
                // Navigate back to Project Page
                browser.navigate().back();
                browser.navigate().back();
                projectPage.addNewText(currentScript.value, projectPage.testData);
                
                // Return back to Question Page for rest of test
                browser.navigate().forward();
                browser.navigate().forward();
                break;
              case 'questions' :
                browser.navigate().back();
                textPage.addNewQuestion(constants.testText1Question3Title, currentScript.value);
                browser.navigate().forward();
                break;
              case 'users' :
                
                // Navigate back to Project Page
                browser.navigate().back();
                browser.navigate().back();
                
                // Click on Project Settings
                projectSettingsPage.get();
                projectSettingsPage.addNewMember(currentScript.value);
                
                // Return back to Question Page for rest of test.
                projectListPage.get();
                projectListPage.clickOnProject(constants.testProjectName);
                projectPage.textLink(constants.testText1Title).click();
                textPage.clickOnQuestion(constants.testText1Question1Title);
                break;
              default :
                
                // Default page is Question page, so perform action
                questionPage[currentScript.scope][currentScript.action](currentScript.value);
            };
          });
        })(script[i]);
            
      };
          
      it('Navigate to Activity Page to verfy actions', function() {
        
        activityPage.get();
        
        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });
      
      /* Now check the activity feed.  Current items are at the head
       * of the activity feed so traverse the script in reverse order
       */
      var scriptIndex = script.length - 1;
      var activityIndex = 0;
      while (scriptIndex >= 0) {
        
        /* Skip verifying the following actions/scope because they don't appear in the
         * activity feed or because normal user doesn't have role permissions to do them
         */
        if ( (script[scriptIndex].action == 'archive') || 
             (script[scriptIndex].action == 'downvote') || 
           (!isAllowed(script[scriptIndex].scope, expectedUsername)) ) {
          scriptIndex--;
          continue;
        }

        // see http://stackoverflow.com/questions/21634558/looping-on-a-protractor-test-with-parameters
        (function(currentScript, activityIndex) {
          
          // Expect some combinations of username, script scope, action, and value to appear in the activity feed
          it ("Verify action '" + currentScript.action + "' on '" + currentScript.scope + "' appears on the activity feed", function() {
            
            // Expectation for the subject in the activity page text
            var activityText = activityPage.getActivityText(activityIndex);
            switch (currentScript.scope) {
              case 'texts' :
                expect(activityText).toContain(constants.testProjectName);
                break;
              case 'questions' :
                expect(activityText).toContain(constants.testText1Title);
                break;
              case 'users' :
                expect(activityText).toContain(currentScript.value);
                break;
              default :
                expect(activityText).toContain(expectedUsername);
            };
            
            // Truncate the ending 's' of the Scope string to partially match strings with different scope tenses
            var expectedString = currentScript.scope;
            expectedString = expectedString.replace(/s$/gi, '');
            if ((expectedString != 'text') && (expectedString != 'user')) {
              expect(activityText).toContain(expectedString);
            };
            
            // Verify actions
            if (currentScript.action == 'edit') {
              expect(activityText).toContain('updated');
            } else if (currentScript.action == 'upvote') {
              expect(activityText).toContain('+1\'d');
            };
            
            // Verify values  
            if (typeof currentScript.value == 'string') {
              
              // 'User' value already checked above, so check for project membership string
              if (currentScript.scope == 'users') {
                expect(activityText).toContain('is now a member of ' + constants.testProjectName);
              } else {
                expect(activityText).toContain(currentScript.value);
              };
            };
  
          });
        })(script[scriptIndex], activityIndex);

        scriptIndex--;
        activityIndex++;
      };
      
      it ('Verify filters work on the activity page', function() {
        
        // Additional tests to verify activity page filtering
        activityPage.get();
        
        activityPage.activitiesList.filter(function(item) {
          
          // Look for activity items that do not contain our username
          return (item.getText().then(function(text) {
            return text.indexOf(expectedUsername) == -1;
          }));
        }).then(function(activityItems) {
          
          // Currently in "All Activity" mode, so should see items without our username
          expect(activityItems.length).toBeGreaterThan(0);
        });
        
        // Show only my activity
        activityPage.clickOnShowOnlyMyActivity();
        
        activityPage.activitiesList.filter(function(item) {
          
          // Look for activity items that do not contain our username
          return (item.getText().then(function(text) {
            return text.indexOf(expectedUsername) == -1;
          }));
        }).then(function(activityItems) {
          
          // Currently in "Only My Activity" mode, so should see NO items without our username
          expect(activityItems.length).toEqual(0);
        });
        
        // Show all activity
        activityPage.clickOnAllActivity();
        
        activityPage.activitiesList.filter(function(item) {
          
          // Look for activity items that do not contain our username
          return (item.getText().then(function(text) {
            return text.indexOf(expectedUsername) == -1;
          }));
        }).then(function(activityItems) {
          
          // Currently in "All Activity" mode, so should see items without our username
          expect(activityItems.length).toBeGreaterThan(0);
        });
        
      });
    });
  });
});
