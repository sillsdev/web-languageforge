'use strict';

var constants = require('../../testConstants');

module.exports = new BellowsLoginPage();

function BellowsLoginPage() {
  var _this = this;

  this.get = function () {
    browser.get(browser.baseUrl + '/auth/login');
  };

  this.form = element(by.tagName('form'));
  this.infoMessages = element.all(by.css('.alert-info'));
  this.errors = element.all(by.css('.alert-error'));
  this.username = element(by.id('username'));
  this.password = element(by.id('password'));
  this.forgotPasswordLink = element(by.id('forgot_password'));
  this.submit   = element(by.xpath('//button[@type="submit"]'));

  this.login = function (username, password) {
    _this.get();
    _this.username.sendKeys(username);
    _this.password.sendKeys(password);
    _this.submit.click();
  };

  this.loginAsAdmin = function () {
    _this.login(constants.adminUsername, constants.adminPassword);
  };

  this.loginAsManager = function () {
    _this.login(constants.managerUsername, constants.managerPassword);
  };

  this.loginAsUser = this.loginAsMember = function () {
    _this.login(constants.memberUsername, constants.memberPassword);
  };

  this.loginAsObserver = function () {
    _this.login(constants.observerUsername, constants.observerPassword);
  };

  this.logout = function () {
    browser.get(browser.baseUrl + '/app/logout');
  };
}
