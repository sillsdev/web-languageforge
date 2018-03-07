import {browser, by, element, ExpectedConditions, protractor} from 'protractor';

import { Utils } from './utils';

// TODO This 'utils' should be moved inside the class somehow.
// So far attempts at making this a member variable have resulted in runtime errors - cjh 2018-03-07
const utils = new Utils();

/*
 * This object handles the user profile page and provides methods to access items in the activity
 * list
 */
export class SfUserProfilePage {
  userProfileURL = '/app/userprofile';
  activitiesList = element.all(by.repeater('item in filteredActivities'));

  // Navigate to the MyProfile page (defaults to My Account tab)
  get() {
    browser.get(browser.baseUrl + this.userProfileURL);
  }

  // Navigate to the MyProfile -> My Account page
  getMyAccount() {
    this.get();
  }

  // Navigate to the MyProfile -> About Me page
  getAboutMe() {
    this.get();
    this.tabs.aboutMe.click();
    browser.wait(ExpectedConditions.visibilityOf(this.aboutMeTab.fullName), utils.conditionTimeout);
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

    selectColor(newColor: string|RegExp) {
      utils.clickDropdownByValue(this.avatarColor, newColor);
    },
    selectShape(newShape: string|RegExp) {
      utils.clickDropdownByValue(this.avatarShape, newShape);
    },
    updateEmail(newEmail: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.emailInput), utils.conditionTimeout);
      this.emailInput.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      this.emailInput.sendKeys(newEmail);

      // click another field to force validation
      this.username.click();
    },
    updateUsername(newUsername: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.username), utils.conditionTimeout);
      this.username.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      this.username.sendKeys(newUsername);

      // click another field to force validation
      this.emailInput.click();
    },
    updateMobilePhone(newPhone: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.mobilePhoneInput), utils.conditionTimeout);
      this.mobilePhoneInput.sendKeys(newPhone);
    },
    updateContactPreference() {
      this.bothBtn.click();
    }
  };

  aboutMeTab = {
    fullName: element(by.id('fullname')),
    age:      element(by.id('age')),
    gender:   element(by.id('gender')),
    saveBtn:  element(by.id('saveBtn')),

    updateFullName(newFullName: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.fullName), utils.conditionTimeout);
      this.fullName.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      this.fullName.sendKeys(newFullName);
    },
    updateAge(newAge: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.age), utils.conditionTimeout);
      this.age.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      this.age.sendKeys(newAge);
    },
    updateGender(newGender: string) {
      utils.clickDropdownByValue(this.gender, newGender);
    }
  };
}
