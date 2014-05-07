'use strict';

var baseUrl = browser.baseUrl || 'http://jamaicanpsalms.scriptureforge.local';
// browser.baseUrl is specified on Protractor command line via "protractor --baseUrl=foo"
// If the --baseUrl parameter is not given on command line, browser.baseUrl will be an empty string

function noop() { ; }

function login(username, password) {
	// Use base Webdriver instance (browser.driver.get) instead of browser.get
	// since our login page doesn't use Angular.
	browser.driver.get(baseUrl + '/auth/login');
	browser.driver.findElement(by.id('identity')).sendKeys(username);
	browser.driver.findElement(by.id('password')).sendKeys(password);
	browser.driver.findElement(by.id('password')).sendKeys(protractor.Key.ENTER);
};

function logout() {
	browser.driver.get(baseUrl + '/auth/logout');
};

function checkSpecificUserLoggedIn(username) {
	browser.sleep(500); // Allow time for the login operation to return us to the front page before proceeding
	// Note that we can't use browser.waitForAngular() here because the front page doesn't have Angular on it.
	// This was causing quite a number of test failures until I added the sleep() call. 2013-05 RM
	browser.driver.get(baseUrl + '/app/userprofile');
	expect(element(by.binding('user.username')).getText()).toEqual(username);
};

function checkLoggedOut() {
	expect(browser.driver.isElementPresent(protractor.By.css('.login-btn'))).toBeTruthy();
};
function checkLoggedIn() {
	expect(browser.driver.isElementPresent(protractor.By.css('.login-btn'))).toBeFalsy();
};

var originalPassword = 'test1234'; // TODO: Coordinate with other devs on picking a "standard" test username & password. 2014-05 RM
var newPassword = 'abc123';
var currentPassword = originalPassword;

var SfChangePasswordPage = function() {
	this.get = function() {
		browser.get(baseUrl + '/app/changepassword');
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
		login('testuser', currentPassword);
		sfChangePasswordPage.get();
	});

	it('contains a password form', function() {
		expect(sfChangePasswordPage.passwordForm).toBeDefined();
	});

	it('refuses to allow form submission if the confirm input does not match', function() {
		sfChangePasswordPage.passwordInput.sendKeys('abc123');
		sfChangePasswordPage.confirmInput.sendKeys('abcd1234');
		expect(sfChangePasswordPage.signupButton.isEnabled()).toBeFalsy();
	});

	it('allows form submission if the confirm input matches', function() {
		sfChangePasswordPage.passwordInput.sendKeys('abc123');
		sfChangePasswordPage.confirmInput.sendKeys('abc123');
		expect(sfChangePasswordPage.signupButton.isEnabled()).toBeTruthy();
	});

	it('successfully changes user\'s password after form submission', function() {
		sfChangePasswordPage.passwordInput.sendKeys(newPassword);
		sfChangePasswordPage.confirmInput.sendKeys(newPassword);
		sfChangePasswordPage.confirmInput.sendKeys(protractor.Key.ENTER);
		currentPassword = newPassword;
		logout();
		login('testuser', currentPassword);
		checkLoggedIn();
		checkSpecificUserLoggedIn('testuser');
	});

	it('user\'s password has truly been changed', function() {
		logout();
		login('testuser', originalPassword);
		checkLoggedOut();
	});

	it('successfully changes user\'s password back to the original', function() {
		sfChangePasswordPage.passwordInput.sendKeys(originalPassword);
		sfChangePasswordPage.confirmInput.sendKeys(originalPassword);
		sfChangePasswordPage.confirmInput.sendKeys(protractor.Key.ENTER);
		currentPassword = originalPassword;
		logout();
		login('testuser', currentPassword);
		checkLoggedIn();
		checkSpecificUserLoggedIn('testuser');
	});
});
