import {browser, by, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {ProjectsPage} from '../../bellows/shared/projects.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectPage} from './shared/project.page';
import {SfTextSettingsPage} from './shared/text-settings.page';
import {SfTextPage} from './shared/text.page';

describe('SFChecks E2E the questions list page (AKA the text page)', () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const util = new Utils();
  const projectListPage = new ProjectsPage();
  const textPage = new SfTextPage();
  const textSettingsPage = new SfTextSettingsPage();

  describe('a normal user', () => {
    it('setup: login as normal user', async () => {
      await loginPage.loginAsMember();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      await SfProjectPage.textLink(constants.testText1Title).click();
    });

    it('can see questions, with answer counts and responses for each question', async () => {
      // Setup script creates two questions. Since we can't count on them being in specific
      // positions as that might be modified by other tests that add questions, we'll search for
      // them.
      await util.findRowByText(textPage.questionRows, constants.testText1Question1Title).then(async row => {
        await expect<any>(typeof row === 'undefined').toBeFalsy();
        const answerCount = row.element(by.binding('question.answerCount'));
        const responseCount = row.element(by.binding('question.responseCount'));
        await expect<any>(answerCount.getText()).toBe('1');
        await expect<any>(responseCount.getText()).toBe('2');
      });

      await util.findRowByText(textPage.questionRows, constants.testText1Question2Title).then(async row => {
        await expect<any>(typeof row === 'undefined').toBeFalsy();
        const answerCount = row.element(by.binding('question.answerCount'));
        const responseCount = row.element(by.binding('question.responseCount'));
        await expect<any>(answerCount.getText()).toBe('1');
        await expect<any>(responseCount.getText()).toBe('2');

      });
    });

    it('cannot archive questions', async () => {
      await expect<any>(textPage.archiveButton.isDisplayed()).toBeFalsy();
    });

    it('cannot create templates', async () => {
      await expect<any>(textPage.makeTemplateBtn.isDisplayed()).toBeFalsy();
    });

    it('cannot add new questions', async () => {
      await expect<any>(textPage.addNewBtn.isDisplayed()).toBeFalsy();
    });

    it('cannot edit text settings', async () => {
      await expect<any>(textPage.textSettingsBtn.isDisplayed()).toBeFalsy();
    });
  });

  describe('a project manager', () => {
    const questionTitle = '111TestQTitle1234';
    const questionDesc = '111TestQDesc1234';

    it('setup: login as manager', async () => {
      await loginPage.loginAsManager();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      await SfProjectPage.textLink(constants.testText1Title).click();
    });

    it('can add new questions', async () => {
      await expect<any>(textPage.addNewBtn.isDisplayed()).toBeTruthy();
      await textPage.addNewQuestion(questionDesc, questionTitle);
      await expect<any>(SfTextPage.questionLink(questionTitle).isDisplayed()).toBe(true);
    });

    it('can click through to newly created question', async () => {
      await SfTextPage.questionLink(questionTitle).click();
      await browser.navigate().back();
    });

    it('can archive the question that was just created', async () => {
      const archiveButton = textPage.archiveButton.getWebElement();
      await expect<any>(archiveButton.isDisplayed()).toBe(true);
      await expect<any>(archiveButton.isEnabled()).toBe(false);
      await util.setCheckbox(textPage.getFirstCheckbox(), true);
      await expect<any>(archiveButton.isEnabled()).toBe(true);
      await archiveButton.click();
      await Utils.clickModalButton('Archive');

      // Wait for archive button to become disabled again
      await browser.wait(async () => {
        return await archiveButton.isEnabled().then(isEnabled => {
          return !isEnabled;
        });
      }, 1000);

      await expect<any>(SfTextPage.questionLink(questionTitle).isPresent()).toBe(false);
    });

    it('can re-publish the question that was just archived (Text Settings)', async () => {
      await SfTextPage.clickTextSettingsButton();
      await browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.tabs.archiveQuestions),
        constants.conditionTimeout);
      await textSettingsPage.tabs.archiveQuestions.click();
      await browser.wait(ExpectedConditions.visibilityOf(
        textSettingsPage.archivedQuestionsTab.questionLink(questionTitle)), constants.conditionTimeout);
      await expect<any>(textSettingsPage.archivedQuestionsTab.questionLink(questionTitle).isDisplayed()).toBe(true);
      const publishButton = textSettingsPage.archivedQuestionsTab.publishButton.getWebElement();
      await expect<any>(publishButton.isDisplayed()).toBe(true);
      await expect<any>(publishButton.isEnabled()).toBe(false);
      await util.setCheckbox(textSettingsPage.archivedQuestionsTabGetFirstCheckbox(), true);
      await expect<any>(publishButton.isEnabled()).toBe(true);
      await publishButton.click();
      await expect<any>(textSettingsPage.archivedQuestionsTab.questionLink(questionTitle).isPresent()).toBe(false);
      await expect<any>(publishButton.isEnabled()).toBe(false);
      await browser.navigate().back();
      await expect<any>(SfTextPage.questionLink(questionTitle).isDisplayed()).toBe(true);
    });

    it('can delete questions', async () => {
      await expect<any>(textPage.archiveButton.isDisplayed()).toBeTruthy();
    });

    it('can create templates', async () => {
      await expect<any>(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
    });

    it('can edit text settings', async () => {
      // The text settings button should both exist and be displayed for a manager
      await expect<any>(textPage.textSettingsBtn.isPresent()).toBeTruthy();
      await expect<any>(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
    });

  });

  describe('a system admin', () => {
    it('setup: login as admin', async () => {
      await loginPage.loginAsAdmin();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      await SfProjectPage.textLink(constants.testText1Title).click();
    });

    it('can add new questions', async () => {
      await expect<any>(textPage.addNewBtn.isDisplayed()).toBeTruthy();
    });

    it('can delete questions', async () => {
      await expect<any>(textPage.archiveButton.isDisplayed()).toBeTruthy();
    });

    it('can create templates', async () => {
      await expect<any>(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
    });

    it('can edit text settings', async () => {
      // The text settings button should both exist and be displayed for a site admin
      await expect<any>(textPage.textSettingsBtn.isPresent()).toBeTruthy();
      await expect<any>(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
    });

  });
});
