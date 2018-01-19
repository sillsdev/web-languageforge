import {} from 'jasmine';
import {$, $$, browser, by, By, element, ExpectedConditions} from 'protractor';
import { BellowsLoginPage } from '../../../bellows/pages/loginPage.js';
import { ProjectsPage } from '../../../bellows/pages/projectsPage.js';
import { SfProjectPage } from '../pages/projectPage.js';
import { SfQuestionPage } from '../pages/questionPage.js';
import { SfTextPage } from '../pages/textPage.js';
import { SfTextSettingsPage } from '../pages/textSettingsPage.js';
import { Utils } from '../../../bellows/pages/utils.js';

describe('the question page', () => {
  const constants       = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const util = new Utils();
  const projectListPage = new ProjectsPage();
  const projectPage = new SfProjectPage();
  const textPage = new SfTextPage();
  const textSettingsPage = new SfTextSettingsPage();
  const questionPage = new SfQuestionPage();
  const CONDITION_TIMEOUT = 3000;

  describe('a normal user', () => {

    it('setup: login as normal user', () => {
      loginPage.loginAsMember();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      projectPage.textLink(constants.testText1Title).click();
      textPage.questionLink(constants.testText1Question1Title).click();
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
      projectPage.textLink(constants.testText1Title).click();
      textPage.questionLink(constants.testText1Question1Title).click();
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
        textPage.clickTextSettingsButton();

        textSettingsPage.tabs.paratextExport.click();
      });

      it('can prepare export for answers flagged for export without comments', () => {
        expect(textSettingsPage.paratextExportTab.exportAnswers.getAttribute('checked'))
          .toBeTruthy();
        expect(textSettingsPage.paratextExportTab.exportComments.getAttribute('checked'))
          .toBeFalsy();
        expect(textSettingsPage.paratextExportTab.exportFlagged.getAttribute('checked'))
          .toBeTruthy();
        expect<any>(textSettingsPage.paratextExportTab.prepareButton.isPresent()).toBe(true);
        textSettingsPage.paratextExportTab.prepareButton.click();
        browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.paratextExportTab.answerCount),
          CONDITION_TIMEOUT);
        expect<any>(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
        expect<any>(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual('1');
        expect<any>(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(false);
        expect<any>(textSettingsPage.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
      });

      it('can prepare export for answers flagged for export with comments', () => {
        textSettingsPage.paratextExportTab.exportComments.click();
        textSettingsPage.paratextExportTab.prepareButton.click();
        browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.paratextExportTab.answerCount),
          CONDITION_TIMEOUT);
        expect<any>(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
        expect<any>(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual('1');
        expect<any>(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(true);
        expect<any>(textSettingsPage.paratextExportTab.commentCount.getText()).toEqual('1');
        expect<any>(textSettingsPage.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
      });

    });

  });

  describe('a system admin', () => {
    it('setup: login as admin', () => {
      loginPage.loginAsAdmin();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      projectPage.textLink(constants.testText1Title).click();
      textPage.questionLink(constants.testText1Question1Title).click();
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
