import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../../bellows/pages/loginPage';
import {ProjectsPage} from '../../../bellows/pages/projectsPage';
import {Utils} from '../../../bellows/pages/utils';
import {SfProjectPage} from '../pages/projectPage';
import {SfTextPage} from '../pages/textPage';
import {SfTextSettingsPage} from '../pages/textSettingsPage';

describe('the questions settings page - project manager', () => {
  const constants = require('../../../testConstants');
  const loginPage = new BellowsLoginPage();
  const util = new Utils();
  const projectListPage =  new ProjectsPage();
  const projectPage = new SfProjectPage();
  const textPage = new SfTextPage();
  const page = new SfTextSettingsPage();

  it('setup: logout, login as project manager, go to text settings', () => {
    loginPage.logout();
    loginPage.loginAsManager();
    projectListPage.get();
    projectListPage.clickOnProject(constants.testProjectName);
    projectPage.textLink(constants.testText1Title).click();
    textPage.clickTextSettingsButton();
  });

  describe('edit text tab', () => {

    it('setup: click on tab', () => {
      expect<any>(page.tabs.editText.isPresent()).toBe(true);
      page.tabs.editText.click();
    });

    it('can edit text content', () => {
      // TODO: Use actual USX from projectPage.testData (maybe move it to testConstants) for this
      // test, then verify it shows up properly on the question page
      page.editTextTab.contentEditor.sendKeys('Hello, world!');
      page.editTextTab.letMeEditLink.click();

      // Should pop up two alerts in a row
      // First alert: "This is dangerous, are you sure?"
      util.checkModalTextMatches('Caution: Editing the USX text can be dangerous');
      util.clickModalButton('Edit');

      // Second alert: "You have previous edits which will be replaced, are you really sure?"
      util.checkModalTextMatches('Caution: You had previous edits in the USX text box');
      util.clickModalButton('Replace');

      // TODO: Check alert text for one or both alerts (http://stackoverflow.com/a/19884387/2314532)
      expect(page.editTextTab.contentEditor.getAttribute('value')).toBe(constants.testText1Content);
    });

  });

  // The Archived Questions tab is tested as part of a process in the Text (Questions) page tests.
  // IJH 2014-06

  describe('audio file tab - NYI', () => {
  });

  describe('paratext export tab', () => {

    it('setup: click on tab', () => {
      expect<any>(page.tabs.paratextExport.isPresent()).toBe(true);
      page.tabs.paratextExport.click();
    });

    it('get a message since there are not messages flagged for export', () => {
      expect(page.paratextExportTab.exportAnswers.getAttribute('checked')).toBeTruthy();
      expect(page.paratextExportTab.exportComments.getAttribute('checked')).toBeFalsy();
      expect(page.paratextExportTab.exportFlagged.getAttribute('checked')).toBeTruthy();
      expect<any>(page.paratextExportTab.downloadPT7Button.isPresent()).toBe(true);
      page.paratextExportTab.downloadPT7Button.click();
      browser.wait(ExpectedConditions.visibilityOf(page.paratextExportTab.noExportMsg), constants.conditionTimeout);
      expect<any>(page.paratextExportTab.noExportMsg.isDisplayed()).toBe(true);
    });

    it('can prepare export for all answers without comments', () => {
      page.paratextExportTab.exportFlagged.click();
      page.paratextExportTab.downloadPT7Button.click();
      browser.wait(ExpectedConditions.visibilityOf(page.paratextExportTab.answerCount), constants.conditionTimeout);
      expect<any>(page.paratextExportTab.answerCount.isDisplayed()).toBe(true);
      expect<any>(page.paratextExportTab.answerCount.getText()).toEqual('2');
      expect<any>(page.paratextExportTab.commentCount.isDisplayed()).toBe(false);
    });

    it('can prepare export for all answers with comments', () => {
      page.paratextExportTab.exportComments.click();
      page.paratextExportTab.downloadPT7Button.click();
      browser.wait(ExpectedConditions.visibilityOf(page.paratextExportTab.answerCount), constants.conditionTimeout);
      expect<any>(page.paratextExportTab.answerCount.isDisplayed()).toBe(true);
      expect<any>(page.paratextExportTab.answerCount.getText()).toEqual('2');
      expect<any>(page.paratextExportTab.commentCount.isDisplayed()).toBe(true);
      expect<any>(page.paratextExportTab.commentCount.getText()).toEqual('2');
    });

  });

});
