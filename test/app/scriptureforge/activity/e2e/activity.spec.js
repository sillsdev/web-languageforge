'use strict';

describe('Activity E2E Test', function () {
  var constants       = require('../../../testConstants.json');
  var loginPage       = require('../../../bellows/pages/loginPage.js');
  var activityPage    = require('../../../bellows/pages/activityPage.js');
  var projectListPage = require('../../../bellows/pages/projectsPage.js');
  var projectPage         = require('../../sfchecks/pages/projectPage.js');
  var projectSettingsPage = require('../../sfchecks/pages/projectSettingsPage.js');
  var questionPage        = require('../../sfchecks/pages/questionPage.js');
  var textPage            = require('../../sfchecks/pages/textPage.js');

  var activityIndex = 0;
  var testData = {
    answer: {
      add: 'Beethoven was the speaker.',
      edit: 'Mozart was also the speaker.'
    },
    comment: {
      add: 'This is an original comment.',
      edit: 'This is an edited comment.'
    }
  };

  describe('Running as member: ', function () {

    it('Login and navigate to the first test Question page', function () {
      loginPage.loginAsUser();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      projectPage.textLink(constants.testText1Title).click();
      textPage.clickOnQuestion(constants.testText1Question1Title);
    });

    performCommonActions();

    it('Navigate to Activity Page to verify actions', function () {
      activityPage.get();

      // Print everything in the activity list for debugging purposes
      // activityPage.printActivitiesNames();
    });

    verifyCommonActions(activityIndex, constants.memberUsername);

    verifyFilters(constants.memberUsername);

  });

  describe('Running as manager: ', function () {
    var memberCount = 0;

    it('Login and navigate to the first test Question page', function () {
      loginPage.loginAsManager();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      projectPage.textLink(constants.testText1Title).click();
      textPage.clickOnQuestion(constants.testText1Question1Title);
    });

    performCommonActions();

    it("Performing action 'add' on 'texts'", function () {
      // Navigate back to Project Page
      browser.navigate().back();
      browser.navigate().back();
      expect(projectPage.notice.list.count()).toBe(0);
      projectPage.addNewText(constants.testText3Title, projectPage.testData);
      projectPage.notice.waitToInclude('The text \'' + constants.testText3Title +
        '\' was added successfully');
      projectPage.notice.firstCloseButton.click();
    });

    it("Performing action 'add' on 'questions'", function () {
      browser.navigate().forward();
      expect(textPage.notice.list.count()).toBe(0);
      textPage.addNewQuestion(constants.testText1Question3Title,
        constants.testText1Question3Summary);
      textPage.notice.waitToInclude('\'' + constants.testText1Question3Summary +
        '\' was added successfully');
      textPage.notice.firstCloseButton.click();
    });

    it('Get existing user count', function () {
      // Navigate back to Project Page
      browser.navigate().back();

      projectSettingsPage.get();
      projectSettingsPage.membersTab.list.count().then(function (val) { memberCount = val; });
    });

    it("Performing action 'add' on 'users'", function () {
      projectSettingsPage.membersTab.addNewMember('jimmycricket');
      projectSettingsPage.membersTab.waitForNewUserToLoad(memberCount);
      expect(projectSettingsPage.membersTab.list.count()).toBe(memberCount + 1);

      // Return back to Question Page for rest of test.
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      projectPage.textLink(constants.testText1Title).click();
      textPage.clickOnQuestion(constants.testText1Question1Title);
    });

    it('Navigate to Activity Page to verify actions', function () {
      activityPage.get();

      // Print everything in the activity list for debugging purposes
      // activityPage.printActivitiesNames();
    });

    it("Verify action 'add' on 'users' appears on the activity feed", function () {
      activityIndex = 0;
      var activityText = activityPage.getActivityText(activityIndex);
      expect(activityText).toContain('jimmycricket is now a member of ' +
        constants.testProjectName);
    });

    it("Verify action 'add' on 'questions' appears on the activity feed", function () {
      activityIndex += 1;
      var activityText = activityPage.getActivityText(activityIndex);
      expect(activityText).toContain(constants.testText1Title);
      expect(activityText).toContain('new question');
      expect(activityText).toContain(constants.testText1Question3Summary);
    });

    it("Verify action 'add' on 'texts' appears on the activity feed", function () {
      activityIndex += 1;
      var activityText = activityPage.getActivityText(activityIndex);
      expect(activityText).toContain(constants.testProjectName);
      expect(activityText).toContain('added');
      expect(activityText).toContain(constants.testText3Title);
    });

    verifyCommonActions(3, constants.managerUsername);

    verifyFilters(constants.managerUsername);

  });

  function performCommonActions() {
    // perform up vote first because it occasionally posts activity before a task started after it
    it("Performing action 'upvote' on 'answers'", function () {
      expect(questionPage.answers.votes(0).getText()).toEqual('0');
      questionPage.answers.upvote(0);
      expect(questionPage.answers.votes(0).getText()).toEqual('1');
    });

    it("Performing action 'downvote' on 'answers'", function () {
      questionPage.answers.downvote(0);
      expect(questionPage.answers.votes(0).getText()).toEqual('0');
    });

    it("Performing action 'add' on 'answers'", function () {
      expect(questionPage.notice.list.count()).toBe(0);
      questionPage.answers.add(testData.answer.add);
      expect(questionPage.answers.last().getText()).toContain(testData.answer.add);
      questionPage.notice.waitToInclude('The answer was submitted successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it("Performing action 'addToLastAnswer' on 'comments'", function () {
      expect(questionPage.notice.list.count()).toBe(0);
      questionPage.comments.addToLastAnswer(testData.comment.add);
      expect(questionPage.comments.last().getText()).toContain(testData.comment.add);
      questionPage.notice.waitToInclude('The comment was submitted successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it("Performing action 'edit' on 'comments'", function () {
      expect(questionPage.notice.list.count()).toBe(0);
      questionPage.comments.edit(testData.comment.edit);
      expect(questionPage.comments.last().getText()).toContain(testData.comment.edit);
      questionPage.notice.waitToInclude('The comment was updated successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it("Performing action 'edit' on 'answers'", function () {
      expect(questionPage.notice.list.count()).toBe(0);
      questionPage.answers.edit(testData.answer.edit);
      expect(questionPage.answers.last().getText()).toContain(testData.answer.edit);
      questionPage.notice.waitToInclude('The answer was updated successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it("Performing action 'delete' on 'comments'", function () {
      expect(questionPage.notice.list.count()).toBe(0);
      expect(questionPage.comments.list.count()).toEqual(2);
      questionPage.comments.archive('');
      expect(questionPage.comments.list.count()).toEqual(1);
      questionPage.notice.waitToInclude('The comment was removed successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it("Performing action 'delete' on 'answers'", function () {
      expect(questionPage.notice.list.count()).toBe(0);
      expect(questionPage.answers.list.count()).toEqual(2);
      questionPage.answers.archive('');
      expect(questionPage.answers.list.count()).toEqual(1);
      expect(questionPage.answers.last().getText()).toContain(constants.testText1Question1Answer);
      questionPage.notice.waitToInclude('The answer was removed successfully');
      questionPage.notice.firstCloseButton.click();
    });
  }

  function verifyCommonActions(activityIndex, username) {
    it("Verify action 'edit' on 'answers' appears on the activity feed", function () {
      var activityText = activityPage.getActivityText(activityIndex);
      expect(activityText).toContain(username);
      expect(activityText).toContain('updated their answer');
      expect(activityText).toContain(testData.answer.edit);
    });

    it("Verify action 'edit' on 'comments' appears on the activity feed", function () {
      activityIndex += 1;
      var activityText = activityPage.getActivityText(activityIndex);
      expect(activityText).toContain(username);
      expect(activityText).toContain('updated their comment');
      expect(activityText).toContain(testData.answer.add);
      expect(activityText).toContain(testData.comment.edit);
    });

    it("Verify action 'addToLastAnswer' on 'comments' appears on the activity feed", function () {
      activityIndex += 1;
      var activityText = activityPage.getActivityText(activityIndex);
      expect(activityText).toContain(username);
      expect(activityText).toContain('commented');
      expect(activityText).toContain(testData.answer.add);
      expect(activityText).toContain(testData.comment.add);
    });

    it("Verify action 'add' on 'answers' appears on the activity feed", function () {
      activityIndex += 1;
      var activityText = activityPage.getActivityText(activityIndex);
      expect(activityText).toContain(username);
      expect(activityText).toContain('answered');
      expect(activityText).toContain(testData.answer.add);
    });

    it("Verify action 'upvote' on 'answers' appears on the activity feed", function () {
      activityIndex += 1;
      var activityText = activityPage.getActivityText(activityIndex);
      expect(activityText).toContain(username);
      expect(activityText).toContain('+1\'d your answer');
      expect(activityText).toContain(constants.testText1Question1Title);
    });
  }

  function verifyFilters(username) {
    it('Verify filters work on the activity page', function () {
      activityPage.get();
      activityPage.activitiesList.filter(function (item) {
        // Look for activity items that do not contain our username
        return (item.getText().then(function (text) {
          return text.indexOf(username) == -1;
        }));
      }).then(function (activityItems) {
        // Currently in "All Activity" mode, so should see items without our username
        expect(activityItems.length).toBeGreaterThan(0);
      });

      // Show only my activity
      activityPage.clickOnShowOnlyMyActivity();
      activityPage.activitiesList.filter(function (item) {
        // Look for activity items that do not contain our username
        return (item.getText().then(function (text) {
          return text.indexOf(username) == -1;
        }));
      }).then(function (activityItems) {
        // Currently in "Only My Activity" mode, so should see NO items without our username
        expect(activityItems.length).toEqual(0);
      });

      // Show all activity
      activityPage.clickOnAllActivity();
      activityPage.activitiesList.filter(function (item) {
        // Look for activity items that do not contain our username
        return (item.getText().then(function (text) {
          return text.indexOf(username) == -1;
        }));
      }).then(function (activityItems) {
        // Currently in "All Activity" mode, so should see items without our username
        expect(activityItems.length).toBeGreaterThan(0);
      });
    });
  }

});
