import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectSettingsPage} from '../shared/project-settings.page';

describe('Lexicon E2E Project Settings', async () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectSettingsPage = new ProjectSettingsPage();

  it('should display project properties for manager', async () => {
    await loginPage.loginAsManager();
    await projectSettingsPage.get(constants.testProjectName);
    await expect(projectSettingsPage.tabs.project.isDisplayed());
    await expect<any>(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
  });
});
