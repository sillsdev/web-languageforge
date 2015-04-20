'use strict';

/* This is called globally; it can be un-commented if this test is run individually. IJH 2014-06
afterEach(function() {
  var appFrame = require('../../../bellows/pages/appFrame.js');
  expect(appFrame.errorMessage.isPresent()).toBe(false);
});
*/

describe('the project settings page - project manager', function() {
  var constants     = require('../../../testConstants.json');
  var loginPage     = require('../../../bellows/pages/loginPage.js');
  var util       = require('../../../bellows/pages/util.js');
  var projectListPage = require('../../../bellows/pages/projectsPage.js');
  var header       = require('../../../bellows/pages/pageHeader.js');
  var projectPage   = require('../pages/projectPage.js');
  var textPage     = require('../pages/textPage.js');
  var page       = require('../pages/textSettingsPage.js');
  
  it('setup: logout, login as project manager, go to text settings', function() {
    loginPage.logout();
    loginPage.loginAsManager();
    projectListPage.get();
    projectListPage.clickOnProject(constants.testProjectName);
    projectPage.textLink(constants.testText1Title).click();
    textPage.textSettingsBtn.click();
  });
  
  describe('edit text tab', function() {

    it('setup: click on tab', function() {
      expect(page.tabs.editText.isPresent()).toBe(true);
      page.tabs.editText.click();
    });
    
    it('can edit text content', function() {
      // TODO: Use actual USX from projectPage.testData (maybe move it to testConstants) for this test, then verify it shows up properly on the question page
      page.editTextTab.contentEditor.sendKeys('Hello, world!');
      page.editTextTab.letMeEditLink.click();
      // Should pop up two alerts in a row
      // First alert: "This is dangerous, are you sure?"
      util.checkModalTextMatches('Caution: Editing the USX text can be dangerous');
      util.clickModalButton('Edit');
      // Second alert: "You have previous edits which will be replaced, are you really sure?"
      util.checkModalTextMatches('Caution: You had previous edits in the USX text box');
      util.clickModalButton('Replace');
      // TODO: Check alert text for one or both alerts (see http://stackoverflow.com/a/19884387/2314532)
      expect(page.editTextTab.contentEditor.getAttribute('value')).toBe(constants.testText1Content);
    });
      
  });

  // The Archived Questions tab is tested as part of a process in the Text (Questions) page tests. IJH 2014-06
  
  describe('audio file tab - NYI', function() {
  });

  describe('paratext export tab', function() {

    it('setup: click on tab', function() {
      expect(page.tabs.paratextExport.isPresent()).toBe(true);
      page.tabs.paratextExport.click();
    });
    
    it('get a message since there are not messages flagged for export', function() {
      expect(page.paratextExportTab.exportAnswers.getAttribute('checked')).toBeTruthy;
      expect(page.paratextExportTab.exportComments.getAttribute('checked')).toBeFalsy();
      expect(page.paratextExportTab.exportFlagged.getAttribute('checked')).toBeTruthy;
      expect(page.paratextExportTab.downloadButton.isDisplayed()).toBe(false);
      expect(page.paratextExportTab.prepareButton.isPresent()).toBe(true);
      page.paratextExportTab.prepareButton.click();
      expect(page.paratextExportTab.noExportMsg.isDisplayed()).toBe(true);
    });

    it('can prepare export for all answers without comments', function() {
      page.paratextExportTab.exportFlagged.click();
      page.paratextExportTab.prepareButton.click();
      expect(page.paratextExportTab.answerCount.isDisplayed()).toBe(true);
      expect(page.paratextExportTab.answerCount.getText()).toEqual("2 answer(s)");
      expect(page.paratextExportTab.commentCount.isDisplayed()).toBe(false);
      expect(page.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
    });
    
    it('can prepare export for all answers with comments', function() {
      page.paratextExportTab.exportComments.click();
      page.paratextExportTab.prepareButton.click();
      expect(page.paratextExportTab.answerCount.isDisplayed()).toBe(true);
      expect(page.paratextExportTab.answerCount.getText()).toEqual("2 answer(s)");
      expect(page.paratextExportTab.commentCount.isDisplayed()).toBe(true);
      expect(page.paratextExportTab.commentCount.getText()).toEqual("2 comment(s)");
      expect(page.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
    });
    
  });

});
