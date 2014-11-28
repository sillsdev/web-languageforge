'use strict';

describe('E2E testing: New Lex Project app', function() {
  var constants = require('../../../testConstants.json'),
      loginPage = require('../../../bellows/pages/loginPage.js'),
      body      = require('../../../bellows/pages/pageBody.js'),
      page      = require('../../pages/newLexProjectPage.js');
  
  afterEach(function() {
    expect(body.phpError.isPresent()).toBe(false);
  });
  
  it('setup: login and page contains a user form', function() {
    loginPage.loginAsManager();
    page.get();
    expect(page.newLexProjectForm).toBeDefined();
    expect(page.namePage.projectNameInput.isPresent()).toBe(true);
  });
  
  describe('Project Name page', function() {
  
    it('cannot move on if name is invalid', function() {
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(true);
    });
    
    it('finds the test project already exists', function() {
      page.namePage.projectNameInput.sendKeys(constants.testProjectName + protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeInput.getAttribute('value')).toEqual(constants.testProjectCode);
      page.namePage.projectNameInput.clear();
    });
    
    it('with a cleared name does not show an error but is still invalid', function() {
      page.namePage.projectNameInput.sendKeys(protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(true);
    });
    
    it('can verify that an unused project name is available', function() {
      page.namePage.projectNameInput.sendKeys(constants.newProjectName + protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeInput.getAttribute('value')).toEqual(constants.newProjectCode);
    });
  
    it('can not edit project code by default', function() {
      expect(page.namePage.projectCodeInput.isDisplayed()).toBe(false);
    });
  
    it('can edit project code when enabled', function() {
      expect(page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
      page.namePage.editProjectCodeCheckbox.click();
      expect(page.namePage.projectCodeInput.isDisplayed()).toBe(true);
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('changed_new_project' + protractor.Key.TAB);
      expect(page.namePage.projectCodeInput.getAttribute('value')).toEqual('changed_new_project');
    });
  
    it('project code cannot be empty; does not show an error but is still invalid', function() {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectNameInput.sendKeys(protractor.Key.TAB);     // trigger project code check
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(true);
    });
  
    it('project code can be one character', function() {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('a' + protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
    });
  
    it('project code cannot be uppercase', function() {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('A' + protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('aB' + protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
    });
  
    it('project code cannot start with a number', function() {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('1' + protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
    });
  
    it('project code cannot use non-alphanumeric', function() {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('a?' + protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
    });
  
    it('project code reverts to default when Edit-project-code is disabled', function() {
      expect(page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
      page.namePage.editProjectCodeCheckbox.click();
      expect(page.namePage.projectCodeInput.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeInput.getAttribute('value')).toEqual(constants.newProjectCode);
    });
  
    it('can create project', function() {
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(false);
      expect(page.initialDataPage.browseButton.isPresent()).toBe(true);
    });
    
  });
  
  describe('Initial Data page with upload', function() {
    
    it('defaults to uploading data', function() {
      expect(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
    });
  
    it('can skip uploading data', function() {
      expect(page.initialDataPage.emptyProjectCheckbox.isDisplayed()).toBe(true);
      page.initialDataPage.emptyProjectCheckbox.click();
      expect(page.initialDataPage.browseButton.isDisplayed()).toBe(false);
      
      page.initialDataPage.emptyProjectCheckbox.click();
      expect(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
    });
    
    it('can mock file upload', function() {
      page.initialDataPage.useMockUploadButton.click();
      expect(page.initialDataPage.mockFileNameInput.isPresent()).toBe(true);
      expect(page.initialDataPage.mockFileNameInput.isDisplayed()).toBe(true);
      page.initialDataPage.mockFileNameInput.sendKeys(constants.testMockZipImportFile.name);
      page.initialDataPage.mockFileSizeInput.sendKeys(constants.testMockZipImportFile.size);
      page.initialDataPage.mockUploadButton.click();
      expect(page.verifyDataPage.lexiconButton.isDisplayed()).toBe(true);
    });
  
  });
  
});
