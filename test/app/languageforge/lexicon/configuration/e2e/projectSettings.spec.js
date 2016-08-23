'use strict';

describe('Project Settings page', function () {
  var constants    = require('../../../../testConstants');
  var loginPage    = require('../../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../../bellows/pages/projectsPage.js');
  var projectSettingsPage = require('../../pages/projectSettingsPage.js');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  it('cannot see Send and Receive on test project for manager', function () {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    projectSettingsPage.get();
    projectSettingsPage.tabs.project.click();
    expect(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
    expect(projectSettingsPage.tabs.sendReceive.isDisplayed()).toBe(false);
  });

  it('can see Send and Receive on SR project for manager', function () {
    projectsPage.get();
    projectsPage.clickOnProject(constants.srProjectName);
    projectSettingsPage.get();
    projectSettingsPage.tabs.project.click();
    expect(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
    expect(projectSettingsPage.tabs.sendReceive.isDisplayed()).toBe(true);
  });

  describe('Send and Receive tab', function () {

    it('can edit settings', function () {
      projectSettingsPage.tabs.sendReceive.click();
      expect(projectSettingsPage.sendReceiveTab.loginInput.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.loginInput.getAttribute('value'))
        .toEqual(constants.managerUsername);
      expect(projectSettingsPage.sendReceiveTab.passwordInput.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.passwordInput.getAttribute('value')).toEqual('');
      expect(projectSettingsPage.sendReceiveTab.visiblePasswordInput.isDisplayed()).toBe(false);
      expect(projectSettingsPage.sendReceiveTab.showCharactersCheckbox.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.projectUneditable.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.projectUneditable.getAttribute('value'))
        .toContain(constants.srIdentifier);
      expect(projectSettingsPage.sendReceiveTab.projectSelect().isPresent()).toBe(false);
      expect(projectSettingsPage.sendReceiveTab.saveButton.isDisplayed()).toBe(true);
      projectSettingsPage.sendReceiveTab.formStatus.expectHasNoError();
    });

    it('can edit Project when password supplied', function () {
      projectSettingsPage.sendReceiveTab.loginInput.clear();
      projectSettingsPage.sendReceiveTab.loginInput.sendKeys(constants.srUsername);
      projectSettingsPage.sendReceiveTab.passwordInput.sendKeys(constants.srPassword);
      browser.wait(expectedCondition.visibilityOf(projectSettingsPage.sendReceiveTab.passwordOk),
        CONDITION_TIMEOUT);
      expect(projectSettingsPage.sendReceiveTab.loginOk.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.passwordOk.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.loginInput.isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.projectUneditable.isDisplayed()).toBe(false);
      expect(projectSettingsPage.sendReceiveTab.projectSelect().isDisplayed()).toBe(true);
      expect(projectSettingsPage.sendReceiveTab.projectSelectedOption())
        .toContain(constants.srIdentifier);
      projectSettingsPage.sendReceiveTab.formStatus.expectHasNoError();
    });

  });

});
