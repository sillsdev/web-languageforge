'use strict';

describe('User Profile E2E Test', function () {
  var constants   = require('../../../testConstants');
  var loginPage   = require('../../pages/loginPage');
  var userProfile = require('../../pages/userProfilePage');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  // Array of test usernames to test Activity page with different roles
  var usernames = [constants.memberUsername,
    constants.managerUsername
  ];

  // Run the Activity E2E as each test user
  usernames.forEach(function (expectedUsername) {

    // Perform activity E2E tests according to the different roles
    describe('Running as: ' + expectedUsername, function () {

      fit('Logging in', function () {
        // Login before test to ensure proper role
        if (expectedUsername == constants.memberUsername) {
          loginPage.loginAsUser();
        } else if (expectedUsername == constants.managerUsername) {
          loginPage.loginAsManager();
        }
      });

      it('Verify initial "My Account" settings created from setupTestEnvironment.php', function () {
        userProfile.getMyAccount();

        expect(userProfile.myAccountTab.username.getAttribute('value')).toEqual(expectedUsername);
        expect(userProfile.myAccountTab.avatar.getAttribute('src')).toContain(constants.avatar);
        expect(userProfile.myAccountTab.avatarColor.$('option:checked').getText())
          .toBe('Select a Color...');
        expect(userProfile.myAccountTab.avatarShape.$('option:checked').getText())
          .toBe('Choose an animal...');
        expect(userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual('');
        expect(userProfile.myAccountTab.emailBtn.isSelected());
      });

      it('Verify initial "About Me" settings created from setupTestEnvironment.php', function () {
        userProfile.getAboutMe();

        var expectedFullname = '';
        var expectedAge = '';
        var expectedGender = '';

        if (expectedUsername == constants.memberUsername) {
          expectedFullname = constants.memberName;
        } else if (expectedUsername == constants.managerUsername) {
          expectedFullname = constants.managerName;
        }

        expect(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(expectedFullname);
        expect(userProfile.aboutMeTab.age.getAttribute('value')).toEqual(expectedAge);
        expect(userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(expectedGender);
      });

      it('Update and store "My Account" settings', function () {
        userProfile.getMyAccount();

        var newColor;
        var newShape;
        var newMobilePhone;
        var expectedAvatar;
        if (expectedUsername == constants.memberUsername) {
          newColor         = 'Blue';
          newShape         = 'Elephant';
          newMobilePhone   = '+1876 5555555';
          expectedAvatar   = userProfile.blueElephantAvatarUri;
        } else if (expectedUsername == constants.managerUsername) {
          newColor         = 'Gold';
          newShape         = 'Pig';
          newMobilePhone   = '+1876 911';
          expectedAvatar   = userProfile.goldPigAvatarUri;
        }

        // Ensure "Blue" won't match "Steel Blue", etc.
        userProfile.myAccountTab.selectColor('^' + newColor + '$');
        userProfile.myAccountTab.selectShape(newShape);

        userProfile.myAccountTab.updateMobilePhone(newMobilePhone);

        // Modify contact preference
        userProfile.myAccountTab.bothBtn.click();

        // Change Password tested in changepassword e2e
        // Submit updated profile
        userProfile.myAccountTab.saveBtn.click().then(function () {
          browser.refresh();
        });

        // Verify values.
        expect(userProfile.myAccountTab.avatar.getAttribute('src')).toContain(expectedAvatar);
        expect(userProfile.myAccountTab.avatarColor.$('option:checked').getText()).toBe(newColor);
        expect(userProfile.myAccountTab.avatarShape.$('option:checked').getText()).toBe(newShape);
        expect(userProfile.myAccountTab.mobilePhoneInput.getAttribute('value'))
          .toEqual(newMobilePhone);
        expect(userProfile.myAccountTab.bothBtn.isSelected());
      });

      it('Update and store "About Me" settings', function () {
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
        }

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

      fit('Update and store different username. Login with new credentials', function () {
        // Login before test to ensure proper role
        if (expectedUsername == constants.memberUsername) {
          loginPage.loginAsUser();
        } else if (expectedUsername == constants.managerUsername) {
          loginPage.loginAsManager();
        }

        userProfile.getMyAccount();
        var newUsername = 'newusername';

        // Try taken username
        userProfile.myAccountTab.updateUsername(constants.observerUsername);
        expect(userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(true);
        expect(userProfile.myAccountTab.saveBtn.isEnabled()).toBe(false);

        // Change username
        userProfile.myAccountTab.updateUsername(newUsername);
        expect(userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(false);
        expect(userProfile.myAccountTab.saveBtn.isEnabled()).toBe(true);
        userProfile.myAccountTab.saveBtn.click();

        // Login with new username and revert to original username
        browser.wait(expectedCondition.visibilityOf(loginPage.username), CONDITION_TIMEOUT);
        expect(loginPage.infoMessages.count()).toBe(1);
        expect(loginPage.infoMessages.first().getText()).toContain(
          'Username/email changed. Please login.');

        if (expectedUsername == constants.memberUsername) {
          loginPage.login(newUsername, constants.memberPassword);
        } else if (expectedUsername == constants.managerUsername) {
          loginPage.login(newUsername, constants.managerPassword);
        }

        userProfile.getMyAccount();
        userProfile.myAccountTab.updateUsername(expectedUsername);
        userProfile.myAccountTab.saveBtn.click();
        browser.wait(expectedCondition.visibilityOf(loginPage.username), CONDITION_TIMEOUT);
      });

      fit('Update and store different email. Login with new credentials', function () {
        // Login before test to ensure proper role
        if (expectedUsername == constants.memberUsername) {
          loginPage.loginAsUser();
        } else if (expectedUsername == constants.managerUsername) {
          loginPage.loginAsManager();
        }

        userProfile.getMyAccount();
        var newEmail = 'newemail@example.com';

        // Try taken email
        userProfile.myAccountTab.updateEmail(constants.observerEmail);
        expect(userProfile.myAccountTab.emailTaken.isDisplayed()).toBe(true);
        expect(userProfile.myAccountTab.saveBtn.isEnabled()).toBe(false);

        // Change email
        userProfile.myAccountTab.updateEmail(newEmail);
        expect(userProfile.myAccountTab.emailTaken.isDisplayed()).toBe(false);
        expect(userProfile.myAccountTab.saveBtn.isEnabled()).toBe(true);
        userProfile.myAccountTab.saveBtn.click();

        // Login with new email and revert to original email
        browser.wait(expectedCondition.visibilityOf(loginPage.username), CONDITION_TIMEOUT);

        // TODO: for some reason flashbag not appearing when changing email address
        //expect(loginPage.infoMessages.count()).toBe(1);
        //expect(loginPage.infoMessages.first().getText()).toContain(
        //  'Username/email changed. Please login.');

        var password;
        var email;
        if (expectedUsername == constants.memberUsername) {
          password = constants.memberPassword;
          email = constants.memberEmail;
        } else if (expectedUsername == constants.managerUsername) {
          password = constants.managerPassword;
          email = constants.managerEmail;
        }

        loginPage.login(newEmail, password);

        userProfile.getMyAccount();
        userProfile.myAccountTab.updateEmail(email);
        userProfile.myAccountTab.saveBtn.click();
        browser.wait(expectedCondition.visibilityOf(loginPage.username), CONDITION_TIMEOUT);
      });
    });

  });

});
