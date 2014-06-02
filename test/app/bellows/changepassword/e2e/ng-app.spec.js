'use strict';

var constants = require('../../../../testConstants');
var baseUrl = browser.baseUrl || 'http://jamaicanpsalms.scriptureforge.local';
// browser.baseUrl is specified on Protractor command line via "protractor --baseUrl=foo"
// If the --baseUrl parameter is not given on command line, browser.baseUrl will be an empty string

function noop() { ; }

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

var constants = require('../../../../testConstants');
var loginPage = require('../../../pages/loginPage'); 

loginPage.loginAsUser();

var testUser          = constants.memberUsername;
var originalPassword  = constants.memberPassword;
var newPassword       = 'abc123';
var incorrectPassword = newPassword + '4';
var currentPassword   = originalPassword;

var SfChangePasswordPage = function() {
	var page = this; // For use inside our methods. Necessary when passing anonymous functions around, which lose access to "this".

	this.getChangePassword = function() {
		
		this.baseUrl           = browser.baseUrl;
		this.changePasswordURL = '/app/changepassword';

		browser.driver.get(this.baseUrl + this.changePasswordURL);
	};
	this.getUserProfile = function() {
		this.baseUrl          = browser.baseUrl;
		this.userProfileURL   = '/app/userprofile';
		
		browser.driver.get(this.baseUrl + this.userProfileURL);
	};
	this.checkSpecificUserLoggedIn = function(username) {
		browser.sleep(500); // Allow time for the login operation to return us to the front page before proceeding
		// Note that we can't use browser.waitForAngular() here because the front page doesn't have Angular on it.
		// This was causing quite a number of test failures until I added the sleep() call. 2013-05 RM
		//page.getChangePassword();
		page.getUserProfile();
		expect(element(by.binding('user.username')).getText()).toEqual(username);
	};

	this.checkLoggedOut = function() {
		expect(browser.driver.isElementPresent(protractor.By.css('.login-btn'))).toBeTruthy();
	};
	this.checkLoggedIn = function() {
		page.getUserProfile();
		expect(browser.driver.isElementPresent(protractor.By.css('.login-btn'))).toBeFalsy();
	};
	
}; 

describe('E2E testing: Change password', function() {
	var sfChangePasswordPage = new SfChangePasswordPage();
	
	var loginPage = require('../../../pages/loginPage'); 

	sfChangePasswordPage.getChangePassword();
	
	// Do the 
	var passwordForm  = element('form#passwordForm');
	var passwordInput = element(by.model('vars.password'));
	var confirmInput  = element(by.model('vars.confirm_password'));
	var signupButton  = element(by.tagName('button')); // Might need to change this...?

	beforeEach(function() {
		loginPage.login(testUser, currentPassword);
		sfChangePasswordPage.getChangePassword();
	});

	it('contains a password form', function() {
		expect(passwordForm).toBeDefined();
	});

	it('refuses to allow form submission if the confirm input does not match', function() {
		passwordInput.sendKeys(newPassword);
		confirmInput.sendKeys(incorrectPassword);
		expect(signupButton.isEnabled()).toBeFalsy();
	});

	it('allows form submission if the confirm input matches', function() {
		passwordInput.sendKeys(newPassword);
		confirmInput.sendKeys(newPassword);
		expect(signupButton.isEnabled()).toBeTruthy();
	});

	it('successfully changes user\'s password after form submission', function() {
		passwordInput.sendKeys(newPassword);
		confirmInput.sendKeys(newPassword);
		confirmInput.sendKeys(protractor.Key.ENTER);
		currentPassword = newPassword;
		loginPage.logout();
		loginPage.login(testUser, currentPassword);
		sfChangePasswordPage.checkLoggedIn();
		sfChangePasswordPage.checkSpecificUserLoggedIn(testUser);
	});

	it('user\'s password has truly been changed', function() {
		loginPage.logout();
		loginPage.login(testUser, originalPassword);
		sfChangePasswordPage.checkLoggedOut();
	});

	it('successfully changes user\'s password back to the original', function() {
		passwordInput.sendKeys(originalPassword);
		confirmInput.sendKeys(originalPassword);
		confirmInput.sendKeys(protractor.Key.ENTER);
		currentPassword = originalPassword;
		loginPage.logout();
		loginPage.login(testUser, currentPassword);
		sfChangePasswordPage.checkLoggedIn();
		sfChangePasswordPage.checkSpecificUserLoggedIn(testUser);
	});
});
