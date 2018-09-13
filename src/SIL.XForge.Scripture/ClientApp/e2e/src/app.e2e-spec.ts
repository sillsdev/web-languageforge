import { AppPage } from './app.po';
import { LoginPage } from './login.po';

describe('App', () => {
  const loginPage = new LoginPage();

  it('should display welcome message', () => {
    loginPage.loginAsAdmin();
    expect(AppPage.getMainHeading()).toEqual('Hello, Admin!');
  });

});
