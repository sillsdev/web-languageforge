'use strict';

var Page = require('astrolabe').Page,
	baseUrl = browser.baseUrl || "http://jamaicanpsalms.scriptureforge.local";
console.log("My base URL is", baseUrl);

var loginPage = require('./pages/loginPage');
var constants = require('../testConstants');

/* Replacing with non-Astrolabe page
var siteAdminPage = Page.create({
	url: { value: baseUrl + "/app/siteadmin" },
	addBtn:         { get: function() { return this.findElement(this.by.partialButtonText('Add New')); }},
	userFilterInput:{ get: function() { return this.findElement(this.by.model('filterUsers')); }},
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
*/
var SiteAdminPage = require('./pages/siteAdminPage');
var siteAdminPage = new SiteAdminPage();
var projectsPage = require('./pages/projectsPage');

describe('Test setup', function() {
	it('verifies that the test_runner_admin account is valid (if this fails, EVERYTHING ELSE will fail!)', function() {

		loginPage.loginAsAdmin();
		// Verify that I'm logged in as an admin by making sure I have a link to app/siteadmin in my user menu
		expect(browser.driver.isElementPresent(by.xpath('.//a[@href="/app/siteadmin"]'))).toBeTruthy();
	});

	it('creates the project manager and project member accounts used in the rest of the E2E tests', function() {
		siteAdminPage.go();

//		siteAdminPage.userFilterInput.sendKeys(constants.managerUsername);
//		browser.sleep(2000);
		// Add project manager account
		siteAdminPage.addBtn.click();
		siteAdminPage.usernameInput.sendKeys(constants.managerUsername);
		siteAdminPage.nameInput    .click(); // Make the onBlur() events fire on username input field
		siteAdminPage.nameInput    .sendKeys(constants.managerName);
		siteAdminPage.emailInput   .sendKeys(constants.managerEmail);
		// siteAdminPage.roleInput .doSomething(); // Not needed right now as "User" is default role
		siteAdminPage.activeCheckbox.isSelected().then(function(checked) {
			// Slightly complicated way to say "activeCheckbox = true", but that's how we need to do it in an E2E testing environment.
			if (!checked) {
				siteAdminPage.activeCheckbox.click();
			};
		});
		siteAdminPage.passwordInput.sendKeys(constants.managerPassword);
		siteAdminPage.passwordInput.sendKeys(protractor.Key.ENTER);

		// Add regular user account
		siteAdminPage.clearForm(); // Otherwise we could end up trying to add the user "test_runner_manager_usertest_runner_normal_user"
		siteAdminPage.addBtn.click();
		siteAdminPage.usernameInput.sendKeys(constants.memberUsername);
		siteAdminPage.nameInput    .click(); // Make the onBlur() events fire on username input field
		siteAdminPage.nameInput    .sendKeys(constants.memberName);
		siteAdminPage.emailInput   .sendKeys(constants.memberEmail);
		siteAdminPage.activeCheckbox.isSelected().then(function(checked) {
			// Slightly complicated way to say "activeCheckbox = true", but that's how we need to do it in an E2E testing environment.
			if (!checked) {
				siteAdminPage.activeCheckbox.click();
			};
		});
		siteAdminPage.passwordInput.sendKeys(constants.memberPassword);
		siteAdminPage.passwordInput.sendKeys(protractor.Key.ENTER);
	});

	it('deletes and re-creates the test project', function() {
		projectsPage.get();
		projectsPage.deleteProject(constants.testProjectName);
		projectsPage.get();
		projectsPage.addNewProject(constants.testProjectName);
		projectsPage.get();
		projectsPage.deleteProject(constants.otherProjectName);
		projectsPage.get();
		projectsPage.addNewProject(constants.otherProjectName);
	});

	it ('adds the appropriate test users to the project', function() {
		projectsPage.get();
		projectsPage.addManagerToProject(constants.testProjectName, constants.managerUsername);
		projectsPage.get();
		projectsPage.addMemberToProject (constants.testProjectName, constants.memberUsername);
	});

	it ('logs out from the admin account and logs in as a normal user', function() {
		loginPage.logout();
		loginPage.loginAsMember();
	});
});
