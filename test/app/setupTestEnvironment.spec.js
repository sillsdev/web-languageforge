'use strict';

var Page = require('astrolabe').Page,
	baseUrl = protractor.baseUrl || "http://jamaicanpsalms.scriptureforge.local";

var SfLoginPage = require('./pages/loginPage');
var loginPage = new SfLoginPage();

var siteAdminPage = Page.create({
	url: { value: baseUrl + "/app/siteadmin" },
	identity: { get: function() { return this.findElement(this.by.input('identity')); }},
	password: { get: function() { return this.findElement(this.by.input('password')); }},
	submit:   { get: function() { return this.findElement(this.by.id('submit')); }},
});

describe('Test setup', function() {
	it('verifies that the test_runner_admin account is valid (if this fails, EVERYTHING ELSE will fail!)', function() {

		loginPage.loginAsAdmin();
		// Verify that I'm logged in as an admin by making sure I have a link to app/siteadmin in my user menu
		expect(browser.driver.isElementPresent(by.xpath('.//a[@href="/app/siteadmin"]'))).toBeTruthy();
	});
	// Once a search feature is implemented in the site admin users list, the below will actuall do something instead of just printing to the console
	it('creates the test project, project manager, and project member accounts used in the rest of the E2E tests', function() {
		// Eventually this will become a real setup that finds and creates the appropriate users. For now, it has to be done by hand
		console.log('Please create a project named', 'test_project'); // TODO: Make that name a member variable in the projectPage page, which has yet to be created, instead of hardcoding it here.
		console.log('Please create a user named', loginPage.managerUsername, 'with password', loginPage.managerPassword, 'and make sure it is a project manager in that project');
		console.log('Please create a user named', loginPage.memberUsername, 'with password', loginPage.memberPassword, 'and make sure it is a member of that project');
	});
});
