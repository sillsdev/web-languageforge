import { browser, by, element, ExpectedConditions, protractor } from 'protractor';

import { AppPage } from './app.po';

export class LoginPage {
  private static readonly baseUrl = 'http://localhost:5000';
  private readonly constants = require('../testConstants.json');

  usernameInput = element(by.css('input[id="username"]'));
  passwordInput = element(by.css('input[id="password"]'));
  loginButton = element(by.id('submitButton'));

  static async get() {
    await browser.get(this.baseUrl + '/identity/log-in');
  }

  static async logout() {
    browser.waitForAngularEnabled(false);
    await browser.get(this.baseUrl + '/identity/log-out');
    browser.waitForAngularEnabled(true);
  }

  // return type (Promise<void>) intentionally left off to avoid run error
  async login(username: string, password: string, shouldSubmitByEnterkey?: boolean) {
    await LoginPage.get();
    await this.usernameInput.sendKeys(username);
    await this.passwordInput.sendKeys(password);
    if (shouldSubmitByEnterkey) {
      await browser
        .actions()
        .sendKeys(protractor.Key.ENTER)
        .perform();
    } else {
      await this.loginButton.click();
    }
    await browser.wait(ExpectedConditions.visibilityOf(AppPage.homepage.homepageHeader), 6000);
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
