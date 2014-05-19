'use strict';

var SfActivityPage = function() {
	var page = this; // For use inside our methods. Necessary when passing anonymous functions around, which lose access to "this".

	this.activityURL = '/app/activity';
	this.activitiesList = element.all(by.repeater('item in filteredActivities'));

	this.get = function() {
		browser.get(browser.baseUrl + this.activityURL);
		
	};
		
	this.getLength = function() {
		return page.activitiesList.count();
	}

	this.getActivity = function(index) {
		console.log('Inside getActivity for index', index);
		this.getLength().then(function(len) {
			if ((index >= 0) && (index < len)) {
				console.log('1 >= 0 and length is '+ len);
				return (page.activitiesList).get(index).getText();//.then(console.log);
			} else {
				console.log('Error: activity list does not have index ' + index);
			}
		return;

		});
	}
	
	
	// Prints the entire activity list
	this.printActivitiesNames = function() {
		var i=0;
		(page.activitiesList).each(function(names) {
			if (i < 5) {
				names.getText().then(console.log);
			}
			i++;
		});
	};
	
	
};

module.exports = new SfActivityPage();