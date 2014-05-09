'use strict';

var Page = require('astrolabe').Page,
	baseUrl = protractor.baseUrl || "http://jamaicanpsalms.scriptureforge.local";

var SfLoginPage = require('./pages/loginPage');
var loginPage = new SfLoginPage();
var constants = require('../testConstants');

var siteAdminPage = Page.create({
	url: { value: baseUrl + "/app/siteadmin" },
	addBtn:         { get: function() { return this.findElement(this.by.buttonText('Add New')); }},
	usernameInput:  { get: function() { return this.findElement(this.by.model('record.username')); }},
	nameInput:      { get: function() { return this.findElement(this.by.model('record.name')); }},
	emailInput:     { get: function() { return this.findElement(this.by.model('record.email')); }},
	// roleInput:      { get: function() { return this.findElement(this.by.model('record.role')); }}, // Not needed right now as "User" is default role
	activeCheckbox: { get: function() { return this.findElement(this.by.model('record.active')); }},
	passwordInput:  { get: function() { return this.findElement(this.by.model('record.password')); }},

	clearForm: { value: function() {
		this.usernameInput.clear();
		this.nameInput.clear();
		this.emailInput.clear();
		this.passwordInput.clear();
		//this.activeCheckbox.clear();
	}},
});

describe('Test setup', function() {
	it('verifies that the test_runner_admin account is valid (if this fails, EVERYTHING ELSE will fail!)', function() {

		loginPage.loginAsAdmin();
		// Verify that I'm logged in as an admin by making sure I have a link to app/siteadmin in my user menu
		expect(browser.driver.isElementPresent(by.xpath('.//a[@href="/app/siteadmin"]'))).toBeTruthy();
	});

	it('creates the test project, project manager, and project member accounts used in the rest of the E2E tests', function() {
		siteAdminPage.go();

		// Add project manager account
		siteAdminPage.addBtn.click();
		siteAdminPage.usernameInput.sendKeys(loginPage.managerUsername);
		siteAdminPage.nameInput    .click(); // Make the onBlur() events fire on username input field
		siteAdminPage.nameInput    .sendKeys('Test Manager');
		siteAdminPage.emailInput   .sendKeys(loginPage.managerUsername + '@example.com');
		// siteAdminPage.roleInput .doSomething(); // Not needed right now as "User" is default role
		siteAdminPage.activeCheckbox.isSelected().then(function(checked) {
			// Slightly complicated way to say "activeCheckbox = true", but that's how we need to do it in an E2E testing environment.
			if (!checked) {
				siteAdminPage.activeCheckbox.click();
			};
		});
		siteAdminPage.passwordInput.sendKeys(loginPage.managerPassword);
		siteAdminPage.passwordInput.sendKeys(protractor.Key.ENTER);

		// Add regular user account
		siteAdminPage.clearForm(); // Otherwise we could end up trying to add the user "test_runner_manager_usertest_runner_normal_user"
		siteAdminPage.addBtn.click();
		siteAdminPage.usernameInput.sendKeys(loginPage.memberUsername);
		siteAdminPage.nameInput    .click(); // Make the onBlur() events fire on username input field
		siteAdminPage.nameInput    .sendKeys('Test User');
		siteAdminPage.emailInput   .sendKeys(loginPage.memberUsername + '@example.com');
		siteAdminPage.activeCheckbox.isSelected().then(function(checked) {
			// Slightly complicated way to say "activeCheckbox = true", but that's how we need to do it in an E2E testing environment.
			if (!checked) {
				siteAdminPage.activeCheckbox.click();
			};
		});
		siteAdminPage.passwordInput.sendKeys(loginPage.memberPassword);
		siteAdminPage.passwordInput.sendKeys(protractor.Key.ENTER);
	});
});
