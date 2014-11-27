'use strict';

var NewLexProjectPage = function() {
  this.get = function() {
    browser.get('/app/new-lexicon-project');
  };
  
  this.newLexProjectForm = element('form#newLexProjectForm');
  this.projectNameInput = element(by.model('newProject.projectName'));
  this.projectCodeInput = element(by.model('newProject.projectCode'));
  this.projectCodeLoading = element(by.id('projectCodeLoading'));
  this.projectCodeExists = element(by.id('projectCodeExists'));
  this.projectCodeAlphanumeric = element(by.id('projectCodeAlphanumeric'));
  this.projectCodeOk = element(by.id('projectCodeOk'));
  this.editProjectCodeCheckbox = element(by.model('newProject.editProjectCode'));
  this.nextButton = element(by.id('nextButton'));
  this.noticeList  = element.all(by.repeater('notice in notices()'));
};

module.exports = new NewLexProjectPage();
