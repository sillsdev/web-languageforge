'use strict';

var constants   = require('../../../../testConstants');
var loginPage   = require('../../../pages/loginPage');
var userProfile = require('../../../pages/userProfilePage');

// Array of test usernames to test Activity page with different roles
var usernames = [constants.memberUsername,
                 //constants.managerUsername
				 ];

describe('User Profile E2E Test', function() {

	// Run the Activity E2E as each test user
	usernames.forEach(function(expectedUsername){

		// Perform activity E2E tests according to the different roles
		describe('Running as: ' + expectedUsername, function() {

			it('Logging in', function() {
				// Login before test to ensure proper role
				if (expectedUsername == constants.memberUsername) {
					loginPage.loginAsUser();
				} else if (expectedUsername == constants.managerUsername) {
					loginPage.loginAsManager();
				};
			});
	
			it('Update and store "My Account" settings', function() {
				userProfile.getMyAccount();

				var newColor         = 'Blue';
				var newShape         = 'Elephant';
				var newMemberEmail   = 'test@123.com';
				var newMobilePhone   = '5555555';

				userProfile.myAccountTab.selectColor(newColor);
				userProfile.myAccountTab.selectShape(newShape);
				
				userProfile.myAccountTab.updateEmail(newMemberEmail);
				userProfile.myAccountTab.updateMobilePhone(newMobilePhone);
				
				// Modify contact preference
				userProfile.myAccountTab.bothBtn.click();
				
				// Change Password tested in changepassword e2e
				
				// Submit updated profile
				userProfile.myAccountTab.saveBtn.click();

				// Verify values
				userProfile.getMyAccount();

 				expect(userProfile.myAccountTab.avatar.getAttribute('src')).toBe(userProfile.avatarURL);
				expect(userProfile.myAccountTab.avatarColor.getText()).toBe(newColor);
				expect(userProfile.myAccountTab.avatarShape.getText()).toBe(newShape);
				expect(userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(newMemberEmail);
				expect(userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual(newMobilePhone);
				expect(userProfile.myAccountTab.bothBtn.isSelected());
			});

			it('Update and store "About Me" settings', function() {
				userProfile.getAboutMe();

				// New user profile to put in
				var newFullName = 'abracadabra';
				var newAge      = '3.1415';
				var newGender   = 'Female';

				// Modify About me
				userProfile.aboutMeTab.updateFullName(newFullName);
				
				userProfile.aboutMeTab.updateAge(newAge);
				userProfile.aboutMeTab.updateGender(newGender);
				
				// Submit updated profile
				userProfile.aboutMeTab.saveBtn.click();

				// Verify values
				userProfile.getAboutMe();

				expect(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);
				expect(userProfile.aboutMeTab.age.getAttribute('value')).toEqual(newAge);
				expect(userProfile.aboutMeTab.gender.getText()).toBe(newGender);
			
			});
		});
	});
});
