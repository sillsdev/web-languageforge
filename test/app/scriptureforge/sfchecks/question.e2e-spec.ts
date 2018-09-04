import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {ProjectsPage} from '../../bellows/shared/projects.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectPage} from './shared/project.page';
import {SfQuestionPage} from './shared/question.page';
import {SfTextSettingsPage} from './shared/text-settings.page';
import {SfTextPage} from './shared/text.page';

describe('SFChecks E2E the question page', async () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectListPage = new ProjectsPage();
  const textSettingsPage = new SfTextSettingsPage();
  const questionPage = new SfQuestionPage();

  describe('a normal user', async () => {

    it('setup: login as normal user', async () => {
      await loginPage.loginAsMember();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      await SfProjectPage.textLink(constants.testText1Title).click();
      await SfTextPage.questionLink(constants.testText1Question1Title).click();
    });

    it('cannot edit question settings - NYI', async () => {
    });

    it('cannot edit comment - NYI', async () => {
    });

    it('cannot delete comment - NYI', async () => {
    });

    it('cannot tag answer - NYI', async () => {
    });

    it('cannot edit answer - NYI', async () => {
    });

    it('cannot delete answer - NYI', async () => {
    });

    it('cannot flag answer for export', async () => {
      await expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
      await expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
    });

  });

  describe('a project manager', async () => {

    it('setup: login as manager', async () => {
      await loginPage.loginAsManager();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      await SfProjectPage.textLink(constants.testText1Title).click();
      await SfTextPage.questionLink(constants.testText1Question1Title).click();
    });

    it('can edit question settings - NYI', async () => {
    });

    it('can edit comment - NYI', async () => {
    });

    it('can delete comment - NYI', async () => {
    });

    it('can tag answer - NYI', async () => {
    });

    it('can edit answer - NYI', async () => {
    });

    it('can delete answer - NYI', async () => {
    });

    it('can flag answer for export', async () => {
      await expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
      await expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBe(true);
      await questionPage.answers.flags.lastButtonClear().click();
      await expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBe(true);
      await expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
    });

    describe('paratext export of flagged answer', async () => {

      it('setup: back to Text, click settings, click on tab', async () => {
        await Utils.clickBreadcrumb(constants.testText1Title);
        await SfTextPage.clickTextSettingsButton();
        await textSettingsPage.tabs.paratextExport.click();
      });

      it('can prepare export for answers flagged for export without comments', async () => {
        await expect(textSettingsPage.paratextExportTab.exportAnswers.getAttribute('checked')).toBeTruthy();
        await expect(textSettingsPage.paratextExportTab.exportComments.getAttribute('checked')).toBeFalsy();
        await expect(textSettingsPage.paratextExportTab.exportFlagged.getAttribute('checked')).toBeTruthy();
        await expect<any>(textSettingsPage.paratextExportTab.downloadPT7Button.isPresent()).toBe(true);
        await expect<any>(textSettingsPage.paratextExportTab.downloadPT8Button.isPresent()).toBe(true);
        await textSettingsPage.paratextExportTab.downloadPT7Button.click();
        await browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.paratextExportTab.answerCount),
          Utils.conditionTimeout);
        await expect<any>(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
        await expect<any>(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual('1');
        await expect<any>(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(false);
      });

      it('can prepare export for answers flagged for export with comments', async () => {
        await textSettingsPage.paratextExportTab.exportComments.click();
        await textSettingsPage.paratextExportTab.downloadPT7Button.click();
        await browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.paratextExportTab.answerCount),
          Utils.conditionTimeout);
        await expect<any>(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
        await expect<any>(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual('1');
        await expect<any>(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(true);
        await expect<any>(textSettingsPage.paratextExportTab.commentCount.getText()).toEqual('1');
      });

    });

  });

  describe('a system admin', async () => {
    it('setup: login as admin', async () => {
      await loginPage.loginAsAdmin();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
      await SfProjectPage.textLink(constants.testText1Title).click();
      await SfTextPage.questionLink(constants.testText1Question1Title).click();
    });

    it('can edit question settings - NYI', async () => {
    });

    it('can edit comment - NYI', async () => {
    });

    it('can delete comment - NYI', async () => {
    });

    it('can tag answer - NYI', async () => {
    });

    it('can edit answer - NYI', async () => {
    });

    it('can delete answer - NYI', async () => {
    });

    it('can flag answer for export', async () => {
      await expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBe(true);
      await expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
      await questionPage.answers.flags.lastButtonSet().click();
      await expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
      await expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBe(true);
    });

  });

});
