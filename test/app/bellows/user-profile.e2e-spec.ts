import {browser, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from './shared/login.page';
import {SfUserProfilePage} from './shared/user-profile.page';
import {Utils} from './shared/utils';

describe('Bellows E2E User Profile app', async () => {
  const constants = require('../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const userProfile = new SfUserProfilePage();

  // Array of test usernames to test Activity page with different roles
  const usernames = [constants.memberUsername, constants.managerUsername];
  const newUsername = 'newusername';

  // Run the Activity E2E as each test user
  await usernames.forEach(expectedUsername => {

    // Perform activity E2E tests according to the different roles
    describe('Running as: ' + expectedUsername, async () => {
      it('Logging in', async () => {
        // Login before test to ensure proper role
        switch (expectedUsername) {
          case constants.memberUsername:
            await loginPage.loginAsUser();
            break;
          case constants.managerUsername:
            await loginPage.loginAsManager();
            break;
        }
      });

      it('Verify initial "My Account" settings created from setupTestEnvironment.php', async () => {
        await userProfile.getMyAccount();

        expect(await userProfile.myAccountTab.username.getAttribute('value')).toEqual(expectedUsername);
        expect(await userProfile.myAccountTab.avatar.getAttribute('src')).toContain(constants.avatar);
        expect<any>(await userProfile.myAccountTab.avatarColor.$('option:checked').getText())
          .toBe('Select a Color...');
        expect<any>(await userProfile.myAccountTab.avatarShape.$('option:checked').getText())
          .toBe('Choose an animal...');
        expect<any>(await userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual('');
        expect(await userProfile.myAccountTab.emailBtn.isSelected());
      });

      it('Verify initial "About Me" settings created from setupTestEnvironment.php', async () => {
        await userProfile.getAboutMe();
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

        expect<any>(await userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(expectedFullname);
        expect<any>(await userProfile.aboutMeTab.age.getAttribute('value')).toEqual(expectedAge);
        expect<any>(await userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(expectedGender);
      });

      it('Update and store "My Account" settings', async () => {
        await userProfile.getMyAccount();

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

        await userProfile.myAccountTab.updateEmail(newEmail);

        // Ensure "Blue" won't match "Steel Blue", etc.
        await userProfile.myAccountTab.selectColor(new RegExp('^' + newColor + '$'));
        await userProfile.myAccountTab.selectShape(newShape);

        await userProfile.myAccountTab.updateMobilePhone(newMobilePhone);

        // Modify contact preference
        await userProfile.myAccountTab.bothBtn.click();

        // Change Password tested in changepassword e2e

        // Submit updated profile
        userProfile.myAccountTab.saveBtn.click().then(async () => {
         await browser.driver.navigate().refresh();
         await browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput), constants.conditionTimeout);
        });

        // Verify values.
        expect<any>(await userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(newEmail);
        expect<any>(await userProfile.myAccountTab.avatar.getAttribute('src')).toContain(expectedAvatar);
        expect<any>(await userProfile.myAccountTab.avatarColor.$('option:checked').getText()).toBe(newColor);
        expect<any>(await userProfile.myAccountTab.avatarShape.$('option:checked').getText()).toBe(newShape);
        expect<any>(await userProfile.myAccountTab.mobilePhoneInput.getAttribute('value')).toEqual(newMobilePhone);
        expect(await userProfile.myAccountTab.bothBtn.isSelected());

        // Restore email address
        await userProfile.myAccountTab.updateEmail(originalEmail);
        userProfile.myAccountTab.saveBtn.click().then(async () => {
         await browser.driver.navigate().refresh();
         await browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput),
         constants.conditionTimeout);
        });

        expect<any>(await userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(originalEmail);
      });

      it('Update and store different username. Login with new credentials', async () => {
        const newEmail = 'newemail@example.com';
        let originalEmail: string;

        // Login before test to ensure proper role
        switch (expectedUsername) {
          case constants.memberUsername:
            originalEmail = constants.memberEmail;
            await loginPage.loginAsUser();
            break;
          case constants.managerUsername:
            originalEmail = constants.managerEmail;
            await loginPage.loginAsManager();
            break;
        }

        await userProfile.getMyAccount();

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
        await browser.driver.navigate().refresh();
        // Confirm email not changed
        await browser.wait(ExpectedConditions.visibilityOf(userProfile.myAccountTab.emailInput), constants.conditionTimeout);
        await Utils.scrollTop();
        expect<any>(await userProfile.myAccountTab.emailInput.getAttribute('value')).toEqual(originalEmail);

        // Change to new username
        await userProfile.myAccountTab.updateUsername(newUsername);
        expect<any>(await userProfile.myAccountTab.usernameTaken.isDisplayed()).toBe(false);

        // Save changes
        expect<any>(await userProfile.myAccountTab.saveBtn.isEnabled()).toBe(true);
        await userProfile.myAccountTab.saveBtn.click();
        await Utils.clickModalButton('Save changes');
      });

      it('Login with new username and revert to original username', async () => {
        // user is automatically logged out and taken to login page when username is changed
        await browser.wait(ExpectedConditions.visibilityOf(loginPage.username), constants.conditionTimeout);
        expect<any>(await loginPage.infoMessages.count()).toBe(1);
        expect(await loginPage.infoMessages.first().getText()).toContain('Username changed. Please login.');

        switch (expectedUsername) {
          case constants.memberUsername:
            await loginPage.login(newUsername, constants.memberPassword);
            break;
          case constants.managerUsername:
            await loginPage.login(newUsername, constants.managerPassword);
        }

        await userProfile.getMyAccount();
        expect<any>(await userProfile.myAccountTab.username.getAttribute('value')).toEqual(newUsername);
        await userProfile.myAccountTab.updateUsername(expectedUsername);
        await userProfile.myAccountTab.saveBtn.click();
        await Utils.clickModalButton('Save changes');
        await BellowsLoginPage.get();
      });

      it('Update and store "About Me" settings', async () => {
        switch (expectedUsername) {
          case constants.memberUsername:
            await loginPage.loginAsUser();
            break;
          case constants.managerUsername:
            await loginPage.loginAsManager();
            break;
        }

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
        //expect<any>(await userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);

        // Verify values.  Browse to different URL first to force new page load
        await userProfile.getAboutMe();

        expect<any>(await userProfile.aboutMeTab.fullName.getAttribute('value')).toEqual(newFullName);
        expect<any>(await userProfile.aboutMeTab.age.getAttribute('value')).toEqual(newAge);
        expect<any>(await userProfile.aboutMeTab.gender.$('option:checked').getText()).toBe(newGender);
      });
    });
  });
});
