'use strict';

var SfLoginPageWithoutAstrolabe = function() {
	var page = this; // For use inside our methods. Necessary when passing anonymous functions around, which lose access to "this".

	this.adminUsername   = 'test_runner_admin';
	this.adminPassword   = 'hammertime';
	this.managerUsername = 'test_runner_manager_user';
	this.managerPassword = 'manageruser1';
	this.memberUsername  = 'test_runner_normal_user';
	this.memberPassword  = 'normaluser1';

	this.baseUrl = browser.baseUrl || 'http://jamaicanpsalms.scriptureforge.local';
	this.get = function() {
		return browser.driver.get(this.baseUrl + '/auth/login');
	};

	// Note that we can't use browser.driver.findElement() yet, as that doesn't return a promise
	// but tries to find the element *immediately*. We have to use findElement() later, in the login() function
	this.username = by.id('identity');
	this.password = by.id('password');
	this.submit   = by.xpath('//input[@type="submit"]');

	this.login = function(username, password) {
		page.get();

		// Now we need to wait for the page to load
		browser.driver.wait(function() {
			// wait() wants a function that will return true when we should finish waiting.
			// In other words, we should return a promise that, when it is fulfilled, means "You can stop waiting now".
			// Here, we use "Is the username field present?" as the promise that fulfills the wait condition.
			return browser.driver.isElementPresent(page.username); // NOTE: using "this.username" would have failed, because "this" is undefined right now.
		}, 8000); // Timeout if still not loaded after 8 seconds

		browser.driver.findElement(page.username).sendKeys(username);
		browser.driver.findElement(page.password).sendKeys(password);
		browser.driver.findElement(page.submit).click();
	};
	this.loginAsAdmin = function() {
		this.login(this.adminUsername, this.adminPassword);
	};
	this.loginAsManager = function() {
		this.login(this.managerUsername, this.managerPassword);
	};
	this.loginAsUser = this.loginAsMember = function() {
		this.login(this.memberUsername, this.memberPassword);
	};
	this.logout = function() {
		browser.driver.get(this.baseUrl + '/auth/logout');
	};
};

// WARNING: SfLoginPageWithAstrolabe is NOT working yet. Do NOT use it while this comment is still in the code.
var astrolabe = require('astrolabe');
var SfLoginPageWithAstrolabe = astrolabe.Page.create({
	adminUsername:   { value: 'test_runner_admin' },
	adminPassword:   { value: 'hammertime' },
	managerUsername: { value: 'test_runner_manager_user' },
	managerPassword: { value: 'manageruser1' },
	memberUsername:  { value: 'test_runner_normal_user' },
	memberPassword:  { value: 'normaluser1' },
	baseUrl: { value: browser.baseUrl || 'http://jamaicanpsalms.scriptureforge.local' },
	url:     { value: this.baseUrl + "/auth/login" },
	username: { get: function() { return this.findElement(this.by.id('identity')); }},
	password: { get: function() { return this.findElement(this.by.id('password')); }},
	submit:   { get: function() { return this.findElement(this.by.xpath('//input[@type="submit"]')); }},

	login: { value: function(username, password) {
		var page = this;
		page.go();
		browser.driver.wait(function() {
			// wait() wants a function that will return true when we should finish waiting.
			// In other words, we should return a promise that, when it is fulfilled, means "You can stop waiting now".
			// Here, we use "Is the username field present?" as the promise that fulfills the wait condition.
			return browser.driver.isElementPresent(by.id('identity')); // NOTE: using "this.username" would have failed, because "this" is undefined right now.
		}, 8000); // Timeout if still not loaded after 8 seconds

		page.username.sendKeys(username);
		page.password.sendKeys(password);
		page.submit.click();
	}},
	loginAsAdmin: { value: function() {
		this.login(this.adminUsername, this.adminPassword);
	}},
	loginAsManager: { value: function() {
		this.login(this.managerUsername, this.managerPassword);
	}},
	loginAsUser: { value: function() {
		this.login(this.memberUsername, this.memberPassword);
	}},
	loginAsMember: { value: function() {
		this.login(this.memberUsername, this.memberPassword);
	}},
	logout: { value: function() {
		browser.driver.get(this.baseUrl + '/auth/logout');
	}}

});

module.exports = SfLoginPageWithoutAstrolabe;
// This makes the result of calling require('./pages/loginPage') to be the SfLoginPage constructor function.
// So you'd use this as "var LoginPage = require('./pages/loginPage'); var loginPage = new LoginPage();"
