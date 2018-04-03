import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {ProjectsPage} from '../../bellows/shared/projects.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectPage} from './shared/project.page';
import {SfTextSettingsPage} from './shared/text-settings.page';
import {SfTextPage} from './shared/text.page';

describe('SFChecks E2E the questions settings page - project manager', () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectListPage =  new ProjectsPage();
  const page = new SfTextSettingsPage();

  it('setup: logout, login as project manager, go to text settings', () => {
    BellowsLoginPage.logout();
    loginPage.loginAsManager();
    projectListPage.get();
    projectListPage.clickOnProject(constants.testProjectName);
    SfProjectPage.textLink(constants.testText1Title).click();
    SfTextPage.clickTextSettingsButton();
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
      Utils.checkModalTextMatches('Caution: Editing the USX text can be dangerous');
      Utils.clickModalButton('Edit');

      // Second alert: "You have previous edits which will be replaced, are you really sure?"
      Utils.checkModalTextMatches('Caution: You had previous edits in the USX text box');
      Utils.clickModalButton('Replace');

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
