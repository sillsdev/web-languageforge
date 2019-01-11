import { browser, ExpectedConditions } from 'protractor';

import { AppPage } from './app.po';
import { LoginPage } from './login.po';

describe('App', () => {
  const constants = require('../testConstants.json');
  const loginPage = new LoginPage();
  let shouldSubmitByEnterkey: boolean = false;

  it('should display welcome message containing the users name', async () => {
    await loginPage.loginAsAdmin();
    await expect(AppPage.getMainHeading()).toContain(constants.adminName);
  });

  it('Login by using Enter key should display welcome message containing the users name', async () => {
    shouldSubmitByEnterkey = true;
    await LoginPage.logout();
    await loginPage.login(constants.adminUsername, constants.adminPassword, shouldSubmitByEnterkey);
    await expect(AppPage.getMainHeading()).toContain(constants.adminName);
  });
});
