import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {ProjectsPage} from '../../bellows/shared/projects.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectPage} from './shared/project.page';
import {SfTextSettingsPage} from './shared/text-settings.page';
import {SfTextPage} from './shared/text.page';

describe('SFChecks E2E the questions settings page - project manager', async () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectListPage =  new ProjectsPage();
  const page = new SfTextSettingsPage();

  it('setup: logout, login as project manager, go to text settings', async () => {
    await BellowsLoginPage.logout();
    await loginPage.loginAsManager();
    await projectListPage.get();
    await projectListPage.clickOnProject(constants.testProjectName);
    await SfProjectPage.textLink(constants.testText1Title).click();
    await SfTextPage.clickTextSettingsButton();
  });

  describe('edit text tab', async () => {

    it('setup: click on tab', async () => {
      await expect<any>(page.tabs.editText.isPresent()).toBe(true);
      await page.tabs.editText.click();
    });

    it('can edit text content', async () => {
      // TODO: Use actual USX from projectPage.testData (maybe move it to testConstants) for this
      // test, then verify it shows up properly on the question page
      await page.editTextTab.contentEditor.sendKeys('Hello, world!');
      await page.editTextTab.letMeEditLink.click();

      // Should pop up two alerts in a row
      // First alert: "This is dangerous, are you sure?"
      await Utils.checkModalTextMatches('Caution: Editing the USX text can be dangerous');
      await Utils.clickModalButton('Edit');

      // Second alert: "You have previous edits which will be replaced, are you really sure?"
      await Utils.checkModalTextMatches('Caution: You had previous edits in the USX text box');
      await Utils.clickModalButton('Replace');

      // TODO: Check alert text for one or both alerts (http://stackoverflow.com/a/19884387/2314532)
      await expect(page.editTextTab.contentEditor.getAttribute('value')).toBe(constants.testText1Content);
    });

  });

  // The Archived Questions tab is tested as part of a process in the Text (Questions) page tests.
  // IJH 2014-06

  describe('audio file tab - NYI', async () => {
  });

  describe('paratext export tab', async () => {

    it('setup: click on tab', async () => {
      await expect<any>(page.tabs.paratextExport.isPresent()).toBe(true);
      await page.tabs.paratextExport.click();
    });

    it('get a message since there are not messages flagged for export', async () => {
      await expect(page.paratextExportTab.exportAnswers.getAttribute('checked')).toBeTruthy();
      await expect(page.paratextExportTab.exportComments.getAttribute('checked')).toBeFalsy();
      await expect(page.paratextExportTab.exportFlagged.getAttribute('checked')).toBeTruthy();
      await expect<any>(page.paratextExportTab.downloadPT7Button.isPresent()).toBe(true);
      await page.paratextExportTab.downloadPT7Button.click();
      await browser.wait(ExpectedConditions.visibilityOf(page.paratextExportTab.noExportMsg),
        constants.conditionTimeout);
      await expect<any>(page.paratextExportTab.noExportMsg.isDisplayed()).toBe(true);
    });

    it('can prepare export for all answers without comments', async () => {
      await page.paratextExportTab.exportFlagged.click();
      await page.paratextExportTab.downloadPT7Button.click();
      await browser.wait(ExpectedConditions.visibilityOf(page.paratextExportTab.answerCount),
        constants.conditionTimeout);
      await expect<any>(page.paratextExportTab.answerCount.isDisplayed()).toBe(true);
      await expect<any>(page.paratextExportTab.answerCount.getText()).toEqual('2');
      await expect<any>(page.paratextExportTab.commentCount.isDisplayed()).toBe(false);
    });

    it('can prepare export for all answers with comments', async () => {
      await page.paratextExportTab.exportComments.click();
      await page.paratextExportTab.downloadPT7Button.click();
      await browser.wait(ExpectedConditions.visibilityOf(page.paratextExportTab.answerCount),
        constants.conditionTimeout);
      await expect<any>(page.paratextExportTab.answerCount.isDisplayed()).toBe(true);
      await expect<any>(page.paratextExportTab.answerCount.getText()).toEqual('2');
      await expect<any>(page.paratextExportTab.commentCount.isDisplayed()).toBe(true);
      await expect<any>(page.paratextExportTab.commentCount.getText()).toEqual('2');
    });

  });

});
