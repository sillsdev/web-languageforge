import { AppPage } from './app.po';
import { LoginPage } from './login.po';

describe('App', () => {
  const constants = require('../testConstants.json');
  const loginPage = new LoginPage();

  it('should display welcome message containing the users name', async () => {
    await loginPage.loginAsAdmin();
    await expect(AppPage.getMainHeading()).toContain(constants.adminName);
  });

  it('Login by using Enter key should display welcome message containing the users name', async () => {
    await LoginPage.logout();
    await loginPage.login(constants.adminUsername, constants.adminPassword, true);
    await expect(AppPage.getMainHeading()).toContain(constants.adminName);
  });
});
