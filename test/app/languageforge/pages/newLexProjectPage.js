'use strict';

var NewLexProjectPage = function() {
  var mockUpload = require('../../bellows/pages/mockUploadElement.js'),
      modal      = require('./lexModals.js');
  
  this.get = function() {
    browser.get('/app/new-lexicon-project');
  };
  
  // form controls
  this.newLexProjectForm = element('form#newLexProjectForm');
  this.progressIndicatorStep3Label = element(by.binding('progressIndicatorStep3Label'));
  this.nextButton = element(by.id('nextButton'));
  this.noticeList = element.all(by.repeater('notice in notices()'));
  
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
  this.initialDataPage.emptyProjectCheckbox = element(by.model('newProject.emptyProjectDesired'));
  this.initialDataPage.browseButton = element(by.id('browseButton'));
  this.initialDataPage.mockUpload = mockUpload;
  
  // step 3: verify data
  this.verifyDataPage = {};
  this.verifyDataPage.lexiconButton = element(by.id('lexiconButton'));
  this.verifyDataPage.entriesImported = element(by.binding('newProject.entriesImported'));
  
  // step 3 alternate: primary language
  this.primaryLanguagePage = {};
  this.primaryLanguagePage.selectButton = element(by.id('selectLanguageButton'));
  
  // select language modal
  this.modal = modal;
  
};

module.exports = new NewLexProjectPage();
