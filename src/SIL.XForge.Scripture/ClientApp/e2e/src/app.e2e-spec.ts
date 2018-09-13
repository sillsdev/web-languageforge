import { AppPage } from './app.po';
import { LoginPage } from './login.po';

describe('App', () => {
  const constants = require('../testConstants.json');
  const loginPage = new LoginPage();

  it('should display welcome message containing the users name', () => {
    loginPage.loginAsAdmin();
    expect(AppPage.getMainHeading()).toContain(constants.adminName);
  });

});
