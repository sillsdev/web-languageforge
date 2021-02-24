import {browser, by, element, ExpectedConditions, protractor} from 'protractor';

import {Utils} from './utils';

export class SfUserProfilePage {
  userProfileURL = '/app/userprofile';
  activitiesList = element.all(by.repeater('item in filteredActivities'));

  // Navigate to the MyProfile page (defaults to My Account tab)
  get() {
    return browser.get(browser.baseUrl + this.userProfileURL);
  }

  // Navigate to the MyProfile -> My Account page
  getMyAccount() {
    return this.get();
  }

  // Navigate to the MyProfile -> About Me page
  async getAboutMe() {
    await this.get();
    await this.tabs.aboutMe.click();
    return browser.wait(ExpectedConditions.visibilityOf(this.aboutMeTab.fullName), Utils.conditionTimeout);
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

    selectColor: (newColor: string|RegExp) => {
      return Utils.clickDropdownByValue(this.myAccountTab.avatarColor, newColor);
    },
    selectShape: (newShape: string|RegExp) => {
      return Utils.clickDropdownByValue(this.myAccountTab.avatarShape, newShape);
    },
    updateEmail: async (newEmail: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.myAccountTab.emailInput), Utils.conditionTimeout);
      await this.myAccountTab.emailInput.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      await this.myAccountTab.emailInput.sendKeys(newEmail);

      // click another field to force validation
      return this.myAccountTab.username.click();
    },
    updateUsername: async (newUsername: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.myAccountTab.username), Utils.conditionTimeout);
      await this.myAccountTab.username.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      await this.myAccountTab.username.sendKeys(newUsername);

      // click another field to force validation
      return this.myAccountTab.emailInput.click();
    },
    updateMobilePhone: async (newPhone: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.myAccountTab.mobilePhoneInput), Utils.conditionTimeout);
      return this.myAccountTab.mobilePhoneInput.sendKeys(newPhone);
    },
    updateContactPreference() {
      return this.bothBtn.click();
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
      return this.aboutMeTab.fullName.sendKeys(newFullName);
    },
    updateAge: async (newAge: string) => {
      await browser.wait(ExpectedConditions.visibilityOf(this.aboutMeTab.age), Utils.conditionTimeout);
      await this.aboutMeTab.age.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      return this.aboutMeTab.age.sendKeys(newAge);
    },
    updateGender: (newGender: string) => {
      return Utils.clickDropdownByValue(this.aboutMeTab.gender, newGender);
    }
  };
}
