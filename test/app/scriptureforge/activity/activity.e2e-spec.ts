// tslint:disable-next-line:no-reference
///<reference path="activityCustomMatchers.d.ts" />
import {browser, by, element, ExpectedConditions} from 'protractor';
import {ElementFinder} from 'protractor/built/element';

import {SfActivityPage} from '../../bellows/shared/activity.page';
import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {ProjectsPage} from '../../bellows/shared/projects.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectSettingsPage} from '../sfchecks/shared/project-settings.page';
import {SfProjectPage} from '../sfchecks/shared/project.page';
import {SfQuestionPage} from '../sfchecks/shared/question.page';
import {SfTextPage} from '../sfchecks/shared/text.page';

describe('Activity E2E Test', () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const activityPage = new SfActivityPage();
  const projectListPage = new ProjectsPage();
  const projectPage = new SfProjectPage();
  const projectSettingsPage = new SfProjectSettingsPage();
  const questionPage = new SfQuestionPage();
  const textPage = new SfTextPage();

  const testData = {
    answer: {
      add: 'Beethoven was the speaker.',
      edit: 'Mozart was also the speaker.'
    },
    comment: {
      add: 'This is an original comment.',
      edit: 'This is an edited comment.'
    }
  };

  beforeEach(() => {
    const matcherFactoryFunction = (multiline: boolean) => {
      return {
        compare: (list: string[], regex: RegExp) => {
          const index = list.findIndex((item: string) => {
            // The dot in Javascript regexes CANNOT match newlines, so we deal with that here
            if (multiline) {
              return regex.test(item.replace(/\n/g, ' '));
            }
            return regex.test(item);
          });

          return {
            pass: index >= 0,
            get message() {
              if (index >= 0) {
                return 'Expected list not to contain a match for ' + regex.toString() + ' but it did.';
              }
              return 'Expected list to contain a match for ' + regex.toString() + ' but it did not.';
            }
          };
        }
      };
    };

    jasmine.addMatchers({
      toContainMultilineMatch: () => {
        return matcherFactoryFunction(true);
      },
      toContainMatch: () => {
        return matcherFactoryFunction(false);
      }
    });

  });

  describe('Running as member: ', () => {

    it('Login and navigate to the first test Question page', () => {
      loginPage.loginAsUser();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      SfTextPage.clickOnQuestion(constants.testText1Question1Title);
    });

    performCommonActions();

    it('Navigate to Activity Page to verify actions', () => {
      activityPage.get();

      // Print everything in the activity list for debugging purposes
      // activityPage.printActivitiesNames();
    });

    verifyCommonActions(0, constants.memberUsername);

    verifyFilters(constants.memberUsername);

  });

  describe('Running as second member: ', () => {

    it('Login and navigate to the first test Question page', () => {
      loginPage.loginAsSecondUser();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      SfTextPage.clickOnQuestion(constants.testText1Question1Title);
    });

    performCommonActions();

    it('Navigate to Activity Page to verify actions', () => {
      activityPage.get();

      // Print everything in the activity list for debugging purposes
      // activityPage.printActivitiesNames();
    });

    verifyCommonActions(0, constants.member2Username);

    verifyFilters(constants.member2Username);

  });

  describe('Running as manager: ', () => {
    let memberCount = 0;

    it('Login and navigate to the first test Question page', () => {
      loginPage.loginAsManager();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      SfTextPage.clickOnQuestion(constants.testText1Question1Title);
    });

    performCommonActions();

    it('Performing action "add" on "texts"', () => {
      // Navigate back to Project Page
      browser.navigate().back();
      browser.navigate().back();
      expect<any>(projectPage.notice.list.count()).toBe(0);
      projectPage.addNewText(constants.testText3Title, projectPage.testData.simpleUsx1);
      projectPage.notice.waitToInclude('The text \'' + constants.testText3Title + '\' was added successfully');
      projectPage.notice.firstCloseButton.click();
    });

    it('Performing action \'add\' on \'questions\'', () => {
      browser.navigate().forward();
      expect<any>(textPage.notice.list.count()).toBe(0);
      textPage.addNewQuestion(constants.testText1Question3Title, constants.testText1Question3Summary);
      textPage.notice.waitToInclude('\'' + constants.testText1Question3Summary + '\' was added successfully');
      textPage.notice.firstCloseButton.click();
    });

    it('Get existing user count', () => {
      // Navigate back to Project Page
      browser.navigate().back();

      projectSettingsPage.clickOnSettingsLink();
      projectSettingsPage.membersTab.list.count().then((val: number) => { memberCount = val; });
    });

    it('Performing action \'add\' on \'users\'', () => {
      projectSettingsPage.membersTab.addNewMember('jimmycricket');
      projectSettingsPage.membersTab.waitForNewUserToLoad(memberCount);
      expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount + 1);

      // Return back to Question Page for rest of test.
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      SfTextPage.clickOnQuestion(constants.testText1Question1Title);
    });

    it('Navigate to Activity Page to verify actions', () => {
      activityPage.get();

      // Open all activities
      element.all(by.className('activity-group-meta')).click();
      browser.wait(ExpectedConditions.visibilityOf(activityPage.activitiesList.get(0)), constants.conditionTimeout);
      expect<any>(activityPage.activitiesList.get(0).isDisplayed()).toBe(true);

      // Print everything in the activity list for debugging purposes
      // activityPage.printActivitiesNames();
    });

    it('Verify action \'add\' on \'users\' appears on the activity feed', () => {
      const regex = new RegExp('.*Is now a member of.*' + Utils.escapeRegExp(constants.testProjectName) + '.*');
      const activityGroup = activityPage.getActivityGroup(0);
      expect<any>(activityGroup.user).toEqual('jimmycricket');
      expect<any>(activityGroup.activities).toContainMultilineMatch(regex);
    });

    it('Verify action \'add\' on \'questions\' appears on the activity feed', () => {
      const regex = new RegExp('.*new question.*' +
        Utils.escapeRegExp(constants.testText1Title) + '.*' +
        Utils.escapeRegExp(constants.testText1Question3Summary) + '.*');
      const activityGroup = activityPage.getActivityGroup(1);
      expect<any>(activityGroup.activities).toContainMultilineMatch(regex);
    });

    it('Verify action \'add\' on \'texts\' appears on the activity feed', () => {
      const regex = new RegExp('.*' +
        Utils.escapeRegExp(constants.testProjectName) + '.*' +
        '.*added.*' +
        Utils.escapeRegExp(constants.testText3Title) + '.*');
      const activityGroup = activityPage.getActivityGroup(1);
      expect<any>(activityGroup.activities).toContainMultilineMatch(regex);
    });

    verifyCommonActions(1, constants.managerUsername);

    verifyFilters(constants.managerUsername);

  });

  function setResponseVisibility(value: any) {
    loginPage.loginAsManager();
    projectSettingsPage.get(constants.testProjectName);
    projectSettingsPage.tabs.project.click();
    projectSettingsPage.projectTab.setCheckbox(projectSettingsPage.projectTab.usersSeeEachOthersResponses, value);
    projectSettingsPage.projectTab.saveButton.click();
  }

  function verifyResponseVisibility(valueShouldBeTrue: boolean) {
    projectSettingsPage.get(constants.testProjectName);
    projectSettingsPage.tabs.project.click();
    const isChecked = projectSettingsPage.projectTab.usersSeeEachOthersResponses.getAttribute('checked');
    if (valueShouldBeTrue) {
      expect<any>(isChecked).toBeTruthy();
    } else {
      expect<any>(isChecked).toBeFalsy();
    }
  }

  // TODO: That's not a great description
  describe('Testing activity-visibility settings: ', () => {
    it('Set response visibility to TRUE', () => {
      setResponseVisibility(true);
      verifyResponseVisibility(true);
    });

    describe('Running as first member: ', () => {

      it('Login and navigate to the first test Question page', () => {
        loginPage.loginAsUser();
        projectListPage.get();
        projectListPage.clickOnProject(constants.testProjectName);
        SfProjectPage.textLink(constants.testText1Title).click();
        SfTextPage.clickOnQuestion(constants.testText1Question1Title);
      });

      performCommonActions();

      it('Navigate to Activity Page to verify actions', () => {
        activityPage.get();

        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });

      verifyCommonActions(0, constants.memberUsername);

      verifyFilters(constants.memberUsername);

    });

    describe('Running as second member: ', () => {

      it('Login and navigate to the first test Question page', () => {
        loginPage.loginAsSecondUser();
        projectListPage.get();
        projectListPage.clickOnProject(constants.testProjectName);
        SfProjectPage.textLink(constants.testText1Title).click();
        SfTextPage.clickOnQuestion(constants.testText1Question1Title);
      });

      performCommonActions();

      it('Navigate to Activity Page to verify actions', () => {
        activityPage.get();

        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });

      verifyCommonActions(0, constants.member2Username);

      verifyFilters(constants.member2Username);

    });

    it('Set response visibility to FALSE', () => {
      setResponseVisibility(false);
      verifyResponseVisibility(false);
    });

    describe('Running as first member with visibility false: ', () => {

      it('Login and navigate to the first test Question page', () => {
        loginPage.loginAsUser();
        projectListPage.get();
        projectListPage.clickOnProject(constants.testProjectName);
        SfProjectPage.textLink(constants.testText1Title).click();
        SfTextPage.clickOnQuestion(constants.testText1Question1Title);
      });

      performAnswerActions();

      it('Navigate to Activity Page to verify actions', () => {
        activityPage.get();

        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });

      verifyAnswerActions(0, constants.memberUsername);

      verifyFilters(constants.memberUsername);

    });

    describe('Running as second member with visibility false: ', () => {

      it('Login and navigate to the first test Question page', () => {
        loginPage.loginAsSecondUser();
        projectListPage.get();
        projectListPage.clickOnProject(constants.testProjectName);
        SfProjectPage.textLink(constants.testText1Title).click();
        SfTextPage.clickOnQuestion(constants.testText1Question1Title);
      });

      performAnswerActions();

      it('Navigate to Activity Page to verify actions', () => {
        activityPage.get();

        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });

      // We don't call verifyCommonActions here,
      // because the activity list should be empty for user 2  // NOPE.

      verifyAnswerActions(0, constants.member2Username);

      verifyFilters(constants.member2Username);

      // TODO: Also check that the performCommonActions() function can't see others' responses

      // activityPage.get();
      // activityPage.activitiesList.filter(function (item) {
      //   // Look for activity items that do not contain our username
      //   return (item.getText().then(function (text) {
      //     return text.indexOf(constants.member2Username) === -1;
      //   }));
      // }).then(function (activityItems) {
      //   // Currently in "Only My Activity" mode, so should see NO items without our username
      //   expect<any>(activityItems.length).toEqual(0);
      // });

    });

    it('Set response visibility to TRUE for other tests', () => {
      setResponseVisibility(true);
      verifyResponseVisibility(true);
    });
  });

  function performUpvoteActions() {
    it('Performing action \'upvote\' on \'answers\'', () => {
      expect<any>(questionPage.answers.votes(0).getText()).toEqual('0');
      questionPage.answers.upvote(0);
      expect<any>(questionPage.answers.votes(0).getText()).toEqual('1');
    });

    it('Performing action \'downvote\' on \'answers\'', () => {
      questionPage.answers.downvote(0);
      expect<any>(questionPage.answers.votes(0).getText()).toEqual('0');
    });
  }

  function performAnswerActions() {
    it('Performing action \'add\' on \'answers\'', () => {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.answers.add(testData.answer.add);
      expect<any>(questionPage.answers.last().getText()).toContain(testData.answer.add);
      questionPage.notice.waitToInclude('The answer was submitted successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'addToLastAnswer\' on \'comments\'', () => {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.comments.addToLastAnswer(testData.comment.add);
      expect<any>(questionPage.comments.last().getText()).toContain(testData.comment.add);
      questionPage.notice.waitToInclude('The comment was submitted successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'edit\' on \'comments\'', () => {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.comments.edit(testData.comment.edit);
      expect<any>(questionPage.comments.last().getText()).toContain(testData.comment.edit);
      questionPage.notice.waitToInclude('The comment was updated successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'edit\' on \'answers\'', () => {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.answers.edit(testData.answer.edit);
      expect<any>(questionPage.answers.last().getText()).toContain(testData.answer.edit);
      questionPage.notice.waitToInclude('The answer was updated successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'delete\' on \'comments\'', () => {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      const oldCount = questionPage.comments.list.count();
      questionPage.comments.archive('');
      const newCount = questionPage.comments.list.count();
      oldCount.then((count: number) => {
        expect<any>(newCount).toEqual(count - 1);
      });

      questionPage.notice.waitToInclude('The comment was removed successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'delete\' on \'answers\'', () => {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.answers.list.count().then((count: number) => {
        questionPage.answers.archive('');
        const newCount = questionPage.answers.list.count();
        expect<any>(newCount).toEqual(count - 1);

        // Which means newCount > 0 -- but oldCount is a real int, while newCount is still a promise
        if (count > 1) {
          expect<any>(questionPage.answers.last().getText()).toContain(constants.testText1Question1Answer);
        }

        questionPage.notice.waitToInclude('The answer was removed successfully');
        questionPage.notice.firstCloseButton.click();
      });
    });
  }

  function performCommonActions() {
    // perform up vote first because it occasionally posts activity before a task started after it
    performUpvoteActions();
    performAnswerActions();
  }

  function verifyUpvoteActions(aIndex: number, username: string) {
    it('Verify action \'upvote\' on \'answers\' appears on the activity feed', () => {
      const regex = new RegExp('.*' + Utils.escapeRegExp('+1\'d your answer') + '.*' +
        Utils.escapeRegExp(constants.testText1Question1Title));
      const activityGroup = activityPage.getActivityGroup(aIndex);
      expect<any>(activityGroup.user).toEqual(username);
      expect<any>(activityGroup.activities).toContainMultilineMatch(regex);
    });
  }

  function verifyAnswerActions(aIndex: number, username: string) {
    it('Open all activity groups', () => {
      activityPage.get();
      element.all(by.className('activity-group-meta')).click();
      browser.wait(ExpectedConditions.visibilityOf(
        activityPage.activitiesList.get(aIndex)), constants.conditionTimeout);
      expect<any>(activityPage.activitiesList.get(aIndex).isDisplayed()).toBe(true);
    });

    it('Verify action \'edit\' on \'answers\' appears on the activity feed', () => {
      const regex = new RegExp('.*Updated their answer.* ' + Utils.escapeRegExp(testData.answer.edit));
      const activityGroup = activityPage.getActivityGroup(aIndex);
      expect<any>(activityGroup.user).toEqual(username);
      expect<any>(activityGroup.activities).toContainMultilineMatch(regex);
    });

    it('Verify action \'edit\' on \'comments\' appears on the activity feed', () => {
      const regex = new RegExp('.*Updated their comment.*' +
        Utils.escapeRegExp(testData.answer.add) + '.*' + Utils.escapeRegExp(testData.comment.edit));
      const activityGroup = activityPage.getActivityGroup(aIndex);
      expect<any>(activityGroup.user).toEqual(username);
      expect<any>(activityGroup.activities).toContainMultilineMatch(regex);
    });

    it('Verify action \'addToLastAnswer\' on \'comments\' appears on the activity feed', () => {
      const regex = new RegExp('.*Responded.*' +
        Utils.escapeRegExp(testData.answer.add) + '.*' + Utils.escapeRegExp(testData.comment.add));
      const activityGroup = activityPage.getActivityGroup(aIndex);
      expect<any>(activityGroup.user).toEqual(username);
      expect<any>(activityGroup.activities).toContainMultilineMatch(regex);
    });

    it('Verify action \'add\' on \'answers\' appears on the activity feed', () => {
      const regex = new RegExp('.*Answered.*' +
        Utils.escapeRegExp(testData.answer.add));
      const activityGroup = activityPage.getActivityGroup(aIndex);
      expect<any>(activityGroup.user).toEqual(username);
      expect<any>(activityGroup.activities).toContainMultilineMatch(regex);
    });
  }

  function verifyCommonActions(aIndex: number, username: string) {
    verifyAnswerActions(aIndex, username);
    verifyUpvoteActions(aIndex, username);
  }

  function verifyFilters(username: string) {
    it('Verify filters work on the activity page', () => {
      activityPage.get();
      activityPage.activityGroups.filter((item: ElementFinder) => {
        // Look for activity items that do not contain our username
        const activityGroup = SfActivityPage.getPartsOfActivity(item);
        return (activityGroup.user.then((text: string) => {
          return text.indexOf(username) === -1;
        }));
      }).then((activityItems: ElementFinder[]) => {
        // Currently in "All Activity" mode, so should see items without our username
        expect<any>(activityItems.length).toBeGreaterThan(0);
      });

      // Show only my activity
      activityPage.clickOnShowOnlyMyActivity();
      activityPage.activityGroups.filter((item: ElementFinder) => {
        // Look for activity items that do not contain our username
        const activityGroup = SfActivityPage.getPartsOfActivity(item);
        return (activityGroup.user.then((text: string) => {
          return text.indexOf(username) === -1;
        }));
      }).then((activityItems: ElementFinder[]) => {
        // Currently in "Only My Activity" mode, so should see NO items without our username
        expect<any>(activityItems.length).toEqual(0);
      });

      // Show all activity
      activityPage.clickOnAllActivity();
      activityPage.activityGroups.filter((item: ElementFinder) => {
        // Look for activity items that do not contain our username
        const activityGroup = SfActivityPage.getPartsOfActivity(item);
        return (activityGroup.user.then((text: string) => {
          return text.indexOf(username) === -1;
        }));
      }).then((activityItems: ElementFinder[]) => {
        // Currently in "All Activity" mode, so should see items without our username
        expect<any>(activityItems.length).toBeGreaterThan(0);
      });
    });
  }

});
