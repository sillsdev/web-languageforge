import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectSettingsPage} from '../shared/project-settings.page';

describe('Lexicon E2E Project Settings', () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectSettingsPage = new ProjectSettingsPage();

  it('should display project properties for manager', () => {
    loginPage.loginAsManager();
    projectSettingsPage.get(constants.testProjectName);
    expect(projectSettingsPage.tabs.project.isDisplayed());
    expect<any>(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
  });
});
