// tslint:disable-next-line:no-reference
///<reference path="activityCustomMatchers.d.ts" />
import {browser} from 'protractor';
import {ElementFinder} from 'protractor/built/element';

import {SfActivityPage} from '../../bellows/shared/activity.page';
import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {ProjectsPage} from '../../bellows/shared/projects.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectSettingsPage} from '../sfchecks/shared/project-settings.page';
import {SfProjectPage} from '../sfchecks/shared/project.page';
import {SfQuestionPage} from '../sfchecks/shared/question.page';
import {SfTextPage} from '../sfchecks/shared/text.page';

describe('Activity E2E Test', async function() {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const activityPage = new SfActivityPage();
  const projectListPage = new ProjectsPage();
  const projectPage = new SfProjectPage();
  const projectSettingsPage = new SfProjectSettingsPage();
  const questionPage = new SfQuestionPage();
  const textPage = new SfTextPage();

  let activityIndex = 0;
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

  describe('Running as member: ', async function() {

    it('Login and navigate to the first test Question page', async function() {
      await loginPage.loginAsUser();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      await SfTextPage.clickOnQuestion(constants.testText1Question1Title);
    });

    await performCommonActions();

    it('Navigate to Activity Page to verify actions', async function() {
      await activityPage.get();

      // Print everything in the activity list for debugging purposes
      // activityPage.printActivitiesNames();
    });

    activityIndex = await verifyCommonActions(activityIndex, constants.memberUsername);

    await verifyFilters(constants.memberUsername);

  });

  describe('Running as second member: ', async function() {

    it('Login and navigate to the first test Question page', async function() {
      await loginPage.loginAsSecondUser();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      await SfTextPage.clickOnQuestion(constants.testText1Question1Title);
    });

    await performCommonActions();

    it('Navigate to Activity Page to verify actions', async function() {
      await activityPage.get();

      // Print everything in the activity list for debugging purposes
      // activityPage.printActivitiesNames();
    });

    activityIndex = await verifyCommonActions(activityIndex, constants.member2Username);

    await verifyFilters(constants.member2Username);

  });

  describe('Running as manager: ', async function() {
    let memberCount = 0;

    it('Login and navigate to the first test Question page', async function() {
      await loginPage.loginAsManager();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      await SfTextPage.clickOnQuestion(constants.testText1Question1Title);
    });

    await performCommonActions();

    it('Performing action "add" on "texts"', async function() {
      // Navigate back to Project Page
      await browser.driver.navigate().back();
      await browser.driver.navigate().back();
      await expect<any>(projectPage.notice.list.count()).toBe(0);
      await projectPage.addNewText(constants.testText3Title, projectPage.testData.simpleUsx1);
      await projectPage.notice.waitToInclude('The text \'' + constants.testText3Title + '\' was added successfully');
      await projectPage.notice.firstCloseButton.click();
    });

    it('Performing action \'add\' on \'questions\'', async function() {
      await browser.driver.navigate().forward();
      expect<any>(await textPage.notice.list.count()).toBe(0);
      await textPage.addNewQuestion(constants.testText1Question3Title, constants.testText1Question3Summary);
      await textPage.notice.waitToInclude('\'' + constants.testText1Question3Summary + '\' was added successfully');
      await textPage.notice.firstCloseButton.click();
    });

    it('Get existing user count', async function() {
      // Navigate back to Project Page
      await browser.driver.navigate().back();

      await projectSettingsPage.clickOnSettingsLink();
      await projectSettingsPage.membersTab.list.count().then((val: number) => { memberCount = val; });
    });

    it('Performing action \'add\' on \'users\'', async function() {
      await projectSettingsPage.membersTab.addNewMember('jimmycricket');
      await projectSettingsPage.membersTab.waitForNewUserToLoad(memberCount);
      expect<any>(await projectSettingsPage.membersTab.list.count()).toBe(memberCount + 1);

      // Return back to Question Page for rest of test.
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      await SfProjectPage.textLink(constants.testText1Title).click();
      await SfTextPage.clickOnQuestion(constants.testText1Question1Title);
    });

    it('Navigate to Activity Page to verify actions', async function() {
      await activityPage.get();

      // Print everything in the activity list for debugging purposes
      // activityPage.printActivitiesNames();
    });

    it('Verify action \'add\' on \'users\' appears on the activity feed', async function() {
      activityIndex = 0;
      const activityText = await activityPage.getActivityText(activityIndex);
      expect<any>(activityText).toContain('jimmycricket is now a member of ' + constants.testProjectName);
    });

    it('Verify action \'add\' on \'questions\' appears on the activity feed', async function() {
      activityIndex += 1;
      const activityText = await activityPage.getActivityText(activityIndex);
      expect<any>(activityText).toContain(constants.testText1Title);
      expect<any>(activityText).toContain('new question');
      expect<any>(activityText).toContain(constants.testText1Question3Summary);
    });

    it('Verify action \'add\' on \'texts\' appears on the activity feed', async function() {
      activityIndex += 1;
      const activityText = await activityPage.getActivityText(activityIndex);
      expect<any>(activityText).toContain(constants.testProjectName);
      expect<any>(activityText).toContain('added');
      expect<any>(activityText).toContain(constants.testText3Title);
    });

    await verifyCommonActions(3, constants.managerUsername);

    await verifyFilters(constants.managerUsername);

  });

  async function setResponseVisibility(value: any) {
    await loginPage.loginAsManager();
    await projectSettingsPage.get(constants.testProjectName);
    await projectSettingsPage.tabs.project.click();
    await projectSettingsPage.projectTab.setCheckbox(projectSettingsPage.projectTab.usersSeeEachOthersResponses, value);
    await projectSettingsPage.projectTab.saveButton.click();
  }

  async function verifyResponseVisibility(valueShouldBeTrue: boolean) {
    await projectSettingsPage.get(constants.testProjectName);
    await projectSettingsPage.tabs.project.click();
    const isChecked = await projectSettingsPage.projectTab.usersSeeEachOthersResponses.getAttribute('checked');
    if (valueShouldBeTrue) {
      expect<any>(isChecked).toBeTruthy();
    } else {
      expect<any>(isChecked).toBeFalsy();
    }
  }

  // TODO: That's not a great description
  describe('Testing activity-visibility settings: ', function() {
    it('Set response visibility to TRUE', function() {
      setResponseVisibility(true);
      verifyResponseVisibility(true);
    });

    describe('Running as first member: ', async function() {

      it('Login and navigate to the first test Question page', async function() {
        await loginPage.loginAsUser();
        await projectListPage.get();
        await projectListPage.clickOnProject(constants.testProjectName);
        SfProjectPage.textLink(constants.testText1Title).click();
        await SfTextPage.clickOnQuestion(constants.testText1Question1Title);
      });

      await performCommonActions();

      it('Navigate to Activity Page to verify actions', async function() {
        await activityPage.get();

        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });

      activityIndex = await verifyCommonActions(activityIndex, constants.memberUsername);

      await verifyFilters(constants.memberUsername);

    });

    describe('Running as second member: ', async function() {

      it('Login and navigate to the first test Question page', async function() {
        await loginPage.loginAsSecondUser();
        await projectListPage.get();
        await projectListPage.clickOnProject(constants.testProjectName);
        SfProjectPage.textLink(constants.testText1Title).click();
        await SfTextPage.clickOnQuestion(constants.testText1Question1Title);
      });

      await performCommonActions();

      it('Navigate to Activity Page to verify actions', async function() {
        await activityPage.get();

        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });

      activityIndex = await verifyCommonActions(activityIndex, constants.member2Username);

      await verifyFilters(constants.member2Username);

    });

    it('Set response visibility to FALSE', async function() {
      setResponseVisibility(false);
      verifyResponseVisibility(false);
    });

    describe('Running as first member with visibility false: ', async function() {

      it('Login and navigate to the first test Question page', async function() {
        await loginPage.loginAsUser();
        await projectListPage.get();
        await projectListPage.clickOnProject(constants.testProjectName);
        SfProjectPage.textLink(constants.testText1Title).click();
        await SfTextPage.clickOnQuestion(constants.testText1Question1Title);
      });

      await performAnswerActions();

      it('Navigate to Activity Page to verify actions', async function() {
        await activityPage.get();

        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });

      await verifyAnswerActions(activityIndex, constants.memberUsername);

      await verifyFilters(constants.memberUsername);

    });

    describe('Running as second member with visibility false: ', async function() {

      it('Login and navigate to the first test Question page', async function() {
        await loginPage.loginAsSecondUser();
        await projectListPage.get();
        await projectListPage.clickOnProject(constants.testProjectName);
        SfProjectPage.textLink(constants.testText1Title).click();
        await SfTextPage.clickOnQuestion(constants.testText1Question1Title);
      });

      await performAnswerActions();

      it('Navigate to Activity Page to verify actions', async function() {
        await activityPage.get();

        // Print everything in the activity list for debugging purposes
        // activityPage.printActivitiesNames();
      });

      // We don't call verifyCommonActions here,
      // because the activity list should be empty for user 2  // NOPE.

      await verifyAnswerActions(activityIndex, constants.member2Username);

      await verifyFilters(constants.member2Username);

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

    it('Set response visibility to TRUE for other tests', async function() {
      setResponseVisibility(true);
      verifyResponseVisibility(true);
    });
  });

  async function performUpvoteActions() {
    it('Performing action \'upvote\' on \'answers\'', async function() {
      expect<any>(questionPage.answers.votes(0).getText()).toEqual('0');
      await questionPage.answers.upvote(0);
      expect<any>(questionPage.answers.votes(0).getText()).toEqual('1');
    });

    it('Performing action \'downvote\' on \'answers\'', async function() {
      await questionPage.answers.downvote(0);
      expect<any>(questionPage.answers.votes(0).getText()).toEqual('0');
    });
  }

  function performAnswerActions() {
    it('Performing action \'add\' on \'answers\'', async function() {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.answers.add(testData.answer.add);
      expect<any>(questionPage.answers.last().getText()).toContain(testData.answer.add);
      await questionPage.notice.waitToInclude('The answer was submitted successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'addToLastAnswer\' on \'comments\'', async function() {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.comments.addToLastAnswer(testData.comment.add);
      expect<any>(questionPage.comments.last().getText()).toContain(testData.comment.add);
      await questionPage.notice.waitToInclude('The comment was submitted successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'edit\' on \'comments\'', async function() {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.comments.edit(testData.comment.edit);
      expect<any>(questionPage.comments.last().getText()).toContain(testData.comment.edit);
      await questionPage.notice.waitToInclude('The comment was updated successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'edit\' on \'answers\'', async function() {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      questionPage.answers.edit(testData.answer.edit);
      expect<any>(questionPage.answers.last().getText()).toContain(testData.answer.edit);
      await questionPage.notice.waitToInclude('The answer was updated successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'delete\' on \'comments\'', async function() {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      const oldCount = questionPage.comments.list.count();
      questionPage.comments.archive('');
      const newCount = await questionPage.comments.list.count();
      await oldCount.then((count: number) => {
      expect<any>(newCount).toEqual(count - 1);
      });

      await questionPage.notice.waitToInclude('The comment was removed successfully');
      questionPage.notice.firstCloseButton.click();
    });

    it('Performing action \'delete\' on \'answers\'', async function() {
      expect<any>(questionPage.notice.list.count()).toBe(0);
      await questionPage.answers.list.count().then(async(count: number) => {
      questionPage.answers.archive('');
      const newCount = questionPage.answers.list.count();
      expect<any>(newCount).toEqual(count - 1);

        // Which means newCount > 0 -- but oldCount is a real int, while newCount is still a promise
        if (count > 1) {
          await expect<any>(questionPage.answers.last().getText()).toContain(constants.testText1Question1Answer);
        }

        await questionPage.notice.waitToInclude('The answer was removed successfully');
        questionPage.notice.firstCloseButton.click();
      });
    });
  }

  async function performCommonActions() {
    // perform up vote first because it occasionally posts activity before a task started after it
    await performUpvoteActions();
    await performAnswerActions();
  }

  async function verifyUpvoteActions(aIndex: number, username: string) {
    it('Verify action \'upvote\' on \'answers\' appears on the activity feed', async function() {
      aIndex += 1;
      const regex = new RegExp('.*' + Utils.escapeRegExp(username + ' +1\'d your answer') + '.*' +
      await Utils.escapeRegExp(constants.testText1Question1Title));
      expect<any>(await activityPage.getAllActivityTexts()).toContainMultilineMatch(regex);
    });

    return aIndex;
  }

  function verifyAnswerActions(aIndex: number, username: string) {
    it('Verify action \'edit\' on \'answers\' appears on the activity feed', async function() {
      const regex = new RegExp('.*' + Utils.escapeRegExp(username) + ' updated their answer.*' +
      await Utils.escapeRegExp(testData.answer.edit));
      expect<any>(await activityPage.getAllActivityTexts()).toContainMultilineMatch(regex);
    });

    it('Verify action \'edit\' on \'comments\' appears on the activity feed', async function() {
      aIndex += 1;

      const regex = new RegExp('.*' + Utils.escapeRegExp(username) + ' updated their comment.*' +
      await Utils.escapeRegExp(testData.answer.add) + '.*' + Utils.escapeRegExp(testData.comment.edit));
      expect<any>(await activityPage.getAllActivityTexts()).toContainMultilineMatch(regex);
    });

    it('Verify action \'addToLastAnswer\' on \'comments\' appears on the activity feed', async function() {
      aIndex += 1;

      const regex = new RegExp('.*' + Utils.escapeRegExp(username) + ' commented.*' +
      await Utils.escapeRegExp(testData.answer.add) + '.*' + Utils.escapeRegExp(testData.comment.add));
      expect<any>(await activityPage.getAllActivityTexts()).toContainMultilineMatch(regex);
    });

    it('Verify action \'add\' on \'answers\' appears on the activity feed', async function() {
      aIndex += 1;
      const regex = new RegExp('.*' + Utils.escapeRegExp(username) + ' answered.*' +
      await Utils.escapeRegExp(testData.answer.add));
      expect<any>(await activityPage.getAllActivityTexts()).toContainMultilineMatch(regex);
    });

    return aIndex;
  }

  async function verifyCommonActions(aIndex: number, username: string) {
    aIndex = await verifyAnswerActions(aIndex, username);
    return await verifyUpvoteActions(aIndex, username);
  }

  async function verifyFilters(username: string) {
    it('Verify filters work on the activity page', async function() {
      await activityPage.get();
      await activityPage.activitiesList.filter((item: ElementFinder) => {
        // Look for activity items that do not contain our username
        return (item.getText().then((text: string) => {
          return text.indexOf(username) === -1;
        }));
      }).then(async(activityItems: ElementFinder[]) => {
        // Currently in "All Activity" mode, so should see items without our username
        expect<any>(await activityItems.length).toBeGreaterThan(0);
      });

      // Show only my activity
      await SfActivityPage.clickOnShowOnlyMyActivity();
      await activityPage.activitiesList.filter((item: ElementFinder) => {
        // Look for activity items that do not contain our username
        return (item.getText().then((text: string) => {
          return text.indexOf(username) === -1;
        }));
      }).then(async(activityItems: ElementFinder[]) => {
        // Currently in "Only My Activity" mode, so should see NO items without our username
        await expect<any>(activityItems.length).toEqual(0);
      });

      // Show all activity
      await SfActivityPage.clickOnAllActivity();
      await activityPage.activitiesList.filter((item: ElementFinder) => {
        // Look for activity items that do not contain our username
        return (item.getText().then((text: string) => {
          return text.indexOf(username) === -1;
        }));
      }).then(async(activityItems: ElementFinder[]) => {
        // Currently in "All Activity" mode, so should see items without our username
        expect<any>(await activityItems.length).toBeGreaterThan(0);
      });
    });
  }

});
