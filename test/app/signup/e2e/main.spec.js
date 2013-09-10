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
		// moving away from the username field triggers a username exists lookup
		input("record.name").enter("Administrator");
		sleep(1);
		expect(element("span#userNameExists").css("display")).toBe("block");
	});
	
	it("can verify that 'newuser' is an available username", function() {
		input("record.username").enter("newuser");
		// moving away from the username field triggers a username exists lookup
		input("record.name").enter("New User");
		expect(element("span#userNameExists").css("display")).toBe("none");
	});
	
});
