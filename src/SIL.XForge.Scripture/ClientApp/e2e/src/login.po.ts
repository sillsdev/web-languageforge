import { browser, by, element } from 'protractor';

export class LoginPage {
  private static readonly baseUrl = 'https://beta.scriptureforge.local';

  // private readonly constants = require('../testConstants.json');

  usernameInput = element(by.id('Username'));
  passwordInput = element(by.id('Password'));
  loginButton = element(by.id('login-button'));

  static get() {
    browser.get(this.baseUrl + '/account/login');
  }

  static logout() {
    browser.get(this.baseUrl + '/account/logout');
    element(by.buttonText('Yes')).click();
  }

  login(username: string, password: string) {
    browser.waitForAngularEnabled(false);

    // LoginPage.logout();
    LoginPage.get();
    this.usernameInput.sendKeys(username);
    this.passwordInput.sendKeys(password);
    this.loginButton.click();

    browser.waitForAngularEnabled(true);
  }

  loginAsAdmin() {
    // this.login(this.constants.adminEmail, this.constants.adminPassword);
    this.login('admin', 'password');
  }

  loginAsManager() {
    // this.login(this.constants.managerEmail, this.constants.managerPassword);
    this.login('admin', 'password');
  }

  loginAsUser() {
    // this.login(this.constants.memberEmail, this.constants.memberPassword);
    this.login('admin', 'password');
  }

}
