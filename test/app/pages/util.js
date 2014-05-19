'use strict';

var findDropdownByValue = function(dropdownElement, value) {
	// Returns a promise that will resolve to the <option> with the given value (as returned by optionElement.getText())
	var result = protractor.promise.defer();
	var options = dropdownElement.$$('option');
	var check = function(elem) {
		elem.getText().then(function(text) {
			if (text === value) {
				result.fulfill(elem);
			}
		});
	};
	if ("map" in options) {
		options.map(check);
	} else {
		// Sometimes we get a promise that returns a basic list; deal with that here
		options.then(function(list) {
			for (var i=0; i<list.length; i++) {
				check(list[i]);
			}
		});
	};
	return result;
};
// Need to explicitly specify exported names: see http://openmymind.net/2012/2/3/Node-Require-and-Exports/
module.exports.findDropdownByValue = findDropdownByValue;

var clickDropdownByValue = function(dropdownElement, value) {
	// Select an element of the dropdown based on its value (its text)
	var option = findDropdownByValue(dropdownElement, value);
	option.then(function(elem) {
		elem.click();
	});
};
module.exports.clickDropdownByValue = clickDropdownByValue;
