describe('Project Settings page', () => {
  const constants    = require('../../../../testConstants.json');
  const loginPage    = require('../../../../bellows/pages/loginPage.js');
  const projectSettingsPage = require('../../pages/projectSettingsPage.js');

  it('should display project properties for manager', () => {
    loginPage.loginAsManager();
    projectSettingsPage.get(constants.testProjectName);
    expect(projectSettingsPage.tabs.project.isDisplayed());
    expect(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
  });

});
