import { browser, by, element } from 'protractor';

export class LoginPage {
  private static readonly baseUrl = 'https://beta.scriptureforge.local';

  private readonly constants = require('../testConstants.json');

  usernameInput = element(by.id('Username'));
  passwordInput = element(by.id('Password'));
  loginButton = element(by.id('login-button'));

  static async get() {
    await browser.get(this.baseUrl + '/account/login');
  }

  static async logout() {
    await browser.get(this.baseUrl + '/account/logout');
    await element(by.buttonText('Yes')).click();
  }

  async login(username: string, password: string) {
    browser.waitForAngularEnabled(false);

    // LoginPage.logout();
    await LoginPage.get();
    this.usernameInput.sendKeys(username);
    this.passwordInput.sendKeys(password);
    await this.loginButton.click();

    browser.waitForAngularEnabled(true);
  }

  async loginAsAdmin() {
    await this.login(this.constants.adminUsername, this.constants.adminPassword);
  }

  async loginAsManager() {
    await this.login(this.constants.managerUsername, this.constants.managerPassword);
  }

  async loginAsUser() {
    await this.login(this.constants.memberUsername, this.constants.memberPassword);
  }

}
