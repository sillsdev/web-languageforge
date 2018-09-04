import {browser, ExpectedConditions} from 'protractor';

import {SfAppFrame} from '../../bellows/shared/app.frame';
import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {ProjectsPage} from '../../bellows/shared/projects.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectSettingsPage} from './shared/project-settings.page';
import {SfProjectPage} from './shared/project.page';
import {SfTextPage} from './shared/text.page';

describe('SFChecks E2E the project dashboard AKA text list page', () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const util = new Utils();
  const appFrame = new SfAppFrame();
  const projectListPage = new ProjectsPage();
  const projectPage = new SfProjectPage();
  const projectSettingsPage = new SfProjectSettingsPage();
  const questionListPage = new SfTextPage();

  /*
  describe('project member/user', () => {
    it('setup: logout, login as project member, go to project dashboard', () => {
      loginPage.logout();
      loginPage.loginAsMember();
        projectListPage.get();
        projectListPage.clickOnProject(constants.testProjectName);
    });
    it('lists existing texts', () => {
      expect(projectPage.textNames.count()).toBeGreaterThan(1);
    });

    it('can click through to a questions page', () => {
      projectPage.textLink(constants.testText1Title).click();
      expect(questionListPage.questionNames.count()).toBeGreaterThan(0);
      browser.navigate().back();
    });
    it('cannot click on settings', () => {
      expect(projectPage.settingsDropdownLink.isDisplayed()).toBe(false);
    });
    it('does not have access to the invite-a-friend button', () => {
      // Note that the test project has been created with allowInviteAFriend = false
      expect(projectPage.invite.showFormButton.isDisplayed()).toBe(false);
    });
  });
  */

  describe('project manager', async () => {
    const sampleTitle = '111textTitle12345';

    it('setup: logout, login as project manager, go to project dashboard', async () => {
      await BellowsLoginPage.logout();
      await loginPage.loginAsManager();
      await projectListPage.get();
      await projectListPage.clickOnProject(constants.testProjectName);
    });

    it('has access to the invite-a-friend button', async () => {
      await expect<any>(projectPage.invite.showFormButton.isDisplayed()).toBe(true);
    });

    it('can invite a friend to join the project', async () => {
      await projectPage.invite.showFormButton.click();
      await projectPage.invite.emailInput.sendKeys('nobody@example.com');
      await projectPage.invite.sendButton.click();

      // TODO: Should we expect a success message to show up? Or an error message to *not* show up?
      await appFrame.checkMsg('An invitation email has been sent to nobody@example.com', 'success');
    });

    it('can click on settings button', async () => {
      await expect<any>(projectPage.settingsDropdownLink.isDisplayed()).toBe(true);
      // Not sure if passing an empty string is the best way, but it works. -Ben Kastner 2018-01-19
      await projectSettingsPage.get(constants.testProjectName);
      await browser.navigate().back();
    });

    it('lists existing texts', async () => {
      await expect(projectPage.textNames.count()).toBeGreaterThan(1);
    });

    it('can click through to a questions page', async () => {
      await SfProjectPage.textLink(constants.testText1Title).click();
      await expect(questionListPage.questionRows.count()).toBeGreaterThan(0);
      await browser.navigate().back();
    });

    it('can create a new text (input text area)', async () => {
      await expect<any>(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
      await projectPage.newText.showFormButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(projectPage.newText.title), constants.conditionTimeout);
      await projectPage.newText.title.sendKeys(sampleTitle);
      await projectPage.newText.usx.sendKeys(projectPage.testData.simpleUsx1);
      await projectPage.newText.saveButton.click();
      await expect<any>(SfProjectPage.textLink(sampleTitle).isDisplayed()).toBe(true);
    });

    it('can click through to newly created text', async () => {
      await SfProjectPage.textLink(sampleTitle).click();
      await browser.navigate().back();
    });

    it('can archive the text that was just created', async () => {
      const archiveButton = projectPage.archiveTextButton.getWebElement();
      await expect<any>(archiveButton.isDisplayed()).toBe(true);
      await expect<any>(archiveButton.isEnabled()).toBe(false);
      await util.setCheckbox(projectPage.getFirstCheckbox(), true);
      await expect<any>(archiveButton.isEnabled()).toBe(true);
      await archiveButton.click();
      await Utils.clickModalButton('Archive');

      // Wait for archive button to become disabled again
      await browser.wait(async () => {
        return await archiveButton.isEnabled().then( bool => {
          return !bool;
        });
      }, 1000);

      await expect<any>(archiveButton.isEnabled()).toBe(false);
      await expect<any>(SfProjectPage.textLink(sampleTitle).isPresent()).toBe(false);
    });

    it('can re-publish the text that was just archived (Project Settings)', async () => {
      // Not sure if passing an empty string is the best way, but it works. -Ben Kastner 2018-01-19
      await projectSettingsPage.get(constants.testProjectName);
      await projectSettingsPage.tabs.archiveTexts.click();
      await expect<any>(projectSettingsPage.archivedTextsTab.textLink(sampleTitle).isDisplayed()).toBe(true);
      const publishButton = projectSettingsPage.archivedTextsTab.publishButton.getWebElement();
      await expect<any>(publishButton.isDisplayed()).toBe(true);
      await expect<any>(publishButton.isEnabled()).toBe(false);
      await util.setCheckbox(projectSettingsPage.archivedTextsTabGetFirstCheckbox(), true);
      await expect<any>(publishButton.isEnabled()).toBe(true);
      await publishButton.click();
      await expect<any>(projectSettingsPage.archivedTextsTab.textLink(sampleTitle).isPresent()).toBe(false);
      await expect<any>(publishButton.isEnabled()).toBe(false);
      await browser.navigate().back();
      await expect<any>(SfProjectPage.textLink(sampleTitle).isDisplayed()).toBe(true);
    });

    // CJH: I am avoiding testing creating a new text using the file dialog for importing a USX file
    // according to
    // http://stackoverflow.com/questions/8851051/selenium-webdriver-and-browsers-select-file-dialog
    // you can have selenium interact with the file dialog by sending keystrokes but this is highly
    // OS dependent
    // it('can create a new text (file dialog)', () => {});

    it('can use the chapter trimmer to trim the USX when creating a new text', async () => {
      const newTextTitle = sampleTitle + '6789'; // Don't re-use title from an existing text
      await expect<any>(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
      await projectPage.newText.showFormButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(projectPage.newText.title), constants.conditionTimeout);
      await projectPage.newText.title.sendKeys(newTextTitle);
      await Utils.sendText(projectPage.newText.usx, projectPage.testData.longUsx1);
      await projectPage.newText.verseRangeLink.click();
      await browser.wait(ExpectedConditions.visibilityOf(projectPage.newText.fromChapter), constants.conditionTimeout);
      await projectPage.newText.fromChapter.sendKeys('1');
      await projectPage.newText.fromVerse.sendKeys('1');
      await projectPage.newText.toChapter.sendKeys('1');
      await projectPage.newText.toVerse.sendKeys('3');
      await projectPage.newText.saveButton.click();
      await expect<any>(SfProjectPage.textLink(newTextTitle).isDisplayed()).toBe(true);
      await SfProjectPage.textLink(newTextTitle).click();
      await expect(questionListPage.textContent.getText()).not.toMatch('/Cana of Galilee/');
      await browser.navigate().back();

      // clean up the text
      await util.setCheckbox(projectPage.getFirstCheckbox(), true);
      const archiveButton = projectPage.archiveTextButton.getWebElement();
      await archiveButton.click();
      await Utils.clickModalButton('Archive');
    });

  });

});
