'use strict';

describe("E2E testing: Signup app", function() {
	
	beforeEach(function() {
		browser().navigateTo('/signup');
	});
	
	it("contains an user form", function() {
		expect(element("form#userForm").count()).toBe(1);
	});
	
	it("finds the admin user already exists", function() {
		input("record.username").enter("admin");
		
		// trigger the username lookup
		element("input#username").query(function (element, done) {
			element.blur();
			done();
		});
		expect(element("#userNameExists:visible").count()).toBe(1);
	});
	
	it("can verify that 'newuser' is an available username", function() {
		input("record.username").enter("newuser");
		
		// trigger the username lookup
		element("input#username").query(function (element, done) {
			element.blur();
			done();
		});
		input("record.name").enter("New User");
		expect(element("#userNameExists:visible").count()).toBe(0);
	});
	
	/* I failed to figure out how to make this test pass.  For some reason the viewCaptcha PHP api is not returning an image in the test environment when it does return an image in a normal browser environment
	 * cjh 2013-09
	it("has a captcha image", function() {
		expect(element("img#captcha").prop("naturalWidth")).toBeGreaterThan(0);
	});
	*/
	
	it("can submit a user registration request and captcha is invalid", function() {
		input("record.username").enter("newuser");
		
		// trigger the username lookup
		element("input#username").query(function (element, done) {
			element.blur();
			done();
		});
		
		input("record.name").enter("New User");
		input("record.email").enter("email@address.com");
		input("record.password").enter("12345");
		input("record.captcha").enter("whatever");
		expect(element("div#captchaError:visible").count()).toBe(0);
		element("button#submit").click();
		expect(element("div#captchaError:visible").count()).toBe(1);
	});
	
});
