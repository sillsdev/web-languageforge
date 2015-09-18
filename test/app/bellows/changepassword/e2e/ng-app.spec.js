'use strict';

describe('E2E testing: Change password', function() {
  var constants = require('../../../testConstants');
  var loginPage = require('../../pages/loginPage');
  var header    = require('../../pages/pageHeader');
  var page      = require('../../pages/changePasswordPage');
  var newPassword = '12345678';

  it('setup: login, go to change password page', function() {
    loginPage.loginAsUser();
    page.get();
  });

  it('refuses to allow form submission if the confirm input does not match', function() {
    page.password.sendKeys(newPassword);
    page.confirm.sendKeys('blah12345');
    expect(page.submitButton.isEnabled()).toBeFalsy();
    page.password.clear();
    page.confirm.clear();
  });

  it('allows form submission if the confirm input matches', function() {
    page.password.sendKeys(newPassword);
    page.confirm.sendKeys(newPassword);
    expect(page.submitButton.isEnabled()).toBeTruthy();
    page.password.clear();
    page.confirm.clear();
  });

  /* cant test this yet because I don't know how to test for HTML 5 form validation - cjh 2014-06
  it('should not allow a password less than 7 characters', function() {
    var shortPassword = '12345';
    page.password.sendKeys(shortPassword);
    page.confirm.sendKeys(shortPassword);
    expect(page.submitButton.isEnabled()).toBe(false);
    page.password.clear();
    page.confirm.clear();
  });
  */

  it('successfully changes user\'s password after form submission', function() {
    page.password.sendKeys(newPassword);
    page.confirm.sendKeys(newPassword);
    page.confirm.sendKeys(protractor.Key.ENTER);
    loginPage.logout();

    //expect(header.loginButton.isElementPresent()).toBe(true);
    loginPage.login(constants.memberUsername, newPassword);
    expect(header.loginButton.isPresent()).toBe(false);

    // reset password back to original
    page.get();
    page.password.sendKeys(constants.memberPassword);
    page.confirm.sendKeys(constants.memberPassword);
    page.confirm.sendKeys(protractor.Key.ENTER);
  });
});
