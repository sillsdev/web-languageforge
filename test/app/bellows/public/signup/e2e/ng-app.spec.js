'use strict';

describe('E2E testing: Signup app', function() {
  var constants = require('../../../../testConstants.json');
  var page      = require('../../../pages/signupPage.js');
  var body      = require('../../../pages/pageBody.js');
  
  afterEach(function() {
    expect(body.phpError.isPresent()).toBe(false);
  });
  
  it('setup and contains a user form', function() {
    page.get();
    expect(page.signupForm).toBeDefined();
  });
  
  it('finds the admin user already exists', function() {
    page.usernameInput.sendKeys(constants.adminUsername);
    page.emailInput.sendKeys(constants.adminEmail);
    expect(page.nextButton.isEnabled()).toBe(true);
    page.nextButton.click();
    expect(page.usernameExists.isDisplayed()).toBe(true);
    expect(page.usernameOk.isDisplayed()).toBe(false);
    page.usernameInput.clear();
    page.emailInput.clear();
  });
  
  it('cannot move on if email is invalid', function() {
    page.usernameInput.sendKeys(constants.notUsedUsername);
    page.emailInput.clear();
    page.emailInput.sendKeys(constants.emailNoAt);
    expect(page.nextButton.isEnabled()).toBe(false);
    page.emailInput.clear();
  });
  
  it('can verify that an unused username is available', function() {
    page.emailInput.sendKeys(constants.notUsedEmail);
    expect(page.nextButton.isEnabled()).toBe(true);
    page.nextButton.click();
    expect(page.usernameExists.isDisplayed()).toBe(false);
    expect(page.usernameOk.isDisplayed()).toBe(true);
  });
  
  it("cannot submit if passwords don't match", function() {
    page.nameInput.sendKeys(constants.notUsedName);
    page.passwordInput.sendKeys(constants.passwordValid);
    page.captchaInput.sendKeys('whatever');
    expect(page.signupButton.isEnabled()).toBe(false);
  });
  
  it('cannot submit if passwords match but are too short', function() {
    page.passwordInput.clear();
    page.passwordInput.sendKeys(constants.passwordTooShort);
    page.confirmPasswordInput.sendKeys(constants.passwordTooShort);
    expect(page.signupButton.isEnabled()).toBe(false);
  });
  
  it('can submit if passwords match and long enough', function() {
    page.passwordInput.clear();
    page.passwordInput.sendKeys(constants.passwordValid);
    page.confirmPasswordInput.clear();
    page.confirmPasswordInput.sendKeys(constants.passwordValid);
    expect(page.signupButton.isEnabled()).toBe(true);
  });
  
  it('can submit if password is showing, matching and long enough', function() {
    page.confirmPasswordInput.clear();
    page.showPassword.click();
    expect(page.signupButton.isEnabled()).toBe(true);
  });
  
  it('has a captcha image', function() {
    expect(page.captchaImage.isDisplayed()).toBe(true);
  });
  
  it('can submit a user registration request and captcha is invalid', function() {
    expect(page.noticeList.count()).toBe(0);
    page.signupButton.click();
    expect(page.noticeList.count()).toBe(1);
    expect(page.noticeList.get(0).getText()).toContain('image verification failed');
  });
  
});
