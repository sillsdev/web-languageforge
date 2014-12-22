'use strict';

var NewLexProjectPage = function() {
  var mockUpload = require('../../bellows/pages/mockUploadElement.js'),
      modal      = require('./lexModals.js'),
      _this      = this;
  
  this.get = function() {
    browser.get('/app/new-lexicon-project');
  };
  
  // form controls
  this.noticeList = element.all(by.repeater('notice in notices()'));
  this.newLexProjectForm = element('form#newLexProjectForm');
  this.progressIndicatorStep3Label = element(by.binding('progressIndicatorStep3Label'));
  this.backButton = element(by.id('backButton'));
  this.nextButton = function nextButton() {
    return element(by.id('nextButton'));
  };
  this.expectFormIsValid = function expectFormIsValid() {
    expect(_this.nextButton().getAttribute('class')).toContain('btn-success');
  };
  this.expectFormIsNotValid = function expectFormIsNotValid() {
    expect(_this.nextButton().getAttribute('class')).not.toContain('btn-success');
  };
  this.formStatus = element(by.id('form-status'));
  this.formStatus.expectHasNoError = function expectHasNoError() {
    expect(_this.formStatus.getAttribute('class')).not.toContain('alert');
  };
  this.formStatus.expectContainsError = function expectContainsError(partialMsg) {
    if (! partialMsg) partialMsg = '';
    expect(_this.formStatus.getAttribute('class')).toContain('alert-error');
    expect(_this.formStatus.getText()).toContain(partialMsg);
  };
  
  /**
   * Taken from https://github.com/angular/protractor/issues/1555
   * [clickWhenClickable This function fire click() on an element inside and Angular component, only when the element is really clickable. Should solve error 'Element is not clickable at point (x,y)' when other non-angular elements are overlapped.]
   * @param  {[ElementFinder]} element [Element to be clicked.]
   * @return {[!webdriver.promise.Promise.<T>]}         [Promise fulfilled with true when the click on the element has been achieved without errors.]
   */
  this.clickWhenClickable = function(element) {
    return browser.wait(function() {
      return element.click().then(
        function() {
          return true;
        },
        function() {
          console.log('not clickable');
          return false;
        });
    });
  };
  
  // step 1: project name
  this.namePage = {};
  this.namePage.projectNameInput = element(by.model('newProject.projectName'));
  this.namePage.projectCodeInput = element(by.model('newProject.projectCode'));
  this.namePage.projectCodeLoading = element(by.id('projectCodeLoading'));
  this.namePage.projectCodeExists = element(by.id('projectCodeExists'));
  this.namePage.projectCodeAlphanumeric = element(by.id('projectCodeAlphanumeric'));
  this.namePage.projectCodeOk = element(by.id('projectCodeOk'));
  this.namePage.editProjectCodeCheckbox = element(by.model('newProject.editProjectCode'));
  
  // step 2: initial data
  this.initialDataPage = {};
  this.initialDataPage.browseButton = element(by.id('browseButton'));
  this.initialDataPage.mockUpload = mockUpload;
  
  // step 3: verify data
  this.verifyDataPage = {};
  this.verifyDataPage.entriesImported = element(by.binding('newProject.entriesImported'));
  
  // step 3 alternate: primary language
  this.primaryLanguagePage = {};
  this.primaryLanguagePage.selectButton = element(by.id('selectLanguageButton'));
  
  // select language modal
  this.modal = modal;
  
};

module.exports = new NewLexProjectPage();
