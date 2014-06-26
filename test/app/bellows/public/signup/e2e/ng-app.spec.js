'use strict';

var constants = require('../../../../../testConstants.json');
var page = require('../../../../pages/signupPage.js');
var body = require('../../../../pages/pageBody.js');

describe('E2E testing: Signup app', function() {

	
	afterEach(function() {
		expect(body.phpError.isPresent()).toBe(false);
	});

	it('setup and contains a user form', function() {
		page.get();
		expect(page.userForm).toBeDefined();
	});
	
	it('finds the admin user already exists', function() {
		page.usernameInput.sendKeys(constants.adminUsername);
		page.usernameInput.sendKeys(protractor.Key.TAB);	// trigger the username lookup
		expect(page.userNameExists.isDisplayed()).toBe(true);
		expect(page.userNameOk.isDisplayed()).toBe(false);
		page.usernameInput.clear();
	});
	
	it("can verify that an unused username is available", function() {
		page.usernameInput.sendKeys(constants.notUsedUsername);
		page.usernameInput.sendKeys(protractor.Key.TAB);	// trigger the username lookup
		expect(page.userNameExists.isDisplayed()).toBe(false);
		expect(page.userNameOk.isDisplayed()).toBe(true);
		page.usernameInput.clear();
	});
	
	it("cannot submit if passwords don't match", function() {
		page.usernameInput.sendKeys(constants.notUsedUsername);
		page.usernameInput.sendKeys(protractor.Key.TAB);	// trigger the username lookup
		page.nameInput.sendKeys('New User');
		page.emailInput.sendKeys(constants.emailValid);
		page.passwordInput.sendKeys(constants.passwordValid);
		page.captchaInput.sendKeys('whatever');
		expect(page.signupButton.isEnabled()).toBe(false);
	});

	it("cannot submit if passwords match but are too short", function() {
		page.passwordInput.clear();
		page.passwordInput.sendKeys(constants.passwordTooShort);
		page.confirmPasswordInput.sendKeys(constants.passwordTooShort);
		expect(page.signupButton.isEnabled()).toBe(false);
	});

	it("can submit if passwords match and long enough", function() {
		page.passwordInput.clear();
		page.passwordInput.sendKeys(constants.passwordValid);
		page.confirmPasswordInput.clear();
		page.confirmPasswordInput.sendKeys(constants.passwordValid);
		expect(page.signupButton.isEnabled()).toBe(true);
	});

	it("can submit if password is showing, matching and long enough", function() {
		page.confirmPasswordInput.clear();
		page.showPassword.click();
		expect(page.signupButton.isEnabled()).toBe(true);
	});

	it("cannot submit if email is invalid", function() {
		page.emailInput.clear();
		page.emailInput.sendKeys(constants.emailNoAt);
		expect(page.signupButton.isEnabled()).toBe(false);
		page.emailInput.clear();
		page.emailInput.sendKeys(constants.emailValid);
	});

	it("has a captcha image", function() {
		expect(page.captchaImage.isDisplayed()).toBe(true);
	});
	
	it('can submit a user registration request and captcha is invalid', function() {
		expect(page.noticeList.count()).toBe(0);
		page.signupButton.click();
		expect(page.noticeList.count()).toBe(1);
		expect(page.noticeList.get(0).getText()).toContain('image verification failed');
	});
	
});
