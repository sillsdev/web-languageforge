import {browser, by, element, ExpectedConditions, protractor} from 'protractor';
import { Utils } from './utils';
const CONDITION_TIMEOUT = 3000;
const util = new Utils();
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
    browser.wait(ExpectedConditions.visibilityOf(this.aboutMeTab.fullName), CONDITION_TIMEOUT);
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
      util.clickDropdownByValue(this.avatarColor, newColor);
    },
    selectShape(newShape: string|RegExp) {
      util.clickDropdownByValue(this.avatarShape, newShape);
    },
    updateEmail(newEmail: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.emailInput), CONDITION_TIMEOUT);
      this.emailInput.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      this.emailInput.sendKeys(newEmail);

      // click another field to force validation
      this.username.click();
    },
    updateUsername(newUsername: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.username), CONDITION_TIMEOUT);
      this.username.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      this.username.sendKeys(newUsername);

      // click another field to force validation
      this.emailInput.click();
    },
    updateMobilePhone(newPhone: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.mobilePhoneInput), CONDITION_TIMEOUT);
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
      browser.wait(ExpectedConditions.visibilityOf(this.fullName), CONDITION_TIMEOUT);
      this.fullName.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      this.fullName.sendKeys(newFullName);
    },
    updateAge(newAge: string) {
      browser.wait(ExpectedConditions.visibilityOf(this.age), CONDITION_TIMEOUT);
      this.age.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      this.age.sendKeys(newAge);
    },
    updateGender(newGender: string) {
      util.clickDropdownByValue(this.gender, newGender);
    }
  };
}
