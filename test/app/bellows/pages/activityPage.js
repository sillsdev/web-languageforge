'use strict';

/*
// This object handles the activity page and provides methods to access items in the activity list
 */
var SfActivityPage = function() {
  var _this = this; // For use inside our methods. Necessary when passing anonymous functions around, which lose access to "this".

  this.activityURL = '/app/activity';
  this.activitiesList = element.all(by.repeater('item in filteredActivities'));

  // Navigate to the Activity _this
  this.get = function() {
    browser.get(browser.baseUrl + this.activityURL);
  };

  this.clickOnAllActivity = function() {
    element(by.partialButtonText('All Activity')).click();
  };

  this.clickOnShowOnlyMyActivity = function() {
    element(by.partialButtonText('Show Only My Activity')).click();
  };

  // Returns the number of items in the activity list
  this.getLength = function() {
    return _this.activitiesList.count();
  };

  // Returns the text in the activity list for a specified index
  this.getActivityText = function(index) {
    return _this.activitiesList.get(index).getText();
  };

  // Prints the entire activity list
  this.printActivitiesNames = function() {
    (_this.activitiesList).each(function(names) {
      names.getText().then(console.log);
    });
  };

};

module.exports = new SfActivityPage();
