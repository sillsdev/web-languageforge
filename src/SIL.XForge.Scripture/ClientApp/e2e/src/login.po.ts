import { browser, by, element, promise } from 'protractor';

export class LoginPage {
  private static readonly baseUrl = 'https://beta.scriptureforge.local';

  private readonly constants = require('../testConstants.json');

  usernameInput = element(by.id('Username'));
  passwordInput = element(by.id('Password'));
  loginButton = element(by.id('login-button'));

  static get(): promise.Promise<any> {
    return browser.get(this.baseUrl + '/account/login');
  }

  static async logout(): promise.Promise<void> {
    await browser.get(this.baseUrl + '/account/logout');
    await element(by.buttonText('Yes')).click();
  }

  // return type (Promise<void>) intentionally left off to avoid run error
  async login(username: string, password: string) {
    browser.waitForAngularEnabled(false);

    // LoginPage.logout();
    await LoginPage.get();
    await this.usernameInput.sendKeys(username);
    await this.passwordInput.sendKeys(password);
    await this.loginButton.click();

    // wait for redirect before enabling angular wait
    await browser.sleep(300);
    browser.waitForAngularEnabled(true);
  }

  loginAsAdmin(): promise.Promise<void> {
    return this.login(this.constants.adminUsername, this.constants.adminPassword);
  }

  loginAsManager(): promise.Promise<void> {
    return this.login(this.constants.managerUsername, this.constants.managerPassword);
  }

  loginAsUser(): promise.Promise<void> {
    return this.login(this.constants.memberUsername, this.constants.memberPassword);
  }

}
