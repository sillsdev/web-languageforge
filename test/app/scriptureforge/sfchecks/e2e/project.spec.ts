import {browser, ExpectedConditions} from 'protractor';

import {SfAppFrame} from '../../../bellows/pages/appFrame';
import {BellowsLoginPage} from '../../../bellows/pages/loginPage';
import {ProjectsPage} from '../../../bellows/pages/projectsPage';
import {Utils} from '../../../bellows/pages/utils';
import {SfProjectPage} from '../pages/projectPage';
import {SfProjectSettingsPage} from '../pages/projectSettingsPage';
import {SfTextPage} from '../pages/textPage';

describe('the project dashboard AKA text list page', () => {
  const constants       = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const util = new Utils();
  const appFrame = new SfAppFrame();
  const projectListPage = new ProjectsPage();
  const projectPage = new SfProjectPage();
  const projectSettingsPage = new SfProjectSettingsPage();
  const questionListPage = new SfTextPage();

  /*
  describe('project member/user', function() {
    it('setup: logout, login as project member, go to project dashboard', function() {
      loginPage.logout();
      loginPage.loginAsMember();
        projectListPage.get();
        projectListPage.clickOnProject(constants.testProjectName);
    });
    it('lists existing texts', function() {
      expect(projectPage.textNames.count()).toBeGreaterThan(1);
    });

    it('can click through to a questions page', function() {
      projectPage.textLink(constants.testText1Title).click();
      expect(questionListPage.questionNames.count()).toBeGreaterThan(0);
      browser.navigate().back();
    });
    it('cannot click on settings', function() {
      expect(projectPage.settingsDropdownLink.isDisplayed()).toBe(false);
    });
    it('does not have access to the invite-a-friend button', function() {
      // Note that the test project has been created with allowInviteAFriend = false
      expect(projectPage.invite.showFormButton.isDisplayed()).toBe(false);
    });
  });
  */

  describe('project manager', () => {
    const sampleTitle = '111textTitle12345';

    it('setup: logout, login as project manager, go to project dashboard', () => {
      loginPage.logout();
      loginPage.loginAsManager();
      projectListPage.get();
      projectListPage.clickOnProject(constants.testProjectName);
    });

    it('has access to the invite-a-friend button', () => {
      expect<any>(projectPage.invite.showFormButton.isDisplayed()).toBe(true);
    });

    it('can invite a friend to join the project', () => {
      projectPage.invite.showFormButton.click();
      projectPage.invite.emailInput.sendKeys('nobody@example.com');
      projectPage.invite.sendButton.click();

      // TODO: Should we expect a success message to show up? Or an error message to *not* show up?
      appFrame.checkMsg('An invitation email has been sent to nobody@example.com', 'success');
    });

    it('can click on settings button', () => {
      expect<any>(projectPage.settingsDropdownLink.isDisplayed()).toBe(true);
      // Not sure if passing an empty string is the best way, but it works. -Ben Kastner 2018-01-19
      projectSettingsPage.get();
      browser.navigate().back();
    });

    it('lists existing texts', () => {
      expect(projectPage.textNames.count()).toBeGreaterThan(1);
    });

    it('can click through to a questions page', () => {
      projectPage.textLink(constants.testText1Title).click();
      expect(questionListPage.questionRows.count()).toBeGreaterThan(0);
      browser.navigate().back();
    });

    it('can create a new text (input text area)', () => {
      expect<any>(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
      projectPage.newText.showFormButton.click();
      browser.wait(ExpectedConditions.visibilityOf(projectPage.newText.title), constants.conditionTimeout);
      projectPage.newText.title.sendKeys(sampleTitle);
      projectPage.newText.usx.sendKeys(projectPage.testData.simpleUsx1);
      projectPage.newText.saveButton.click();
      expect<any>(projectPage.textLink(sampleTitle).isDisplayed()).toBe(true);
    });

    it('can click through to newly created text', () => {
      projectPage.textLink(sampleTitle).click();
      browser.navigate().back();
    });

    it('can archive the text that was just created', () => {
      const archiveButton = projectPage.archiveTextButton.getWebElement();
      expect<any>(archiveButton.isDisplayed()).toBe(true);
      expect<any>(archiveButton.isEnabled()).toBe(false);
      util.setCheckbox(projectPage.getFirstCheckbox(), true);
      expect<any>(archiveButton.isEnabled()).toBe(true);
      archiveButton.click();
      util.clickModalButton('Archive');

      // Wait for archive button to become disabled again
      browser.wait(() => {
        return archiveButton.isEnabled().then( bool => {
          return !bool;
        });
      }, 1000);

      expect<any>(archiveButton.isEnabled()).toBe(false);
      expect<any>(projectPage.textLink(sampleTitle).isPresent()).toBe(false);
    });

    it('can re-publish the text that was just archived (Project Settings)', () => {
      // Not sure if passing an empty string is the best way, but it works. -Ben Kastner 2018-01-19
      projectSettingsPage.get('');
      projectSettingsPage.tabs.archiveTexts.click();
      expect<any>(projectSettingsPage.archivedTextsTab.textLink(sampleTitle).isDisplayed()).toBe(true);
      const publishButton = projectSettingsPage.archivedTextsTab.publishButton.getWebElement();
      expect<any>(publishButton.isDisplayed()).toBe(true);
      expect<any>(publishButton.isEnabled()).toBe(false);
      util.setCheckbox(projectSettingsPage.archivedTextsTabGetFirstCheckbox(), true);
      expect<any>(publishButton.isEnabled()).toBe(true);
      publishButton.click();
      expect<any>(projectSettingsPage.archivedTextsTab.textLink(sampleTitle).isPresent()).toBe(false);
      expect<any>(publishButton.isEnabled()).toBe(false);
      browser.navigate().back();
      expect<any>(projectPage.textLink(sampleTitle).isDisplayed()).toBe(true);
    });

    // CJH: I am avoiding testing creating a new text using the file dialog for importing a USX file
    // according to
    // http://stackoverflow.com/questions/8851051/selenium-webdriver-and-browsers-select-file-dialog
    // you can have selenium interact with the file dialog by sending keystrokes but this is highly
    // OS dependent
    // it('can create a new text (file dialog)', function() {});

    it('can use the chapter trimmer to trim the USX when creating a new text', () => {
      const newTextTitle = sampleTitle + '6789'; // Don't re-use title from an existing text
      expect<any>(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
      projectPage.newText.showFormButton.click();
      browser.wait(ExpectedConditions.visibilityOf(projectPage.newText.title), constants.conditionTimeout);
      projectPage.newText.title.sendKeys(newTextTitle);
      util.sendText(projectPage.newText.usx, projectPage.testData.longUsx1);
      projectPage.newText.verseRangeLink.click();
      browser.wait(ExpectedConditions.visibilityOf(projectPage.newText.fromChapter), constants.conditionTimeout);
      projectPage.newText.fromChapter.sendKeys('1');
      projectPage.newText.fromVerse.sendKeys('1');
      projectPage.newText.toChapter.sendKeys('1');
      projectPage.newText.toVerse.sendKeys('3');
      projectPage.newText.saveButton.click();
      expect<any>(projectPage.textLink(newTextTitle).isDisplayed()).toBe(true);
      projectPage.textLink(newTextTitle).click();
      expect(questionListPage.textContent.getText()).not.toMatch('/Cana of Galilee/');
      browser.navigate().back();

      // clean up the text
      util.setCheckbox(projectPage.getFirstCheckbox(), true);
      const archiveButton = projectPage.archiveTextButton.getWebElement();
      archiveButton.click();
      util.clickModalButton('Archive');
    });

  });

});
