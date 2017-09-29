'use strict';

describe('Project Settings page', function () {
  var constants    = require('../../../../testConstants.json');
  var loginPage    = require('../../../../bellows/pages/loginPage.js');
  var projectSettingsPage = require('../../pages/projectSettingsPage.js');

  it('should display project properties for manager', function () {
    loginPage.loginAsManager();
    projectSettingsPage.get(constants.testProjectName);
    expect(projectSettingsPage.tabs.project.isDisplayed());
    expect(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
  });

});
