import {browser, by, element, ExpectedConditions, protractor} from 'protractor';

import {Utils} from './utils';

export class SfUserProfilePage {
  userProfileURL = '/app/userprofile';
  activitiesList = element.all(by.repeater('item in filteredActivities'));

  // Navigate to the MyProfile page (defaults to My Account tab)
  async get() { // Changes from .baseUrl to getCurrentUrl
    await browser.driver.get(browser.baseUrl + this.userProfileURL);
  }

  // Navigate to the MyProfile -> My Account page
  async getMyAccount() {
    await this.get();
  }

  // Navigate to the MyProfile -> About Me page
  async getAboutMe() {
    await this.get();
    await browser.wait(ExpectedConditions.visibilityOf(this.tabs.aboutMe), Utils.conditionTimeout);
    await this.tabs.aboutMe.click();
    await browser.wait(ExpectedConditions.visibilityOf(this.aboutMeTab.fullName), Utils.conditionTimeout);
  }

  tabs = {
    myAccount:  element(by.id('myAccountTab')),
    aboutMe:    element(by.id('AboutMeTab'))
  };

  blueElephantAvatarUri = '/Site/views/shared/image/avatar/DodgerBlue-elephant-128x128.png';
  goldPigAvatarUri = '/Site/views/shared/image/avatar/gold-pig-128x128.png';

  myAccountTab = {
    emailInput:       element(by.id('email')),
    username:         element(by.id('username')),

    emailTaken:       element(by.id('emailTaken')),
    usernameTaken:    element(by.id('usernameTaken')),

    avatarColor:      element(by.id('user-profile-avatar-color')),
    avatarShape:      element(by.id('user-profile-avatar-shape')),
    avatar:           element(by.id('avatarRef')),

    // Jamaican mobile phone number will move to Project scope
    mobilePhoneInput: element(by.id('mobile_phone')),

    // Contact preferences
    emailBtn:         element(by.id('EmailButton')),
    SMSBtn:           element(by.id('SMSButton')),
    bothBtn:          element(by.id('BothButton')),
    saveBtn:          element(by.id('saveBtn')),

    selectColor: async (newColor: string|RegExp) => {
      await Utils.clickDropdownByValue(this.myAccountTab.avatarColor, newColor);
    },
    selectShape: async (newShape: string|RegExp) => {
      await Utils.clickDropdownByValue(this.myAccountTab.avatarShape, newShape);
    },
    updateEmail: async (newEmail: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.myAccountTab.emailInput), Utils.conditionTimeout);
      await this.myAccountTab.emailInput.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      await this.myAccountTab.emailInput.sendKeys(newEmail);

      // click another field to force validation
      await this.myAccountTab.username.click();
    },
    updateUsername: async (newUsername: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.myAccountTab.username), Utils.conditionTimeout);
      await this.myAccountTab.username.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      await this.myAccountTab.username.sendKeys(newUsername);

      // click another field to force validation
      await this.myAccountTab.emailInput.click();
    },
    updateMobilePhone: async (newPhone: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.myAccountTab.mobilePhoneInput),
        Utils.conditionTimeout);
      await this.myAccountTab.mobilePhoneInput.sendKeys(newPhone);
    },
    async updateContactPreference() {
      await this.bothBtn.click();
    }
  };

  aboutMeTab = {
    fullName: element(by.id('fullname')),
    age:      element(by.id('age')),
    gender:   element(by.id('gender')),
    saveBtn:  element(by.id('saveBtn')),

    updateFullName: async (newFullName: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.aboutMeTab.fullName), Utils.conditionTimeout);
      await this.aboutMeTab.fullName.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      await this.aboutMeTab.fullName.sendKeys(newFullName);
    },
    updateAge: async (newAge: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.aboutMeTab.age), Utils.conditionTimeout);
      await this.aboutMeTab.age.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      await this.aboutMeTab.age.sendKeys(newAge);
    },
    updateGender: async (newGender: string) => {
      await Utils.clickDropdownByValue(this.aboutMeTab.gender, newGender);
    }
  };
}
