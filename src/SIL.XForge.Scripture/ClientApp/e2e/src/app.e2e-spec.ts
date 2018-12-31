import { browser, ExpectedConditions } from 'protractor';

import { AppPage } from './app.po';
import { LoginPage } from './login.po';

describe('App', () => {
  const constants = require('../testConstants.json');
  const loginPage = new LoginPage();

  it('should display welcome message containing the users name', async () => {
    await loginPage.loginAsAdmin();

    await expect(AppPage.getMainHeading()).toContain(constants.adminName);
    await LoginPage.logout();
  });

  it('Login by using Enter key should display welcome message containing the users name', async () => {
    await loginPage.login(constants.adminUsername, constants.adminPassword, 'EnterKeyPress');
    await browser.wait(ExpectedConditions.visibilityOf(AppPage.homepage.homepageHeader), 6000);

    await expect(AppPage.getMainHeading()).toContain(constants.adminName);
    await LoginPage.logout();
  });
});
