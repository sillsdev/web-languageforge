'use strict';

var baseUrl = 'http://jamaicanpsalms.scriptureforge.local/auth'; // Might pass this in from Protractor command line instead

function login(username, password) {
	// Use base Webdriver instance (browser.driver.get) instead of browser.get
	// since our login page doesn't use Angular.
	var baseUrl = 'http://jamaicanpsalms.scriptureforge.local/auth';
	browser.driver.get(baseUrl + '/login').then(function() {
		browser.driver.findElement(by.id('identity')).sendKeys(username).then(function() {
			browser.driver.findElement(by.id('password')).sendKeys(password).then(function() {
				browser.driver.findElement(by.id('password')).sendKeys(protractor.Key.ENTER);
			});
		});
	});
}

var SfChangePasswordPage = function() {
	this.get = function() {
		browser.get('http://jamaicanpsalms.scriptureforge.local/app/changepassword');
	};
	// Do the 
	this.passwordForm = element('form#passwordForm');
	this.passwordInput = element(by.model('vars.password'));
	this.confirmInput = element(by.model('vars.confirm_password'));
	this.signupButton = element(by.tagName('button')); // Might need to change this...?
}; 

describe('E2E testing: Change password', function() {
	var sfChangePasswordPage = new SfChangePasswordPage();
	
	beforeEach(function() {
		login('testuser', 'test1234'); // TODO: Coordinate with other devs on picking a "standard" test username & password. 2014-05 RM
		sfChangePasswordPage.get();
	});
	
	it('contains a password form', function() {
		expect(sfChangePasswordPage.passwordForm).toBeDefined();
	});
	
	it('refuses to allow form submission if the confirm input does not match', function() {
		sfChangePasswordPage.passwordInput.sendKeys('abc123').then(function() {
			sfChangePasswordPage.confirmInput.sendKeys('abcd1234').then(function() {
				expect(sfChangePasswordPage.signupButton.isEnabled()).toBeFalsy();
			});
		});
	});
	
});
