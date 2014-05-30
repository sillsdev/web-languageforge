'use strict';

var constants = require('../../../../../testConstants.json');

var SfSignupPage = function() {
	this.get = function() {
		browser.get('/signup');
	};
	
	this.userForm = element('form#userForm');
	this.userNameExists = element(by.id('userNameExists'));
	this.userNameOk = element(by.id('userNameOk'));
	this.usernameInput = element(by.model('record.username'));
	this.nameInput = element(by.model('record.name'));
	this.emailInput = element(by.model('record.email'));
	this.passwordInput = element(by.model('record.password'));
	this.captchaInput = element(by.model('record.captcha'));
	this.signupButton = element(by.id('submit'));
	//this.warnNotices = $('.notices').element.all(by.css('.alert div span'));
	this.noticeList  = element.all(by.repeater('notice in notices()'));
}; 

describe('E2E testing: Signup app', function() {
	var sfSignupPage = new SfSignupPage();
	
	beforeEach(function() {
		sfSignupPage.get();
	});
	
	it('contains a user form', function() {
		expect(sfSignupPage.userForm).toBeDefined();
	});
	
	it('finds the admin user already exists', function() {
		sfSignupPage.usernameInput.sendKeys(constants.adminUsername);
		
		// trigger the username lookup
		sfSignupPage.usernameInput.sendKeys(protractor.Key.ENTER);
		
		expect(sfSignupPage.userNameExists.isDisplayed()).toBeTruthy();
		expect(sfSignupPage.userNameOk.isDisplayed()).toBeFalsy();
	});
	
	it("can verify that 'newuser' is an available username", function() {
		sfSignupPage.usernameInput.sendKeys('newuser');
		
		// trigger the username lookup
		sfSignupPage.usernameInput.sendKeys(protractor.Key.ENTER);

		expect(sfSignupPage.userNameExists.isDisplayed()).toBeFalsy();
		expect(sfSignupPage.userNameOk.isDisplayed()).toBeTruthy();
	});
	
	it("has a captcha image", function() {
		expect(element(by.id('captcha')).isDisplayed()).toBeTruthy;
	});
	
	
	it('can submit a user registration request and captcha is invalid', function() {
		sfSignupPage.usernameInput.sendKeys('newuser');
		
		// trigger the username lookup
		sfSignupPage.usernameInput.sendKeys(protractor.Key.ENTER);

		sfSignupPage.nameInput.sendKeys('New User');
		sfSignupPage.emailInput.sendKeys('email@example.com');
		sfSignupPage.passwordInput.sendKeys('12345');
		sfSignupPage.captchaInput.sendKeys('whatever');

		expect(sfSignupPage.noticeList.count()).toBe(0);
		sfSignupPage.signupButton.click().then(function() {
			expect(sfSignupPage.noticeList.count()).toBe(1);
			expect(sfSignupPage.noticeList.get(0).getText()).toContain('image verification failed');
		});
	});
	
});
