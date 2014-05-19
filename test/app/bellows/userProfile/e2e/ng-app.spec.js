'use strict';

var util = require('../../../pages/util');

var SfUserPage = function() {
	// Get MyProfile->My Account tab
	this.getMyAccount = function() {
		this.userProfileURL = browser.baseUrl + '/app/userprofile';

		browser.driver.get(this.userProfileURL);
	}
	
	// Get MyProfile->About Me tab
	this.getAboutMe = function() {
		this.getMyAccount();
		browser.driver.findElement(By.id("AboutMeTab")).click();
	}
};

describe('E2E testing: User Profile page', function() {
	var sfUserPage = new SfUserPage();
	
	var SfLoginPage = require('../../../pages/loginPage');
	var loginPage   = new SfLoginPage();
	var constants   = require('../../../../testConstants');

	loginPage.loginAsUser();
	
	it('should update and store "My Account" settings', function() {
		sfUserPage.getMyAccount();

		var newColor         = 'Blue';
		var newShape         = 'Elephant';
		var newMemberEmail   = 'test@123.com';
		var contactButtonID  = 'BothButton'; // Choose from [EmailButton, SMSButton, BothButton]
		var avatarURL        = browser.baseUrl + '/images/shared/avatar/DodgerBlue-elephant-128x128.png';
		var avatarColor      = element(protractor.By.model('user.avatar_color'));
		var avatarShape      = element(protractor.By.model('user.avatar_shape'));
		var avatar           = element(by.id('avatarRef'));
		var emailInput       = element(by.model('user.email'));
		// Jamaican mobile phone number will move to Project scope, so intentionally not tested here
		var mobilePhoneInput = element(by.model('user.mobile_phone'));
		var communicate_via  = element(By.id(contactButtonID));
		
		util.clickDropdownByValue(avatarColor, newColor);
		util.clickDropdownByValue(avatarShape, newShape);
		
		// Modify email address
		emailInput.click();
		emailInput.clear();
		emailInput.sendKeys(newMemberEmail);
		
		// Modify contact preference
		communicate_via.click();
		
		// Change Password tested in changepassword e2e
		
		// Submit updated profile
		browser.driver.findElement(By.id('saveBtn')).click();

		// Verify values
		sfUserPage.getMyAccount();

		expect(avatar.getAttribute('src')).toBe(avatarURL);
		expect(element(by.selectedOption("user.avatar_color")).getText()).toBe(newColor);
		expect(element(by.selectedOption("user.avatar_shape")).getText()).toBe(newShape);
		expect(emailInput.getAttribute('value')).toEqual(newMemberEmail);
		expect(communicate_via.getText()).toContain('Both');
	});

	it('should update and store "About Me" settings', function() {
		sfUserPage.getAboutMe();

		// New user profile to put in
		var newFullName = 'abracadabra';
		var newAge      = '3.1415';
		var newGender   = 'Female';
		var fullName    = element(by.model('user.name'));
		var age         = element(by.model('user.age'));
		var gender      = element(by.model('user.gender'));

		
		// Modify About me
		fullName.click();
		fullName.clear();	
		fullName.sendKeys(newFullName);
		
		age.click();
		age.clear();
		age.sendKeys(newAge);
		util.clickDropdownByValue(gender, newGender);
		
		// Submit updated profile
		browser.driver.findElement(By.id('saveBtn')).click();

		// Verify values
		sfUserPage.getAboutMe();

		expect(fullName.getAttribute('value')).toEqual(newFullName);
		expect(age.getAttribute('value')).toEqual(newAge);
		expect(element(by.selectedOption('user.gender')).getText()).toBe(newGender);
		
	});
});
