'use strict';

module.exports = new SfActivityPage();

/*
// This object handles the activity page and provides methods to access items in the activity list
 */
function SfActivityPage() {
  this.activityURL = '/app/activity';
  this.activitiesList = element.all(by.repeater('item in filteredActivities'));

  // Navigate to the Activity page
  this.get = function get() {
    browser.get(browser.baseUrl + this.activityURL);
  };

  this.clickOnAllActivity = function clickOnAllActivity() {
    element(by.partialButtonText('All Activity')).click();
  };

  this.clickOnShowOnlyMyActivity = function clickOnShowOnlyMyActivity() {
    element(by.partialButtonText('Show Only My Activity')).click();
  };

  // Returns the number of items in the activity list
  //noinspection JSUnusedGlobalSymbols
  this.getLength = function getLength() {
    return this.activitiesList.count();
  };

  // Returns the text in the activity list for a specified index
  this.getActivityText = function getActivityText(index) {
    return this.activitiesList.get(index).getText();
  };

  // Prints the entire activity list
  //noinspection JSUnusedGlobalSymbols
  this.printActivitiesNames = function printActivitiesNames() {
    (this.activitiesList).each(function (names) {
      names.getText().then(console.log);
    });
  };

}
