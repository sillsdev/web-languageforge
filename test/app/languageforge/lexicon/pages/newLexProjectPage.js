'use strict';

module.exports = new NewLexProjectPage();

function NewLexProjectPage() {
  var mockUpload = require('../../../bellows/pages/mockUploadElement.js');
  var modal      = require('./lexModals.js');

  this.get = function get() {
    browser.get(browser.baseUrl + '/app/lexicon/new-project');
  };

  // form controls
  this.noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  this.firstNoticeCloseButton = this.noticeList.first().element(by.partialButtonText('×'));
  this.newLexProjectForm = element(by.id('newLexProjectForm'));
  this.progressIndicatorStep3Label = element(by.binding('progressIndicatorStep3Label'));
  this.backButton = element(by.id('backButton'));
  this.nextButton = element(by.id('nextButton'));

  this.expectFormIsValid = function expectFormIsValid() {
    expect(this.nextButton.getAttribute('class')).toMatch(/btn-primary(?:\s|$)/);
  };

  this.expectFormIsNotValid = function expectFormIsNotValid() {
    expect(this.nextButton.getAttribute('class')).not.toMatch(/btn-primary(?:\s|$)/);
  };

  this.formStatus = element(by.id('form-status'));
  this.formStatus.expectHasNoError = function () {
    expect(this.formStatus.getAttribute('class')).not.toContain('alert');
  }.bind(this);

  this.formStatus.expectContainsError = function (partialMsg) {
    if (!partialMsg) partialMsg = '';
    expect(this.formStatus.getAttribute('class')).toContain('alert-danger');
    expect(this.formStatus.getText()).toContain(partialMsg);
  }.bind(this);

  // step 0: chooser
  this.chooserPage = {
    sendReceiveButton: element(by.id('sendReceiveButton')),
    createButton: element(by.id('createButton'))
  };
  // step 1: send receive credentials
  this.srCredentialsPage = {
    loginInput: element(by.id('srUsername')),
    loginOk: element(by.id('usernameOk')),
    passwordInput: element(by.id('srPassword')),
    credentialsInvalid: element(by.id('credentialsInvalid')),
    passwordOk: element(by.id('passwordOk')),
    projectNoAccess: element(by.id('projectNoAccess')),
    projectOk: element(by.id('projectOk')),
    projectSelect: function () {
      return element(by.id('srProjectSelect'));
    }
  }

  // step 1: project name
  this.namePage = {
    projectNameInput: element(by.model('newProject.projectName')),
    projectCodeInput: element(by.model('newProject.projectCode')),
    projectCodeUneditableInput: element(by.binding('newProject.projectCode')),
    projectCodeLoading: element(by.id('projectCodeLoading')),
    projectCodeExists: element(by.id('projectCodeExists')),
    projectCodeAlphanumeric: element(by.id('projectCodeAlphanumeric')),
    projectCodeOk: element(by.id('projectCodeOk')),
    editProjectCodeCheckbox: element(by.model('newProject.editProjectCode'))
  };
  // step 2: initial data
  this.initialDataPage = {
    browseButton: element(by.id('browseButton')),
    mockUpload: mockUpload
  };
  // step 3: verify data
  this.verifyDataPage = {
    title: element(by.id('new-project-verify')),
    nonCriticalErrorsButton: element(by.id('nonCriticalErrorsButton')),
    entriesImported: element(by.binding('newProject.entriesImported')),
    importErrors: element(by.binding('newProject.importErrors'))
  };
  // step 3 alternate: primary language
  this.primaryLanguagePage = {
    selectButton: element(by.id('selectLanguageButton'))
  };
  // step 3 alternate: send receive clone
  this.srClonePage = {
    cloning: element(by.id('cloning'))
  };
  // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
  this.primaryLanguagePage.selectButtonClick = function () {
    this.primaryLanguagePage.selectButton.click();
    browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
  }.bind(this);

  // select language modal
  this.modal = modal;
}
