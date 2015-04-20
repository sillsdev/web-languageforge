'use strict';

var constants       = require('../../../testConstants');
var loginPage       = require('../../pages/loginPage');
var userProfile     = require('../../pages/userProfilePage');

// Array of test usernames to test Activity page with different roles
var usernames = [constants.memberUsername,
                 constants.managerUsername
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
  
      it('Verify initial "My Account" settings created from setupTestEnvironment.php', function() {
        userProfile.getMyAccount();
  
        var expectedColor = '';
        
         expect(userProfile.myAccountTab.avatar.getAttribute('src')).toBe(browser.baseUrl + constants.avatar);
        expect(userProfile.myAccountTab.avatarColor.$('option:checked').getText()).toBe('Select a Color...');
        expect(userProfile.myAccountTab.avatarShape.$('option:checked').getText()).toBe('Choose an animal...');
        expect(userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual('');
        expect(userProfile.myAccountTab.emailBtn.isSelected());
      });
      
      it('Verify initial "About Me" settings created from setupTestEnvironment.php', function() {
        userProfile.getAboutMe();
        
        var expectedFullname = '';
        var expectedAge = '';
        var expectedGender = '';
        
        if (expectedUsername == constants.memberUsername) {
          expectedFullname = constants.memberName;
        } else if (expectedUsername == constants.managerUsername) {
          expectedFullname = constants.managerName;
        };
        
        expect(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(expectedFullname);
        expect(userProfile.aboutMeTab.age.getAttribute('value')).toEqual(expectedAge);
        expect(userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(expectedGender);
      });
      
      it('Update and store "My Account" settings', function() {
        userProfile.getMyAccount();

        if (expectedUsername == constants.memberUsername) {
          var newColor         = 'Blue';
          var newShape         = 'Elephant';
          var newMobilePhone   = '+1876 5555555';
          var expectedAvatar   = userProfile.blueElephantAvatarURL;
        } else if (expectedUsername == constants.managerUsername) {
          var newColor         = 'Gold';
          var newShape         = 'Pig';
          var newMobilePhone   = '+1876 911';
          var expectedAvatar   = userProfile.goldPigAvatarURL;
        };

        userProfile.myAccountTab.selectColor('^' + newColor + '$'); // Ensure "Blue" won't match "Steel Blue", etc.
        userProfile.myAccountTab.selectShape(newShape);
        
        userProfile.myAccountTab.updateMobilePhone(newMobilePhone);
        
        // Modify contact preference
        userProfile.myAccountTab.bothBtn.click();
        
        // Change Password tested in changepassword e2e
        // Submit updated profile
        userProfile.myAccountTab.saveBtn.click();

        // we must have an expectation following the button click so that angular is not interrupted by the browser.refresh() below, causing a JS console error
        expect(userProfile.myAccountTab.bothBtn.isSelected());

        browser.refresh();

        // Verify values.
        expect(userProfile.myAccountTab.avatar.getAttribute('src')).toBe(expectedAvatar);
        expect(userProfile.myAccountTab.avatarColor.$('option:checked').getText()).toBe(newColor);
        expect(userProfile.myAccountTab.avatarShape.$('option:checked').getText()).toBe(newShape);
        expect(userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual(newMobilePhone);
        expect(userProfile.myAccountTab.bothBtn.isSelected());
      });

      it('Update and store "About Me" settings', function() {
        userProfile.getAboutMe();

        // New user profile to put in
        var newFullName;
        var newAge;
        var newGender;
        if (expectedUsername == constants.memberUsername) {
          newFullName = 'abracadabra';
          newAge      = '3.1415';
          newGender   = 'Female';
        } else if (expectedUsername == constants.managerUsername) {
          newFullName = 'MrAdmin';
          newAge      = '33.33';
          newGender   = 'Male';
        };

        // Modify About me
        userProfile.aboutMeTab.updateFullName(newFullName);
        
        userProfile.aboutMeTab.updateAge(newAge);
        userProfile.aboutMeTab.updateGender(newGender);
        
        // Submit updated profile
        userProfile.aboutMeTab.saveBtn.click();
        expect(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);

        // Verify values.  Browse to different URL first to force new page load
        userProfile.getAboutMe();

        expect(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);
        expect(userProfile.aboutMeTab.age.getAttribute('value')).toEqual(newAge);
        expect(userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(newGender);
      });
    });
  });
});
