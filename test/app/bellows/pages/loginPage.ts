import {browser, element, by, By, $, $$, ExpectedConditions} from 'protractor';

var constants = require('../../testConstants');


export class BellowsLoginPage {
  get = function get() {
    browser.get(browser.baseUrl + '/auth/login');
  }

  form = element(by.id('login-loginForm'));
  infoMessages = element.all(by.className('alert-info'));
  errors = element.all(by.css('.alert-danger'));
  username = element(by.id('username'));
  password = element(by.id('password'));
  forgotPasswordLink = element(by.id('forgot_password'));
  submit     = element(by.id('login-submit'));

  login = function login(username : string, password : string) {
    browser.get(browser.baseUrl + '/auth/logout');

    this.get();
    this.username.sendKeys(username);
    this.password.sendKeys(password);
    this.submit.click();
  }

  loginAsAdmin = function loginAsAdmin() {
    this.login(constants.adminEmail, constants.adminPassword);
  }

  loginAsManager = function loginAsManager() {
    this.login(constants.managerEmail, constants.managerPassword);
  }

  loginAsUser = function loginAsUser() {
    this.login(constants.memberEmail, constants.memberPassword);
  }

  loginAsMember = this.loginAsUser;

  loginAsSecondUser = function loginAsSecondUser() {
    this.login(constants.member2Email, constants.member2Password);
  }

  loginAsSecondMember = this.loginAsSecondUser;

  loginAsObserver = function loginAsObserver() {
    this.login(constants.observerEmail, constants.observerPassword);
  }

  logout = function logout() {
    browser.get(browser.baseUrl + '/auth/logout');
  }
}
