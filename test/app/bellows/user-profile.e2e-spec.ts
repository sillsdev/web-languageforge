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
      if (expectedUsername === constants.memberUsername) return loginPage.loginAsMember();
      else if (expectedUsername === constants.managerUsername) return loginPage.loginAsManager();
    }

    // Perform activity E2E tests according to the different roles
    describe('Running as: ' + expectedUsername, () => {
      it('Logging in', async () => {
        await logInAsRole();
      });

      it('Verify initial "My Account" settings created from setupTestEnvironment.php', async () => {
        await userProfile.getMyAccount();

        expect(await userProfile.myAccountTab.username.getAttribute('value')).toEqual(expectedUsername);
        expect(await userProfile.myAccountTab.avatar.getAttribute('src')).toContain(constants.avatar);
        expect<string>(await userProfile.myAccountTab.avatarColor.$('option:checked').getText())
          .toBe('Select a Color...');
        expect<string>(await userProfile.myAccountTab.avatarShape.$('option:checked').getText())
          .toBe('Choose an animal...');
        expect<string>(await userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual('');
        expect(await userProfile.myAccountTab.emailBtn.isSelected());
      });

      it('Verify initial "About Me" settings created from setupTestEnvironment.php', async () => {
        await userProfile.getAboutMe();

        const expectedAge: string = '';
        const expectedGender: string = '';

        expect<string>(await userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(expectedFullname);
        expect<string>(await userProfile.aboutMeTab.age.getAttribute('value')).toEqual(expectedAge);
        expect<string>(await userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(expectedGender);
      });

      it('Update and store "My Account" settings', async () => {
        await userProfile.getMyAccount();

        // Change profile except username

        await userProfile.myAccountTab.updateEmail(newEmail);

        // Ensure "Blue" won't match "Steel Blue", etc.
        await userProfile.myAccountTab.selectColor(new RegExp('^' + newColor + '$'));
        await userProfile.myAccountTab.selectShape(newShape);

        await userProfile.myAccountTab.updateMobilePhone(newMobilePhone);

        // Modify contact preference
        await userProfile.myAccountTab.bothBtn.click();

        // Change Password tested in changepassword e2e

        // Submit updated profile
        await userProfile.myAccountTab.saveBtn.click();
      });

      it('Verify that new profile settings persisted', async () => {
        await browser.refresh();
        await browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput), constants.conditionTimeout);

        // Verify values.
        expect<any>(await userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(newEmail);
        expect<any>(await userProfile.myAccountTab.avatar.getAttribute('src')).toContain(expectedAvatar);
        expect<any>(await userProfile.myAccountTab.avatarColor.$('option:checked').getText()).toBe(newColor);
        expect<any>(await userProfile.myAccountTab.avatarShape.$('option:checked').getText()).toBe(newShape);
        expect<any>(await userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual(newMobilePhone);
        expect(await userProfile.myAccountTab.bothBtn.isSelected());

        // Restore email address
        await userProfile.myAccountTab.updateEmail(originalEmail);
        await userProfile.myAccountTab.saveBtn.click().then(async () => {
          await browser.refresh();
          await browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput),
          constants.conditionTimeout);
        });

        expect<any>(await userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(originalEmail);
      });

      it('Update and store different username. Login with new credentials', async () => {
        // Change email
        await userProfile.myAccountTab.updateEmail(newEmail);

        // Change to taken username
        await userProfile.myAccountTab.updateUsername(constants.observerUsername);
        await browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.usernameTaken),
          constants.conditionTimeout);
        expect<any>(await userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(true);
        expect<any>(await userProfile.myAccountTab.saveBtn.isEnabled()).toBe(false);

        // Change to new username
        await userProfile.myAccountTab.updateUsername(newUsername);
        expect<any>(await userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(false);

        // Save, Cancel the confirmation modal
        expect<any>(await userProfile.myAccountTab.saveBtn.isEnabled()).toBe(true);
        await userProfile.myAccountTab.saveBtn.click();
        await Utils.clickModalButton('Cancel');
        await browser.wait(ExpectedConditions.elementToBeClickable(userProfile.myAccountTab.saveBtn));

        await browser.refresh();

        // Confirm email not changed
        await browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput), constants.conditionTimeout);
        await browser.wait(ExpectedConditions.elementToBeClickable(userProfile.myAccountTab.saveBtn));
        await Utils.scrollTop();
        expect<any>(await userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(originalEmail);

        // Change to new username
        await userProfile.myAccountTab.updateUsername(newUsername);
        expect<any>(await userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(false);

        // Save changes
        expect<any>(await userProfile.myAccountTab.saveBtn.isEnabled()).toBe(true);
        await userProfile.myAccountTab.saveBtn.click();

        await Utils.clickModalButton('Save changes');
        await Utils.waitForNewAngularPage('login');
        await browser.wait(ExpectedConditions.visibilityOf(loginPage.username), constants.conditionTimeout);
        expect<any>(await loginPage.infoMessages.count()).toBe(1);
        expect(await loginPage.infoMessages.first().getText()).toContain('Username changed. Please login.');
      });

      it('Login with new username and revert to original username', async () => {
        // user is automatically logged out and taken to login page when username is changed
        await loginPage.login(newUsername, password);

        await userProfile.getMyAccount();
        expect<any>(await userProfile.myAccountTab.username.getAttribute('value')).toEqual(newUsername);
        await userProfile.myAccountTab.updateUsername(expectedUsername);
        await userProfile.myAccountTab.saveBtn.click();
        await Utils.clickModalButton('Save changes');
        await BellowsLoginPage.get();
      });

      it('Update and store "About Me" settings', async () => {
        await logInAsRole();

        await userProfile.getAboutMe();

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
        await userProfile.aboutMeTab.updateFullName(newFullName);

        await userProfile.aboutMeTab.updateAge(newAge);
        await userProfile.aboutMeTab.updateGender(newGender);

        // Submit updated profile
        await userProfile.aboutMeTab.saveBtn.click();
        expect<any>(await userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);

        // Verify values.  Browse to different URL first to force new page load
        await userProfile.getAboutMe();

        expect<any>(await userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);
        expect<any>(await userProfile.aboutMeTab.age.getAttribute('value')).toEqual(newAge);
        expect<any>(await userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(newGender);
      });
    });
  });
});
