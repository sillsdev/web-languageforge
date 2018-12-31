import { browser, by, element, ExpectedConditions, protractor } from 'protractor';

import { AppPage } from './app.po';

export class LoginPage {
  private static readonly baseUrl = 'http://localhost:5000';
  private readonly constants = require('../testConstants.json');

  usernameInput = element(by.id('mdc-input-0'));
  passwordInput = element(by.id('mdc-input-1'));
  loginButton = element(by.css('button[class*="submit-button"]'));

  static async get() {
    await browser.get(this.baseUrl + '/identity/log-in');
  }

  static async logout() {
    browser.waitForAngularEnabled(false);
    await browser.get(this.baseUrl + '/identity/log-out');
    browser.waitForAngularEnabled(true);
  }

  // return type (Promise<void>) intentionally left off to avoid run error
  async login(username: string, password: string, event?: string) {
    await LoginPage.get();
    await this.usernameInput.sendKeys(username);
    await this.passwordInput.sendKeys(password);
    if (!event) await this.loginButton.click();
    else
      await browser
        .actions()
        .sendKeys(protractor.Key.ENTER)
        .perform();
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
