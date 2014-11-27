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
    expect(page.projectNameInput.isPresent()).toBe(true);
  });
  
  it('cannot move on if name is invalid', function() {
    expect(page.nextButton.isEnabled()).toBe(true);
    page.nextButton.click();
    expect(page.projectNameInput.isPresent()).toBe(true);
  });
  
  it('finds the test project already exists', function() {
    page.projectNameInput.sendKeys(constants.testProjectName + protractor.Key.TAB);
    expect(page.projectCodeExists.isDisplayed()).toBe(true);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(false);
    expect(page.projectCodeOk.isDisplayed()).toBe(false);
    expect(page.projectCodeInput.getAttribute('value')).toEqual(constants.testProjectCode);
    page.projectNameInput.clear();
  });
  
  it('with a cleared name does not show an error but is still invalid', function() {
    page.projectNameInput.sendKeys(protractor.Key.TAB);
    expect(page.projectCodeExists.isDisplayed()).toBe(false);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(false);
    expect(page.projectCodeOk.isDisplayed()).toBe(false);
    expect(page.nextButton.isEnabled()).toBe(true);
    page.nextButton.click();
    expect(page.projectNameInput.isPresent()).toBe(true);
  });
  
  it('can verify that an unused project name is available', function() {
    page.projectNameInput.sendKeys(constants.newProjectName + protractor.Key.TAB);
    expect(page.projectCodeExists.isDisplayed()).toBe(false);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(false);
    expect(page.projectCodeOk.isDisplayed()).toBe(true);
    expect(page.projectCodeInput.getAttribute('value')).toEqual(constants.newProjectCode);
  });

  it('can not edit project code by default', function() {
    expect(page.projectCodeInput.isDisplayed()).toBe(false);
  });

  it('can edit project code when enabled', function() {
    expect(page.editProjectCodeCheckbox.isDisplayed()).toBe(true);
    page.editProjectCodeCheckbox.click();
    expect(page.projectCodeInput.isDisplayed()).toBe(true);
    page.projectCodeInput.clear();
    page.projectCodeInput.sendKeys('changed_new_project' + protractor.Key.TAB);
    expect(page.projectCodeInput.getAttribute('value')).toEqual('changed_new_project');
  });

  it('project code cannot be empty; does not show an error but is still invalid', function() {
    page.projectCodeInput.clear();
    page.projectNameInput.sendKeys(protractor.Key.TAB);     // trigger project code check
    expect(page.projectCodeExists.isDisplayed()).toBe(false);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(false);
    expect(page.projectCodeOk.isDisplayed()).toBe(false);
    expect(page.nextButton.isEnabled()).toBe(true);
    page.nextButton.click();
    expect(page.projectNameInput.isPresent()).toBe(true);
  });

  it('project code can be one character', function() {
    page.projectCodeInput.clear();
    page.projectCodeInput.sendKeys('a' + protractor.Key.TAB);
    expect(page.projectCodeExists.isDisplayed()).toBe(false);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(false);
    expect(page.projectCodeOk.isDisplayed()).toBe(true);
  });

  it('project code cannot be uppercase', function() {
    page.projectCodeInput.clear();
    page.projectCodeInput.sendKeys('A' + protractor.Key.TAB);
    expect(page.projectCodeExists.isDisplayed()).toBe(false);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(true);
    expect(page.projectCodeOk.isDisplayed()).toBe(false);
    page.projectCodeInput.clear();
    page.projectCodeInput.sendKeys('aB' + protractor.Key.TAB);
    expect(page.projectCodeExists.isDisplayed()).toBe(false);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(true);
    expect(page.projectCodeOk.isDisplayed()).toBe(false);
  });

  it('project code cannot start with a number', function() {
    page.projectCodeInput.clear();
    page.projectCodeInput.sendKeys('1' + protractor.Key.TAB);
    expect(page.projectCodeExists.isDisplayed()).toBe(false);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(true);
    expect(page.projectCodeOk.isDisplayed()).toBe(false);
  });

  it('project code cannot use non-alphanumeric', function() {
    page.projectCodeInput.clear();
    page.projectCodeInput.sendKeys('a?' + protractor.Key.TAB);
    expect(page.projectCodeExists.isDisplayed()).toBe(false);
    expect(page.projectCodeAlphanumeric.isDisplayed()).toBe(true);
    expect(page.projectCodeOk.isDisplayed()).toBe(false);
  });

  it('project code reverts to default when Edit-project-code is disabled', function() {
    expect(page.editProjectCodeCheckbox.isDisplayed()).toBe(true);
    page.editProjectCodeCheckbox.click();
    expect(page.projectCodeInput.isDisplayed()).toBe(false);
    expect(page.projectCodeInput.getAttribute('value')).toEqual(constants.newProjectCode);
  });

  it('can create project', function() {
    expect(page.nextButton.isEnabled()).toBe(true);
    page.nextButton.click();
    expect(page.projectNameInput.isPresent()).toBe(false);
  });

});
