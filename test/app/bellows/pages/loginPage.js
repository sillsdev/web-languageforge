'use strict';

var constants = require('../../testConstants');

module.exports = new BellowsLoginPage();

function BellowsLoginPage() {
  this.get = function get() {
    browser.get(browser.baseUrl + '/auth/login');
  };

  this.form = element(by.tagName('form'));
  this.infoMessages = element.all(by.className('alert-info'));
  this.errors = element.all(by.css('.alert-danger'));
  this.username = element(by.id('username'));
  this.password = element(by.id('password'));
  this.forgotPasswordLink = element(by.id('forgot_password'));
  this.submit   = element(by.xpath('//button[@type="submit"]'));

  this.login = function login(username, password) {
    browser.get(browser.baseUrl + '/auth/logout');

    this.get();
    this.username.sendKeys(username);
    this.password.sendKeys(password);
    this.submit.click();
  };

  this.loginAsAdmin = function loginAsAdmin() {
    this.login(constants.adminEmail, constants.adminPassword);
  };

  this.loginAsManager = function loginAsManager() {
    this.login(constants.managerEmail, constants.managerPassword);
  };

  this.loginAsUser = function loginAsUser() {
    this.login(constants.memberEmail, constants.memberPassword);
  };

  this.loginAsMember = this.loginAsUser;

  this.loginAsObserver = function loginAsObserver() {
    this.login(constants.observerEmail, constants.observerPassword);
  };

  this.logout = function logout() {
    browser.get(browser.baseUrl + '/auth/logout');
  };
}
