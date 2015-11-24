'use strict';

describe('Project Settings page', function() {
  var constants    = require('../../../../testConstants');
  var loginPage    = require('../../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../../bellows/pages/projectsPage.js');
  var util         = require('../../../../bellows/pages/util.js');
  var dbePage             = require('../../pages/dbePage.js');
  var dbeUtil             = require('../../pages/dbeUtil.js');
  var projectSettingsPage = require('../../pages/projectSettingsPage.js');

  it('cannot see Send and Receive on test project for manager', function() {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    projectSettingsPage.get();
    projectSettingsPage.tabs.project.click();
    expect(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
    expect(projectSettingsPage.tabs.sendReceive.isDisplayed()).toBe(false);
  });

  it('can see Send and Receive on SR project for manager', function() {
    projectsPage.get();
    projectsPage.clickOnProject(constants.srProjectName);
    projectSettingsPage.get();
    projectSettingsPage.tabs.project.click();
    expect(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
    expect(projectSettingsPage.tabs.sendReceive.isDisplayed()).toBe(true);
  });

  describe('Send and Receive tab', function() {

    it('can see Project ID, Login and Change button', function() {
      projectSettingsPage.tabs.sendReceive.click();
      expect(projectSettingsPage.sendReceiveTab.projectIdInput.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.loginInput.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.changeButton.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.passwordInput.isDisplayed()).toBe(false);
      expect(projectSettingsPage.sendReceiveTab.visiblePasswordInput.isDisplayed()).toBe(false);
      expect(projectSettingsPage.sendReceiveTab.showCharactersCheckbox.isDisplayed()).toBe(false);
      expect(projectSettingsPage.sendReceiveTab.updateButton.isDisplayed()).toBe(false);
    });

    it('can edit settings', function() {
      projectSettingsPage.sendReceiveTab.changeButton.click();
      expect(projectSettingsPage.sendReceiveTab.projectIdInput.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.loginInput.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.changeButton.isDisplayed()).toBe(false);
      expect(projectSettingsPage.sendReceiveTab.passwordInput.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.visiblePasswordInput.isDisplayed()).toBe(false);
      expect(projectSettingsPage.sendReceiveTab.showCharactersCheckbox.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.updateButton.isDisplayed()).toBe(true);
    });

    it('cannot submit if Password is empty', function() {
      projectSettingsPage.sendReceiveTab.formStatus.expectHasNoError();
      expect(projectSettingsPage.sendReceiveTab.updateButton.isEnabled()).toBe(true);
      projectSettingsPage.sendReceiveTab.updateButton.click();
      expect(projectSettingsPage.sendReceiveTab.projectIdInput.isDisplayed()).toBe(true);
      projectSettingsPage.sendReceiveTab.formStatus.expectContainsError('Password cannot be empty.');
    });

    it('cannot submit if Login is empty', function() {
      projectSettingsPage.sendReceiveTab.loginInput.clear();
      expect(projectSettingsPage.sendReceiveTab.updateButton.isEnabled()).toBe(true);
      projectSettingsPage.sendReceiveTab.updateButton.click();
      expect(projectSettingsPage.sendReceiveTab.projectIdInput.isDisplayed()).toBe(true);
      projectSettingsPage.sendReceiveTab.formStatus.expectContainsError('Login cannot be empty.');
    });

    it('cannot submit if Project ID is empty', function() {
      projectSettingsPage.sendReceiveTab.projectIdInput.clear();
      expect(projectSettingsPage.sendReceiveTab.updateButton.isEnabled()).toBe(true);
      projectSettingsPage.sendReceiveTab.updateButton.click();
      expect(projectSettingsPage.sendReceiveTab.projectIdInput.isDisplayed()).toBe(true);
      projectSettingsPage.sendReceiveTab.formStatus.expectContainsError('Project ID cannot be empty.');
    });

    it('cannot submit if Project ID is invalid', function() {
      projectSettingsPage.sendReceiveTab.projectIdInput.sendKeys('1');
      expect(projectSettingsPage.sendReceiveTab.updateButton.isEnabled()).toBe(true);
      projectSettingsPage.sendReceiveTab.updateButton.click();
      expect(projectSettingsPage.sendReceiveTab.projectIdInput.isDisplayed()).toBe(true);
      projectSettingsPage.sendReceiveTab.formStatus.expectContainsError('Project ID must begin with a letter');
    });
  });

});
