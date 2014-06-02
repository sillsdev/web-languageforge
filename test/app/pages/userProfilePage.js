'use strict';

var util = require('./util');

/*
// This object handles the user profile page and provides methods to access items in the activity list
 */
var SfUserProfilePage = function() {
	var page = this; // For use inside our methods. Necessary when passing anonymous functions around, which lose access to "this".

	this.userProfileURL = '/app/userprofile';
	this.activitiesList = element.all(by.repeater('item in filteredActivities'));

	// Navigate to the MyProfile page (defaults to My Account tab)
	this.get = function() {
		browser.get(browser.baseUrl + this.userProfileURL);
	};
	
	// Navigate to the MyProfile -> My Account page
	this.getMyAccount = function() {
		this.get();
	};
	
	this.tabs = {
		myAccount:		element(by.linkText('My Account')),
		aboutMe:			element(by.linkText('About Me')),
	};

	// Navigate to the MyProfile -> About Me page
	this.getAboutMe = function() {
		this.get();
		this.tabs.aboutMe.click();
	};

	this.blueElephantAvatarURL  = browser.baseUrl + '/images/shared/avatar/DodgerBlue-elephant-128x128.png';
	this.goldPigAvatarURL       = browser.baseUrl + '/images/shared/avatar/gold-pig-128x128.png';
	
	this.myAccountTab = {
		avatarColor:      element(by.selectedOption('user.avatar_color')),
		avatarShape:      element(by.selectedOption('user.avatar_shape')),
		avatar:           element(by.id('avatarRef')),
		emailInput:       element(by.model('user.email')),
		// Jamaican mobile phone number will move to Project scope
		mobilePhoneInput: element(by.model('user.mobile_phone')),
		// Contact preferences
		emailBtn:         element(By.partialButtonText('Email')),
		SMSBtn:           element(By.partialButtonText('SMS')),
		bothBtn:          element(By.partialButtonText('Both')),
		saveBtn:          element(By.partialButtonText('Save'))
	};
	
	this.myAccountTab.selectColor = function(newColor) {
		util.clickDropdownByValue(page.myAccountTab.avatarColor, newColor);
	};
	
	this.myAccountTab.selectShape = function(newShape) {
		util.clickDropdownByValue(page.myAccountTab.avatarShape, newShape);
	};
	
	// For some reason, the values sent with util.sendText weren't consistently being saved.
	// Reverting to sendKeys for now...
	
	this.myAccountTab.updateEmail = function(newEmail) {
		// Modify email address
		//util.sendText(page.myAccountTab.emailInput, newEmail);
		page.myAccountTab.emailInput.sendKeys(protractor.Key.CONTROL, "a");
		page.myAccountTab.emailInput.sendKeys(newEmail);
	};
	
	this.myAccountTab.updateMobilePhone = function(newPhone) {
		//util.sendText(page.myAccountTab.mobilePhoneInput, newPhone);
		page.myAccountTab.mobilePhoneInput.sendKeys(newPhone);
	};
	
	this.myAccountTab.updateContactPreference = function() {
		page.myAccountTab.bothBtn.click();
	};

	this.aboutMeTab = {
		fullName: element(by.model('user.name')),
		age:      element(by.model('user.age')),
		gender:   element(by.selectedOption('user.gender')),
		saveBtn:  element(by.partialButtonText('Save'))
	};

	this.aboutMeTab.updateFullName = function(newFullName) {
		//util.sendText(page.aboutMeTab.fullName, newFullName);
		page.aboutMeTab.fullName.sendKeys(protractor.Key.CONTROL, "a");
		page.aboutMeTab.fullName.sendKeys(newFullName);
	};
	
	this.aboutMeTab.updateAge = function(newAge) {
		//util.sendText(page.aboutMeTab.age, newAge);
		page.aboutMeTab.age.sendKeys(protractor.Key.CONTROL, "a");
		page.aboutMeTab.age.sendKeys(newAge);
	};
	
	this.aboutMeTab.updateGender = function(newGender) {
		util.clickDropdownByValue(page.aboutMeTab.gender, newGender);
	};
};

module.exports = new SfUserProfilePage();