'use strict';

describe('E2E testing: New Lex Project app', function() {
  var constants = require('../../../testConstants.json'),
      loginPage = require('../../../bellows/pages/loginPage.js'),
      body      = require('../../../bellows/pages/pageBody.js'),
      util      = require('../../../bellows/pages/util.js'),
      dbePage   = require('../../pages/dbePage.js'),
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
      util.setCheckbox(page.namePage.editProjectCodeCheckbox, true);
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
      util.setCheckbox(page.namePage.editProjectCodeCheckbox, false);
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
      expect(page.progressIndicatorStep3Label.getText()).toEqual('Verify');
    });
  
    describe('Mock file upload', function() {
      
      it('cannot upload large file', function() {
        page.initialDataPage.mockUpload.enableButton.click();
        expect(page.initialDataPage.mockUpload.fileNameInput.isPresent()).toBe(true);
        expect(page.initialDataPage.mockUpload.fileNameInput.isDisplayed()).toBe(true);
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockZipImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(134217728);
        expect(page.noticeList.count()).toBe(0);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        expect(page.verifyDataPage.lexiconButton.isPresent()).toBe(false);
        expect(page.noticeList.count()).toBe(1);
        expect(page.noticeList.get(0).getText()).toContain('is too large. It must be smaller than');
        page.initialDataPage.mockUpload.fileNameInput.clear();
        page.initialDataPage.mockUpload.fileSizeInput.clear();
      });
    
      it('cannot upload jpg', function() {
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockJpgImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(constants.testMockJpgImportFile.size);
        expect(page.noticeList.count()).toBe(1);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        expect(page.verifyDataPage.lexiconButton.isPresent()).toBe(false);
        expect(page.noticeList.count()).toBe(2);
        expect(page.noticeList.get(1).getText()).toContain(constants.testMockJpgImportFile.name + ' is not an allowed compressed file. Ensure the file is');
        page.initialDataPage.mockUpload.fileNameInput.clear();
        page.initialDataPage.mockUpload.fileSizeInput.clear();
      });

      it('can upload zip file', function() {
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockZipImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(constants.testMockZipImportFile.size);
        expect(page.noticeList.count()).toBe(2);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect(page.verifyDataPage.lexiconButton.isDisplayed()).toBe(true);
        expect(page.noticeList.count()).toBe(3);
        expect(page.noticeList.get(2).getText()).toContain('Successfully imported ' + constants.testMockZipImportFile.name);
      });
    
    });
  
  });
  
  describe('Verify Data page', function() {
    
    it('displays stats', function() {
      expect(page.verifyDataPage.entriesImported.getText()).toEqual('2 entries were found in the initial data.');
    });
    
    it('can go to lexicon', function() {
      page.verifyDataPage.lexiconButton.click();
      expect(dbePage.browse.getEntryCount()).toBe(2);
    });
    
  });
  
  describe('Project Name page', function() {
    
    it('create: new empty project', function() {
      page.get();
      page.namePage.projectNameInput.sendKeys(constants.emptyProjectName + protractor.Key.TAB);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(false);
      expect(page.initialDataPage.browseButton.isPresent()).toBe(true);
    });
    
  });
  
  describe('Initial Data page skipping upload', function() {
    
    it('can skip uploading data', function() {
      expect(page.initialDataPage.emptyProjectCheckbox.isDisplayed()).toBe(true);
      expect(page.progressIndicatorStep3Label.getText()).toEqual('Verify');
      util.setCheckbox(page.initialDataPage.emptyProjectCheckbox, true);
      expect(page.initialDataPage.browseButton.isDisplayed()).toBe(false);
      expect(page.progressIndicatorStep3Label.getText()).toEqual('Language');
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
    });
  
  });
  
  describe('Primary Language page', function() {
    
    it('can select language', function() {
      expect(page.primaryLanguagePage.selectButton.isEnabled()).toBe(true);
      page.primaryLanguagePage.selectButton.click();
      expect(page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
    });
    
    describe('Select Language modal', function() {
      
      it('can search, select and add language', function() {
        var language = 'French';
        
        page.modal.selectLanguage.searchLanguageInput.sendKeys(language + protractor.Key.ENTER);
        expect(page.modal.selectLanguage.firstLanguageRow.isPresent()).toBe(true);
        
        expect(page.modal.selectLanguage.addButton.isPresent()).toBe(true);
        expect(page.modal.selectLanguage.addButton.isEnabled()).toBe(false);
        page.modal.selectLanguage.firstLanguageRow.click();
        expect(page.modal.selectLanguage.addButton.isEnabled()).toBe(true);
        expect(page.modal.selectLanguage.addButton.getText()).toEqual('Add ' + language);
        
        page.modal.selectLanguage.addButton.click();
        expect(page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
      });
      
    });
    
    it('can go to lexicon', function() {
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(dbePage.browse.getEntryCount()).toBe(0);
    });
    
  });

});
