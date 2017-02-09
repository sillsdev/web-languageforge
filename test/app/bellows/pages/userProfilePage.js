'use strict';

module.exports = new SfUserProfilePage();

/**
 * This object handles the user profile page and provides methods to access items in the activity
 * list
 */
function SfUserProfilePage() {
  var util = require('./util');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  this.userProfileURL = '/app/userprofile';
  this.activitiesList = element.all(by.repeater('item in filteredActivities'));

  // Navigate to the MyProfile page (defaults to My Account tab)
  this.get = function get() {
    browser.get(browser.baseUrl + this.userProfileURL);
  };

  // Navigate to the MyProfile -> My Account page
  this.getMyAccount = function getMyAccount() {
    this.get();
  };

  this.tabs = {
    myAccount:    element(by.linkText('My Account')),
    aboutMe:      element(by.linkText('About Me'))
  };

  // Navigate to the MyProfile -> About Me page
  this.getAboutMe = function getAboutMe() {
    this.get();
    this.tabs.aboutMe.click();
    browser.wait(expectedCondition.visibilityOf(this.aboutMeTab.fullName), CONDITION_TIMEOUT);
  };

  this.blueElephantAvatarUri = '/Site/views/shared/image/avatar/DodgerBlue-elephant-128x128.png';
  this.goldPigAvatarUri = '/Site/views/shared/image/avatar/gold-pig-128x128.png';

  this.myAccountTab = {
    avatarColor:      element(by.model('user.avatar_color')),
    avatarShape:      element(by.model('user.avatar_shape')),
    avatar:           element(by.id('avatarRef')),
    emailInput:       element(by.model('user.email')),

    // Jamaican mobile phone number will move to Project scope
    mobilePhoneInput: element(by.model('user.mobile_phone')),

    // Contact preferences
    emailBtn:         element(By.partialButtonText('Email')),
    SMSBtn:           element(By.partialButtonText('SMS')),
    bothBtn:          element(By.partialButtonText('Both')),
    saveBtn:          element(By.partialButtonText('Save'))
  };

  this.myAccountTab.selectColor = function (newColor) {
    util.clickDropdownByValue(this.myAccountTab.avatarColor, newColor);
  }.bind(this);

  this.myAccountTab.selectShape = function (newShape) {
    util.clickDropdownByValue(this.myAccountTab.avatarShape, newShape);
  }.bind(this);

  // For some reason, the values sent with util.sendText weren't consistently being saved.
  // Reverting to sendKeys for now...

  this.myAccountTab.updateEmail = function (newEmail) {
    browser.wait(expectedCondition.visibilityOf(this.myAccountTab.emailInput), CONDITION_TIMEOUT);
    this.myAccountTab.emailInput.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
    this.myAccountTab.emailInput.sendKeys(newEmail);
  }.bind(this);

  this.myAccountTab.updateMobilePhone = function (newPhone) {
    browser.wait(expectedCondition.visibilityOf(this.myAccountTab.mobilePhoneInput),
      CONDITION_TIMEOUT);
    this.myAccountTab.mobilePhoneInput.sendKeys(newPhone);
  }.bind(this);

  this.myAccountTab.updateContactPreference = function () {
    this.myAccountTab.bothBtn.click();
  }.bind(this);

  this.aboutMeTab = {
    fullName: element(by.model('user.name')),
    age:      element(by.model('user.age')),
    gender:   element(by.model('user.gender')),
    saveBtn:  element(by.partialButtonText('Save'))
  };

  this.aboutMeTab.updateFullName = function (newFullName) {
    browser.wait(expectedCondition.visibilityOf(this.aboutMeTab.fullName), CONDITION_TIMEOUT);
    this.aboutMeTab.fullName.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
    this.aboutMeTab.fullName.sendKeys(newFullName);
  }.bind(this);

  this.aboutMeTab.updateAge = function (newAge) {
    browser.wait(expectedCondition.visibilityOf(this.aboutMeTab.age), CONDITION_TIMEOUT);
    this.aboutMeTab.age.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
    this.aboutMeTab.age.sendKeys(newAge);
  }.bind(this);

  this.aboutMeTab.updateGender = function (newGender) {
    util.clickDropdownByValue(this.aboutMeTab.gender, newGender);
  }.bind(this);
}
