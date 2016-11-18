'use strict';

module.exports = new SfUserProfilePage();

/**
 * This object handles the user profile page and provides methods to access items in the activity
 * list
 */
function SfUserProfilePage() {
  var util = require('./util');
  var _this = this; // For use inside our methods. Necessary when passing anonymous functions
  // around, which lose access to "this".

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
  };

  this.blueElephantAvatarURL = browser.baseUrl +
    '/Site/views/shared/image/avatar/DodgerBlue-elephant-128x128.png';
  this.goldPigAvatarURL = browser.baseUrl + '/Site/views/shared/image/avatar/gold-pig-128x128.png';

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

  this.myAccountTab.selectColor = function selectColor(newColor) {
    util.clickDropdownByValue(_this.myAccountTab.avatarColor, newColor);
  };

  this.myAccountTab.selectShape = function selectShape(newShape) {
    util.clickDropdownByValue(_this.myAccountTab.avatarShape, newShape);
  };

  // For some reason, the values sent with util.sendText weren't consistently being saved.
  // Reverting to sendKeys for now...

  this.myAccountTab.updateEmail = function updateEmail(newEmail) {
    // Modify email address
    //util.sendText(_this.myAccountTab.emailInput, newEmail);
    _this.myAccountTab.emailInput.sendKeys(protractor.Key.CONTROL, 'a');
    _this.myAccountTab.emailInput.sendKeys(newEmail);
  };

  this.myAccountTab.updateMobilePhone = function updateMobilePhone(newPhone) {
    //util.sendText(_this.myAccountTab.mobilePhoneInput, newPhone);
    _this.myAccountTab.mobilePhoneInput.sendKeys(newPhone);
  };

  this.myAccountTab.updateContactPreference = function updateContactPreference() {
    _this.myAccountTab.bothBtn.click();
  };

  this.aboutMeTab = {
    fullName: element(by.model('user.name')),
    age:      element(by.model('user.age')),
    gender:   element(by.model('user.gender')),
    saveBtn:  element(by.partialButtonText('Save'))
  };

  this.aboutMeTab.updateFullName = function updateFullName(newFullName) {
    //util.sendText(_this.aboutMeTab.fullName, newFullName);
    _this.aboutMeTab.fullName.sendKeys(protractor.Key.CONTROL, 'a');
    _this.aboutMeTab.fullName.sendKeys(newFullName);
  };

  this.aboutMeTab.updateAge = function updateAge(newAge) {
    //util.sendText(_this.aboutMeTab.age, newAge);
    _this.aboutMeTab.age.sendKeys(protractor.Key.CONTROL, 'a');
    _this.aboutMeTab.age.sendKeys(newAge);
  };

  this.aboutMeTab.updateGender = function updateGender(newGender) {
    util.clickDropdownByValue(_this.aboutMeTab.gender, newGender);
  };
}
