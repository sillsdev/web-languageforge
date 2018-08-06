import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from './shared/login.page';
import {SfUserProfilePage} from './shared/user-profile.page';
import {Utils} from './shared/utils';

describe('Bellows E2E User Profile app', () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const userProfile = new SfUserProfilePage();

  // Array of test usernames to test Activity page with different roles
  const usernames = [constants.memberUsername, constants.managerUsername];
  const newUsername = 'newusername';
  // Run the Activity E2E as each test user
  usernames.forEach(expectedUsername => {

    const newEmail = 'newemail@example.com';
    let newColor: string;
    let newShape: string;
    let newMobilePhone: string;
    let expectedAvatar: string;
    let originalEmail: string;
    let password: string;
    let expectedFullname: string;

    switch (expectedUsername) {
      case constants.memberUsername:
        newColor = 'Blue';
        newShape = 'Elephant';
        newMobilePhone = '+1876 5555555';
        expectedAvatar = userProfile.blueElephantAvatarUri;
        originalEmail = constants.memberEmail;
        password = constants.memberPassword;
        expectedFullname = constants.memberName;
        break;
      case constants.managerUsername:
        newColor = 'Gold';
        newShape = 'Pig';
        newMobilePhone = '+1876 911';
        expectedAvatar = userProfile.goldPigAvatarUri;
        originalEmail = constants.managerEmail;
        password = constants.managerPassword;
        expectedFullname = constants.managerName;
        break;
    }

    function logInAsRole() {
      if (expectedUsername === constants.memberUsername) loginPage.loginAsMember();
      else if (expectedUsername === constants.managerUsername) loginPage.loginAsManager();
    }

    // Perform activity E2E tests according to the different roles
    describe('Running as: ' + expectedUsername, () => {
      it('Logging in', () => {
        logInAsRole();
      });

      it('Verify initial "My Account" settings created from setupTestEnvironment.php', () => {
        userProfile.getMyAccount();

        expect(userProfile.myAccountTab.username.getAttribute('value')).toEqual(expectedUsername);
        expect(userProfile.myAccountTab.avatar.getAttribute('src')).toContain(constants.avatar);
        expect<any>(userProfile.myAccountTab.avatarColor.$('option:checked').getText())
          .toBe('Select a Color...');
        expect<any>(userProfile.myAccountTab.avatarShape.$('option:checked').getText())
          .toBe('Choose an animal...');
        expect<any>(userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual('');
        expect(userProfile.myAccountTab.emailBtn.isSelected());
      });

      it('Verify initial "About Me" settings created from setupTestEnvironment.php', () => {
        userProfile.getAboutMe();

        const expectedAge: string = '';
        const expectedGender: string = '';

        expect<any>(userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(expectedFullname);
        expect<any>(userProfile.aboutMeTab.age.getAttribute('value')).toEqual(expectedAge);
        expect<any>(userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(expectedGender);
      });

      it('Update and store "My Account" settings', () => {
        userProfile.getMyAccount();

        // Change profile except username

        userProfile.myAccountTab.updateEmail(newEmail);

        // Ensure "Blue" won't match "Steel Blue", etc.
        userProfile.myAccountTab.selectColor(new RegExp('^' + newColor + '$'));
        userProfile.myAccountTab.selectShape(newShape);

        userProfile.myAccountTab.updateMobilePhone(newMobilePhone);

        // Modify contact preference
        userProfile.myAccountTab.bothBtn.click();

        // Change Password tested in changepassword e2e

        // Submit updated profile
        userProfile.myAccountTab.saveBtn.click();
      });

      it('Verify that new profile settings persisted', () => {
        browser.refresh();
        browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput), constants.conditionTimeout);

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
        logInAsRole();

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
        Utils.clickModalButton('Cancel');
        browser.refresh();

        // Confirm email not changed
        browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput), constants.conditionTimeout);
        Utils.scrollTop();
        expect<any>(userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(originalEmail);

        // Change to new username
        userProfile.myAccountTab.updateUsername(newUsername);
        expect<any>(userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(false);

        // Save changes
        expect<any>(userProfile.myAccountTab.saveBtn.isEnabled()).toBe(true);
        userProfile.myAccountTab.saveBtn.click();
        Utils.clickModalButton('Save changes');
      });

      it('Login with new username and revert to original username', () => {
        // user is automatically logged out and taken to login page when username is changed
        browser.wait(ExpectedConditions.visibilityOf(loginPage.username), constants.conditionTimeout);
        expect<any>(loginPage.infoMessages.count()).toBe(1);
        expect(loginPage.infoMessages.first().getText()).toContain('Username changed. Please login.');

        loginPage.login(newUsername, password);

        userProfile.getMyAccount();
        expect<any>(userProfile.myAccountTab.username.getAttribute('value')).toEqual(newUsername);
        userProfile.myAccountTab.updateUsername(expectedUsername);
        userProfile.myAccountTab.saveBtn.click();
        Utils.clickModalButton('Save changes');
        BellowsLoginPage.get();
      });

      it('Update and store "About Me" settings', () => {
        logInAsRole();

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
