import { $, browser, by, element, ExpectedConditions } from 'protractor';

import { BellowsLoginPage } from '../../pages/loginPage';
import { SfUserProfilePage } from '../../pages/userProfilePage';
import { Utils } from '../../pages/utils';

describe('User Profile E2E Test', () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const userProfile = new SfUserProfilePage();
  const util = new Utils();

  // Array of test usernames to test Activity page with different roles
  const usernames = [constants.memberUsername, constants.managerUsername];
  const newUsername = 'newusername';
  // Run the Activity E2E as each test user
  usernames.forEach(expectedUsername => {

    // Perform activity E2E tests according to the different roles
    describe('Running as: ' + expectedUsername, () => {
      it('Logging in', () => {
        // Login before test to ensure proper role
        switch (expectedUsername) {
          case constants.memberUsername:
            loginPage.loginAsUser();
            break;
          case constants.managerUsername:
            loginPage.loginAsManager();
            break;
        }
      });

      it('Verify initial "My Account" settings created from setupTestEnvironment.php', () => {
        userProfile.getMyAccount();

        expect(userProfile.myAccountTab.username.getAttribute('value')).toEqual(expectedUsername);
        expect(userProfile.myAccountTab.avatar.getAttribute('src')).toContain(constants.avatar);
        expect<any>(userProfile.myAccountTab.avatarColor.$('option:checked').getText()).toBe('Select a Color...');
        expect<any>(userProfile.myAccountTab.avatarShape.$('option:checked').getText()).toBe('Choose an animal...');
        expect<any>(userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual('');
        expect(userProfile.myAccountTab.emailBtn.isSelected());
      });

      it('Verify initial "About Me" settings created from setupTestEnvironment.php', () => {
        userProfile.getAboutMe();

        let expectedFullname: string = '';
        const expectedAge: string = '';
        const expectedGender: string = '';

        switch (expectedUsername) {
          case constants.memberUsername:
            expectedFullname = constants.memberName;
            break;
          case constants.managerUsername:
            expectedFullname = constants.managerName;
            break;
        }

        expect<any>(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(expectedFullname);
        expect<any>(userProfile.aboutMeTab.age.getAttribute('value')).toEqual(expectedAge);
        expect<any>(userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(expectedGender);
      });

      it('Update and store "My Account" settings', () => {
        userProfile.getMyAccount();

        // Change profile except username
        const newEmail = 'newemail@example.com';
        let newColor: string;
        let newShape: string;
        let newMobilePhone: string;
        let expectedAvatar: string;
        let originalEmail: string;

        switch (expectedUsername) {
          case constants.memberUsername:
            newColor = 'Blue';
            newShape = 'Elephant';
            newMobilePhone = '+1876 5555555';
            expectedAvatar = userProfile.blueElephantAvatarUri;
            originalEmail = constants.memberEmail;
            break;
          case constants.managerUsername:
            newColor = 'Gold';
            newShape = 'Pig';
            newMobilePhone = '+1876 911';
            expectedAvatar = userProfile.goldPigAvatarUri;
            originalEmail = constants.managerEmail;
            break;
        }

        userProfile.myAccountTab.updateEmail(newEmail);

        // Ensure "Blue" won't match "Steel Blue", etc.
        userProfile.myAccountTab.selectColor(new RegExp('^' + newColor + '$'));
        userProfile.myAccountTab.selectShape(newShape);

        userProfile.myAccountTab.updateMobilePhone(newMobilePhone);

        // Modify contact preference
        userProfile.myAccountTab.bothBtn.click();

        // Change Password tested in changepassword e2e

        // Submit updated profile
        userProfile.myAccountTab.saveBtn.click().then(() => {
          browser.refresh();
          browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput),
          constants.conditionTimeout);
        });

        // Verify values.
        expect<any>(userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(newEmail);
        expect<any>(userProfile.myAccountTab.avatar.getAttribute('src')).toContain(expectedAvatar);
        expect<any>(userProfile.myAccountTab.avatarColor.$('option:checked').getText()).toBe(newColor);
        expect<any>(userProfile.myAccountTab.avatarShape.$('option:checked').getText()).toBe(newShape);
        expect<any>(userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual(newMobilePhone);
        expect(userProfile.myAccountTab.bothBtn.isSelected());

        // Restore email address
        userProfile.myAccountTab.updateEmail(originalEmail);
        userProfile.myAccountTab.saveBtn.click().then(() => {
          browser.refresh();
          browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput),
          constants.conditionTimeout);
        });

        expect<any>(userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(originalEmail);
      });

      it('Update and store different username. Login with new credentials', () => {
        const newEmail = 'newemail@example.com';
        let originalEmail: string;

        // Login before test to ensure proper role
        switch (expectedUsername) {
          case constants.memberUsername:
            originalEmail = constants.memberEmail;
            loginPage.loginAsUser();
            break;
          case constants.managerUsername:
            originalEmail = constants.managerEmail;
            loginPage.loginAsManager();
            break;
        }

        userProfile.getMyAccount();

        // Change email
        userProfile.myAccountTab.updateEmail(newEmail);

        // Change to taken username
        userProfile.myAccountTab.updateUsername(constants.observerUsername);
        browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.usernameTaken),
        constants.conditionTimeout);
        expect<any>(userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(true);
        expect<any>(userProfile.myAccountTab.saveBtn.isEnabled()).toBe(false);

        // Change to new username
        userProfile.myAccountTab.updateUsername(newUsername);
        expect<any>(userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(false);

        // Save, Cancel the confirmation modal
        expect<any>(userProfile.myAccountTab.saveBtn.isEnabled()).toBe(true);
        userProfile.myAccountTab.saveBtn.click();
        util.clickModalButton('Cancel');
        browser.refresh();

        // Confirm email not changed
        browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput), constants.conditionTimeout);
        util.scrollTop();
        expect<any>(userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(originalEmail);

        // Change to new username
        userProfile.myAccountTab.updateUsername(newUsername);
        expect<any>(userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(false);

        // Save changes
        expect<any>(userProfile.myAccountTab.saveBtn.isEnabled()).toBe(true);
        userProfile.myAccountTab.saveBtn.click();
        util.clickModalButton('Save changes');
      });

      it('Login with new username and revert to original username', () => {
        // user is automatically logged out and taken to login page when username is changed
        browser.wait(ExpectedConditions.visibilityOf(loginPage.username), constants.conditionTimeout);
        expect<any>(loginPage.infoMessages.count()).toBe(1);
        expect(loginPage.infoMessages.first().getText()).toContain('Username changed. Please login.');

        switch (expectedUsername) {
          case constants.memberUsername:
            loginPage.login(newUsername, constants.memberPassword);
            break;
          case constants.managerUsername:
            loginPage.login(newUsername, constants.managerPassword);
        }

        userProfile.getMyAccount();
        expect<any>(userProfile.myAccountTab.username.getAttribute('value')).toEqual(newUsername);
        userProfile.myAccountTab.updateUsername(expectedUsername);
        userProfile.myAccountTab.saveBtn.click();
        util.clickModalButton('Save changes');
        loginPage.get();
      });

      it('Update and store "About Me" settings', () => {
        switch (expectedUsername) {
          case constants.memberUsername:
            loginPage.loginAsUser();
            break;
          case constants.managerUsername:
            loginPage.loginAsManager();
            break;
        }

        userProfile.getAboutMe();

        // New user profile to put in
        let newFullName: string;
        let newAge: string;
        let newGender: string;

        switch (expectedUsername) {
          case constants.memberUsername:
            newFullName = 'abracadabra';
            newAge = '3.1415';
            newGender = 'Female';
            break;
        case constants.managerUsername:
            newFullName = 'MrAdmin';
            newAge = '33.33';
            newGender = 'Male';
            break;
        }

        // Modify About me
        userProfile.aboutMeTab.updateFullName(newFullName);

        userProfile.aboutMeTab.updateAge(newAge);
        userProfile.aboutMeTab.updateGender(newGender);

        // Submit updated profile
        userProfile.aboutMeTab.saveBtn.click();
        expect<any>(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);

        // Verify values.  Browse to different URL first to force new page load
        userProfile.getAboutMe();

        expect<any>(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);
        expect<any>(userProfile.aboutMeTab.age.getAttribute('value')).toEqual(newAge);
        expect<any>(userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(newGender);
      });
    });
  });
});
