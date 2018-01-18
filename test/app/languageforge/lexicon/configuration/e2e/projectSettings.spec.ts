import { BellowsLoginPage } from '../../../../bellows/pages/loginPage';
import { ProjectSettingsPage } from '../../pages/projectSettingsPage';
const constants = require('../../../../testConstants.json');
const loginPage = new BellowsLoginPage();
const projectSettingsPage = new ProjectSettingsPage();

describe('Project Settings page', () => {
  it('should display project properties for manager', () => {
    loginPage.loginAsManager();
    projectSettingsPage.get(constants.testProjectName);
    expect(projectSettingsPage.tabs.project.isDisplayed());
    expect<any>(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
  });
});
