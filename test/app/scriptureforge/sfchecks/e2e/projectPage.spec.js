'use strict';

describe('the project dashboard AKA text list page', function() {
  var constants       = require('../../../testConstants.json');
  var loginPage       = require('../../../bellows/pages/loginPage.js');
  var util         = require('../../../bellows/pages/util.js');
  var appFrame       = require('../../../bellows/pages/appFrame.js');
  var projectListPage   = require('../../../bellows/pages/projectsPage.js');
  var projectPage     = require('../pages/projectPage.js');
  var projectSettingsPage = require('../pages/projectSettingsPage.js');
  var questionListPage   = require('../pages/textPage.js');

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

  describe('project manager', function() {
    var sampleTitle = '111textTitle12345';
    it('setup: logout, login as project manager, go to project dashboard', function() {
      loginPage.logout();
      loginPage.loginAsManager();
        projectListPage.get();
        projectListPage.clickOnProject(constants.testProjectName);
    });

    it('has access to the invite-a-friend button', function() {
      expect(projectPage.invite.showFormButton.isDisplayed()).toBe(true);
    });

    it('can invite a friend to join the project', function() {
      projectPage.invite.showFormButton.click();
      projectPage.invite.emailInput.sendKeys('nobody@example.com');
      projectPage.invite.sendButton.click();
      // TODO: Should we expect() a success message to show up? Or an error message to *not* show up?
      appFrame.checkMsg("An invitation email has been sent to nobody@example.com", "success");
    });

    it('can click on settings button', function() {
      expect(projectPage.settingsDropdownLink.isDisplayed()).toBe(true);
      projectSettingsPage.get();
      browser.navigate().back();
    });

    it('lists existing texts', function() {
      expect(projectPage.textNames.count()).toBeGreaterThan(1);
    });

    it('can click through to a questions page', function() {
      projectPage.textLink(constants.testText1Title).click();
      expect(questionListPage.questionNames.count()).toBeGreaterThan(0);
      browser.navigate().back();
    });
    
    it('can create a new text (input text area)', function() {
      expect(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
      projectPage.newText.showFormButton.click();
      projectPage.newText.title.sendKeys(sampleTitle);
      projectPage.newText.usx.sendKeys(projectPage.testData.simpleUsx1);
      projectPage.newText.saveButton.click();
      expect(projectPage.textLink(sampleTitle).isDisplayed()).toBe(true);
    });
    
    it('can click through to newly created text', function() {
      projectPage.textLink(sampleTitle).click();
      browser.navigate().back();
    });
    
    it('can archive the text that was just created', function() {
      var archiveButton = projectPage.archiveTextButton.getWebElement();
      expect(archiveButton.isDisplayed()).toBe(true);
      expect(archiveButton.isEnabled()).toBe(false);
      util.setCheckbox(projectPage.getFirstCheckbox(), true);
      expect(archiveButton.isEnabled()).toBe(true);
      archiveButton.click();
      util.clickModalButton('Archive');
      // Wait for archive button to become disabled again
      browser.wait(function() {
        return archiveButton.isEnabled().then(function(bool) {
          return !bool;
        });
      }, 1000);
      expect(archiveButton.isEnabled()).toBe(false);
      expect(projectPage.textLink(sampleTitle).isPresent()).toBe(false);
    });

    it('can re-publish the text that was just archived (Project Settings)', function() {
      projectSettingsPage.get();
      projectSettingsPage.tabs.archiveTexts.click();
      expect(projectSettingsPage.archivedTextsTab.textLink(sampleTitle).isDisplayed()).toBe(true);
      var publishButton = projectSettingsPage.archivedTextsTab.publishButton.getWebElement();
      expect(publishButton.isDisplayed()).toBe(true);
      expect(publishButton.isEnabled()).toBe(false);
      util.setCheckbox(projectSettingsPage.archivedTextsTabGetFirstCheckbox(), true);
      expect(publishButton.isEnabled()).toBe(true);
      publishButton.click();
      expect(projectSettingsPage.archivedTextsTab.textLink(sampleTitle).isPresent()).toBe(false);
      expect(publishButton.isEnabled()).toBe(false);
      browser.navigate().back();
      expect(projectPage.textLink(sampleTitle).isDisplayed()).toBe(true);
    });
    
    // I am avoiding testing creating a new text using the file dialog for importing a USX file... - cjh
    // according to http://stackoverflow.com/questions/8851051/selenium-webdriver-and-browsers-select-file-dialog
    // you can have selenium interact with the file dialog by sending keystrokes but this is highly OS dependent
    //it('can create a new text (file dialog)', function() {});
    
    it('can use the chapter trimmer to trim the USX when creating a new text', function() {
      var newTextTitle = sampleTitle + '6789'; // Don't re-use title from an existing text
      expect(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
      projectPage.newText.showFormButton.click();
      projectPage.newText.title.sendKeys(newTextTitle);
      util.sendText(projectPage.newText.usx, projectPage.testData.longUsx1);
      projectPage.newText.verseRangeLink.click();
      projectPage.newText.fromChapter.sendKeys('1');
      projectPage.newText.fromVerse.sendKeys('1');
      projectPage.newText.toChapter.sendKeys('1');
      projectPage.newText.toVerse.sendKeys('3');
      projectPage.newText.saveButton.click();
      expect(projectPage.textLink(newTextTitle).isDisplayed()).toBe(true);
      projectPage.textLink(newTextTitle).click();
      expect(questionListPage.textContent.getText()).not.toMatch('/Cana of Galilee/');
      browser.navigate().back();

      // clean up the text
      util.setCheckbox(projectPage.getFirstCheckbox(), true);
      var archiveButton = projectPage.archiveTextButton.getWebElement();
      archiveButton.click();
      util.clickModalButton('Archive');
    });
  });
});
