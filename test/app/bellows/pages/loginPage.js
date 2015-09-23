'use strict';

var constants = require('../../testConstants');

var BellowsLoginPage = function() {
  var _this = this; // For use inside our methods. Necessary when passing anonymous functions around, which lose access to "this".

  this.get = function() {
    browser.get('/auth/login');
    browser.waitForAngular();
  };

  this.form = element('form#loginForm');
  this.infoMessages = element.all(by.css('.alert-info'));
  this.errors = element.all(by.css('.alert-error'));
  this.username = element(by.id('username'));
  this.password = element(by.id('password'));
  this.forgotPasswordLink = element(by.id('forgot_password'));
  this.submit   = element(by.xpath('//button[@type="submit"]'));

  this.login = function(username, password) {
    _this.get();
    _this.username.sendKeys(username);
    _this.password.sendKeys(password);
    _this.submit.click();
  };

  this.loginAsAdmin = function() {
    this.login(constants.adminUsername, constants.adminPassword);
  };

  this.loginAsManager = function() {
    this.login(constants.managerUsername, constants.managerPassword);
  };

  this.loginAsUser = this.loginAsMember = function() {
    this.login(constants.memberUsername, constants.memberPassword);
  };

  this.logout = function() {
    browser.get('/app/logout');
  };
};

module.exports = new BellowsLoginPage();

// This makes the result of calling require('./pages/loginPage') to be the BellowsLoginPage constructor function.
// So you'd use this as "var LoginPage = require('./pages/loginPage'); var loginPage = new LoginPage();"
