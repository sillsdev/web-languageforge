import {browser, by, element, protractor} from 'protractor';

export class BellowsLoginPage {
  private readonly constants = require('../../testConstants');

  static async get() {
    await browser.driver.get(browser.baseUrl + '/auth/login');
  }

  form = element(by.id('login-loginForm'));
  infoMessages = element.all(by.className('alert-info'));
  errors = element.all(by.css('.alert-danger'));
  username = element(by.id('username'));
  password = element(by.id('password'));
  forgotPasswordLink = element(by.id('forgot_password'));
  submit     = element(by.id('login-submit'));


  async login(username: string, password: string){
    await browser.driver.get(browser.baseUrl + '/auth/logout');

    await BellowsLoginPage.get();
    await this.username.sendKeys(username);
    await this.password.sendKeys(password);
    await this.submit.click();
  }

  async loginAsAdmin() {
    await this.login(this.constants.adminEmail, this.constants.adminPassword);
  }

  async loginAsManager() {
    await this.login(this.constants.managerEmail, this.constants.managerPassword);
  }

  async loginAsUser() {
    await this.login(this.constants.memberEmail, this.constants.memberPassword);
  }

  loginAsMember = this.loginAsUser;

  async loginAsSecondUser() {
    await this.login(this.constants.member2Email, this.constants.member2Password);
  }

  loginAsSecondMember = this.loginAsSecondUser;

  async loginAsObserver() {
    await this.login(this.constants.observerEmail, this.constants.observerPassword);
  }

  static async logout() {
    await browser.driver.get(browser.baseUrl + '/auth/logout');
  }
}
