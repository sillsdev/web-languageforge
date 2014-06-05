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
//	this.passwordInput = element(by.model('record.password'));
	this.passwordInput = element(by.id('visiblePassword'));
	this.showPassword = element(by.model('showPassword'));
	this.captchaInput = element(by.model('record.captcha'));
	this.signupButton = element(by.id('submit'));
	//this.warnNotices = $('.notices').element.all(by.css('.alert div span'));
	this.noticeList  = element.all(by.repeater('notice in notices()'));
}; 

describe('E2E testing: Signup app', function() {
	var page = new SfSignupPage();
	
	it('contains a user form', function() {
		page.get();
		expect(page.userForm).toBeDefined();
	});
	
	it('finds the admin user already exists', function() {
		page.usernameInput.sendKeys(constants.adminUsername);
		
		// trigger the username lookup
		page.usernameInput.sendKeys(protractor.Key.ENTER);
		
		expect(page.userNameExists.isDisplayed()).toBeTruthy();
		expect(page.userNameOk.isDisplayed()).toBeFalsy();
	});
	
	it("can verify that 'newuser' is an available username", function() {
		page.get();
		page.usernameInput.sendKeys('newuser');
		
		// trigger the username lookup
		page.usernameInput.sendKeys(protractor.Key.ENTER);

		expect(page.userNameExists.isDisplayed()).toBeFalsy();
		expect(page.userNameOk.isDisplayed()).toBeTruthy();
	});
	
	it("has a captcha image", function() {
		expect(element(by.id('captcha')).isDisplayed()).toBeTruthy;
	});
	
	
	it('can submit a user registration request and captcha is invalid', function() {
		page.get();
		page.usernameInput.sendKeys('newuser');
		
		// trigger the username lookup
		page.usernameInput.sendKeys(protractor.Key.ENTER);

		page.nameInput.sendKeys('New User');
		page.emailInput.sendKeys('email@example.com');
		page.showPassword.click();
		page.passwordInput.sendKeys('12345');
		page.captchaInput.sendKeys('whatever');

		expect(page.noticeList.count()).toBe(0);
		page.signupButton.click().then(function() {
			expect(page.noticeList.count()).toBe(1);
			expect(page.noticeList.get(0).getText()).toContain('image verification failed');
		});
	});
	
});
