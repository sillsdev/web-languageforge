'use strict';

var setCheckbox = function(checkboxElement, value) {
	// Ensure a checkbox element will be either checked (true) or unchecked (false), regardless of what its current value is
	checkboxElement.isSelected().then(function(checked) {
		if (checked != value) {
			checkboxElement.click();
		};
	});
};
module.exports.setCheckbox = setCheckbox;

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

// New locator to find elements that match a CSS selector, whose text (via elem.innerText in the browser) matches a regex
// Call as by.elemMatches('a', /my regular expression/)
// To get any element, call as by.elemMatches('*', /my regex/), but beware: parent elements "contain" the text of their children.
// So if your HTML is <div><span><a href="foo">xyzzy</a></span></div> and you call by.elemMatches('*', /xyzzy/),
// your locator will match three elements: the div, the span, and the a.
by.addLocator('elemMatches', function(selector, regexOrString, parentElem) {
	var searchScope = parentElem || document;
	var regex = RegExp(regexOrString);
	var allElems = searchScope.querySelectorAll(selector);
	return Array.prototype.filter.call(allElems, function(elem) {
		return regex.test(elem.innerText);
	});
});
// No need for a module.exports here, as we are adding this function to Protractor's "by" namespace

var findRowByFunc = function(repeater, searchFunc) {
	// Repeater can be either a string or an already-created by.repeater() object
	if ("string" === typeof repeater) {
		repeater = element.all(by.repeater(repeater));
	}
	var foundRow = undefined;
	var result = protractor.promise.defer();
	repeater.map(function(row) {
		row.getText().then(function(rowText) {
			if (searchFunc(rowText)) {
				foundRow = row;
			};
		});
	}).then(function() {
		if (foundRow) {
			result.fulfill(foundRow);
		} else {
			result.reject("Row not found.");
		}
	});
	return result;
};
var findRowByText = function(repeater, searchText, regExpFlags) {
	// regExpFlags is completely optional and can be left out.
	// searchText can be a string, in which case it is turned into a RegExp (with specified flags, if given),
	//      or it can be a RegExp
	// repeater is as in findRowByFunc
	if ("string" === typeof searchText) {
		searchText = new RegExp(searchText, regExpFlags);
	}
	return findRowByFunc(repeater, function(rowText) {
		return searchText.test(rowText);
	});
};
module.exports.findRowByFunc = findRowByFunc;
module.exports.findRowByText = findRowByText;

/*
 * This method is an alternative to sendKeys().  It attempts to write the textString to the value of the element instead of sending
 * one keystroke at a time
 * 
 * @param elem - ElementFinder
 * @param textString - string of text to set the value to
 */
var sendText = function(elem, textString) {
	browser.executeScript("arguments[0].value = arguments[1];", elem.find(), textString);
};
module.exports.sendText = sendText;