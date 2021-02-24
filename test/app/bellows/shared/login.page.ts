import {browser, by, element, ExpectedConditions} from 'protractor';

export class BellowsLoginPage {
  private readonly constants = require('../../testConstants');

  static get() {
    return browser.get(browser.baseUrl + '/auth/login');
  }

  form = element(by.id('login-loginForm'));
  infoMessages = element.all(by.className('alert-info'));
  errors = element.all(by.css('.alert-danger'));
  username = element(by.id('username'));
  password = element(by.id('password'));
  forgotPasswordLink = element(by.id('forgot_password'));
  submit     = element(by.id('login-submit'));
  lexiconLoading = element(by.id('loadingMessage'));

  async login(username: string, password: string) {
    await browser.get(browser.baseUrl + '/auth/logout');

    await BellowsLoginPage.get();
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
    await this.submit.click();
    await browser.wait(ExpectedConditions.not(ExpectedConditions.urlContains('/auth/login')),
      this.constants.conditionTimeout);
    return browser.wait(ExpectedConditions.invisibilityOf(this.lexiconLoading), this.constants.conditionTimeout);
  }

  loginAsAdmin() {
    return this.login(this.constants.adminEmail, this.constants.adminPassword);
  }

  loginAsManager() {
    return this.login(this.constants.managerEmail, this.constants.managerPassword);
  }

  loginAsUser() {
    return this.login(this.constants.memberEmail, this.constants.memberPassword);
  }

  loginAsMember = this.loginAsUser;

  loginAsSecondUser() {
    return this.login(this.constants.member2Email, this.constants.member2Password);
  }

  loginAsSecondMember = this.loginAsSecondUser;

  loginAsObserver() {
    return this.login(this.constants.observerEmail, this.constants.observerPassword);
  }

  static logout() {
    return browser.get(browser.baseUrl + '/auth/logout');
  }
}
