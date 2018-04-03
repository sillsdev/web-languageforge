import {browser, by, element, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {ProjectsPage} from '../../bellows/shared/projects.page';
import {SfProjectPage} from './shared/project.page';
import {SfQuestionPage} from './shared/question.page';
import {SfTextSettingsPage} from './shared/text-settings.page';
import {SfTextPage} from './shared/text.page';

describe('SFChecks E2E the question page', () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectListPage = new ProjectsPage();
  const textSettingsPage = new SfTextSettingsPage();
  const questionPage = new SfQuestionPage();

  describe('a normal user', () => {

    it('setup: login as normal user', () => {
      loginPage.loginAsMember();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      SfTextPage.questionLink(constants.testText1Question1Title).click();
    });

    it('cannot edit question settings - NYI', () => {
    });

    it('cannot edit comment - NYI', () => {
    });

    it('cannot delete comment - NYI', () => {
    });

    it('cannot tag answer - NYI', () => {
    });

    it('cannot edit answer - NYI', () => {
    });

    it('cannot delete answer - NYI', () => {
    });

    it('cannot flag answer for export', () => {
      expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
      expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
    });

  });

  describe('a project manager', () => {

    it('setup: login as manager', () => {
      loginPage.loginAsManager();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      SfTextPage.questionLink(constants.testText1Question1Title).click();
    });

    it('can edit question settings - NYI', () => {
    });

    it('can edit comment - NYI', () => {
    });

    it('can delete comment - NYI', () => {
    });

    it('can tag answer - NYI', () => {
    });

    it('can edit answer - NYI', () => {
    });

    it('can delete answer - NYI', () => {
    });

    it('can flag answer for export', () => {
      expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
      expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBe(true);
      questionPage.answers.flags.lastButtonClear().click();
      expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBe(true);
      expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
    });

    describe('paratext export of flagged answer', () => {

      it('setup: back to Text, click settings, click on tab', () => {

        // click on breadcrumb text title to go back one
        element(by.linkText(constants.testText1Title)).click();

        // click on text settings
        SfTextPage.clickTextSettingsButton();

        textSettingsPage.tabs.paratextExport.click();
      });

      it('can prepare export for answers flagged for export without comments', () => {
        expect(textSettingsPage.paratextExportTab.exportAnswers.getAttribute('checked')).toBeTruthy();
        expect(textSettingsPage.paratextExportTab.exportComments.getAttribute('checked')).toBeFalsy();
        expect(textSettingsPage.paratextExportTab.exportFlagged.getAttribute('checked')).toBeTruthy();
        expect<any>(textSettingsPage.paratextExportTab.downloadPT7Button.isPresent()).toBe(true);
        expect<any>(textSettingsPage.paratextExportTab.downloadPT8Button.isPresent()).toBe(true);
        textSettingsPage.paratextExportTab.downloadPT7Button.click();
        browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.paratextExportTab.answerCount),
          constants.conditionTimeout);
        expect<any>(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
        expect<any>(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual('1');
        expect<any>(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(false);
      });

      it('can prepare export for answers flagged for export with comments', () => {
        textSettingsPage.paratextExportTab.exportComments.click();
        textSettingsPage.paratextExportTab.downloadPT7Button.click();
        browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.paratextExportTab.answerCount),
          constants.conditionTimeout);
        expect<any>(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
        expect<any>(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual('1');
        expect<any>(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(true);
        expect<any>(textSettingsPage.paratextExportTab.commentCount.getText()).toEqual('1');
      });

    });

  });

  describe('a system admin', () => {
    it('setup: login as admin', () => {
      loginPage.loginAsAdmin();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      SfProjectPage.textLink(constants.testText1Title).click();
      SfTextPage.questionLink(constants.testText1Question1Title).click();
    });

    it('can edit question settings - NYI', () => {
    });

    it('can edit comment - NYI', () => {
    });

    it('can delete comment - NYI', () => {
    });

    it('can tag answer - NYI', () => {
    });

    it('can edit answer - NYI', () => {
    });

    it('can delete answer - NYI', () => {
    });

    it('can flag answer for export', () => {
      expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBe(true);
      expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
      questionPage.answers.flags.lastButtonSet().click();
      expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
      expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBe(true);
    });

  });

});
