import {browser, by, element, ExpectedConditions} from 'protractor';

export class BellowsLoginPage {
  private readonly constants = require('../../testConstants');

  static get() {
    browser.get(browser.baseUrl + '/auth/login');
  }

  form = element(by.id('login-loginForm'));
  infoMessages = element.all(by.className('alert-info'));
  errors = element.all(by.css('.alert-danger'));
  username = element(by.id('username'));
  password = element(by.id('password'));
  forgotPasswordLink = element(by.id('forgot_password'));
  submit     = element(by.id('login-submit'));
  lexiconLoading = element(by.id('loadingMessage'));

  login(username: string, password: string) {
    browser.get(browser.baseUrl + '/auth/logout');

    BellowsLoginPage.get();
    this.username.sendKeys(username);
    this.password.sendKeys(password);
    this.submit.click();
    browser.wait(ExpectedConditions.not(ExpectedConditions.urlContains('/auth/login')),
      this.constants.conditionTimeout);
    browser.wait(ExpectedConditions.invisibilityOf(this.lexiconLoading), this.constants.conditionTimeout);
  }

  loginAsAdmin() {
    this.login(this.constants.adminEmail, this.constants.adminPassword);
  }

  loginAsManager() {
    this.login(this.constants.managerEmail, this.constants.managerPassword);
  }

  loginAsUser() {
    this.login(this.constants.memberEmail, this.constants.memberPassword);
  }

  loginAsMember = this.loginAsUser;

  loginAsSecondUser() {
    this.login(this.constants.member2Email, this.constants.member2Password);
  }

  loginAsSecondMember = this.loginAsSecondUser;

  loginAsObserver() {
    this.login(this.constants.observerEmail, this.constants.observerPassword);
  }

  static logout() {
    browser.get(browser.baseUrl + '/auth/logout');
  }
}
