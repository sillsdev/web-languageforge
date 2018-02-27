import {browser, by, ExpectedConditions} from 'protractor';
import { BellowsLoginPage } from '../../../bellows/pages/loginPage';
import { ProjectsPage } from '../../../bellows/pages/projectsPage';
import { Utils} from '../../../bellows/pages/utils';
import { SfProjectPage } from '../pages/projectPage';
import { SfTextPage} from '../pages/textPage';
import { SfTextSettingsPage } from '../pages/textSettingsPage';

const loginPage = new BellowsLoginPage();
const util = new Utils();
const projectListPage = new ProjectsPage();
const projectPage = new SfProjectPage();
const textPage = new SfTextPage();
const textSettingsPage = new SfTextSettingsPage();

// tslint:disable-next-line:no-var-requires
const constants = require('../../../testConstants');
const CONDITION_TIMEOUT = 3000;

describe('the questions list page (AKA the text page)', () => {

  describe('a normal user', () => {
    it('setup: login as normal user', () => {
      loginPage.loginAsMember();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      projectPage.textLink(constants.testText1Title).click();
    });

    it('can see questions, with answer counts and responses for each question', () => {
      // Setup script creates two questions. Since we can't count on them being in specific
      // positions as that might be modified by other tests that add questions, we'll search for
      // them.
      util.findRowByText(textPage.questionRows, constants.testText1Question1Title).then((row) => {
        expect<any>(typeof row === 'undefined').toBeFalsy();
        const answerCount = row.element(by.binding('question.answerCount'));
        const responseCount = row.element(by.binding('question.responseCount'));
        expect<any>(answerCount.getText()).toBe('1');
        expect<any>(responseCount.getText()).toBe('2');
      });

      util.findRowByText(textPage.questionRows, constants.testText1Question2Title).then((row) => {
        expect<any>(typeof row === 'undefined').toBeFalsy();
        const answerCount = row.element(by.binding('question.answerCount'));
        const responseCount = row.element(by.binding('question.responseCount'));
        expect<any>(answerCount.getText()).toBe('1');
        expect<any>(responseCount.getText()).toBe('2');

      });
    });

    it('cannot archive questions', () => {
      expect<any>(textPage.archiveButton.isDisplayed()).toBeFalsy();
    });

    it('cannot create templates', () => {
      expect<any>(textPage.makeTemplateBtn.isDisplayed()).toBeFalsy();
    });

    it('cannot add new questions', () => {
      expect<any>(textPage.addNewBtn.isDisplayed()).toBeFalsy();
    });

    it('cannot edit text settings', () => {
      expect<any>(textPage.textSettingsBtn.isDisplayed()).toBeFalsy();
    });
  });

  describe('a project manager', () => {
    const questionTitle = '111TestQTitle1234';
    const questionDesc = '111TestQDesc1234';

    it('setup: login as manager', () => {
      loginPage.loginAsManager();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      projectPage.textLink(constants.testText1Title).click();
    });

    it('can add new questions', () => {
      expect<any>(textPage.addNewBtn.isDisplayed()).toBeTruthy();
      textPage.addNewQuestion(questionDesc, questionTitle);
      expect<any>(textPage.questionLink(questionTitle).isDisplayed()).toBe(true);
    });

    it('can click through to newly created question', () => {
      textPage.questionLink(questionTitle).click();
      browser.navigate().back();
    });

    it('can archive the question that was just created', () => {
      const archiveButton = textPage.archiveButton.getWebElement();
      expect<any>(archiveButton.isDisplayed()).toBe(true);
      expect<any>(archiveButton.isEnabled()).toBe(false);
      util.setCheckbox(textPage.getFirstCheckbox(), true);
      expect<any>(archiveButton.isEnabled()).toBe(true);
      archiveButton.click();
      util.clickModalButton('Archive');

      // Wait for archive button to become disabled again
      browser.wait(() => {
        return archiveButton.isEnabled().then((isEnabled) => {
          return !isEnabled;
        });
      }, 1000);

      expect<any>(textPage.questionLink(questionTitle).isPresent()).toBe(false);
    });

    it('can re-publish the question that was just archived (Text Settings)', () => {
      textPage.clickTextSettingsButton();
      browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.tabs.archiveQuestions),
        CONDITION_TIMEOUT);
      textSettingsPage.tabs.archiveQuestions.click();
      browser.wait(ExpectedConditions.visibilityOf(textSettingsPage.archivedQuestionsTab
          .questionLink(questionTitle)), CONDITION_TIMEOUT);
      expect<any>(textSettingsPage.archivedQuestionsTab.questionLink(questionTitle).isDisplayed())
        .toBe(true);
      const publishButton = textSettingsPage.archivedQuestionsTab.publishButton.getWebElement();
      expect<any>(publishButton.isDisplayed()).toBe(true);
      expect<any>(publishButton.isEnabled()).toBe(false);
      util.setCheckbox(textSettingsPage.archivedQuestionsTabGetFirstCheckbox(), true);
      expect<any>(publishButton.isEnabled()).toBe(true);
      publishButton.click();
      expect<any>(textSettingsPage.archivedQuestionsTab.questionLink(questionTitle).isPresent())
        .toBe(false);
      expect<any>(publishButton.isEnabled()).toBe(false);
      browser.navigate().back();
      expect<any>(textPage.questionLink(questionTitle).isDisplayed()).toBe(true);
    });

    it('can delete questions', () => {
      expect<any>(textPage.archiveButton.isDisplayed()).toBeTruthy();
    });

    it('can create templates', () => {
      expect<any>(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
    });

    it('can edit text settings', () => {
      // The text settings button should both exist and be displayed for a manager
      expect<any>(textPage.textSettingsBtn.isPresent()).toBeTruthy();
      expect<any>(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
    });

  });

  describe('a system admin', () => {
    it('setup: login as admin', () => {
      loginPage.loginAsAdmin();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
      projectPage.textLink(constants.testText1Title).click();
    });

    it('can add new questions', () => {
      expect<any>(textPage.addNewBtn.isDisplayed()).toBeTruthy();
    });

    it('can delete questions', () => {
      expect<any>(textPage.archiveButton.isDisplayed()).toBeTruthy();
    });

    it('can create templates', () => {
      expect<any>(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
    });

    it('can edit text settings', () => {
      // The text settings button should both exist and be displayed for a site admin
      expect<any>(textPage.textSettingsBtn.isPresent()).toBeTruthy();
      expect<any>(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
    });

  });
});
