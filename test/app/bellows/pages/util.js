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

var old_findDropdownByValue = function(dropdownElement, value) {
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
  if ("filter" in options) {
    options.filter(function(elem) {
      return elem.getText().then(function(text) {
        return text === value;
      });
    }).then(function(list) {
      if (list.length > 0) {
        result.fulfill(list[0]);
      } else {
        result.reject('Value \"' + value.toString() + '" not found in dropdown');
      }
    });
  } else if ("map" in options) {
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
var findDropdownByValue = function(dropdownElement, value) {
  // Simpler (MUCH simpler) approach based on our custom elemMatches locator (defined below)
  return dropdownElement.element(by.elemMatches('option', value));
};
// Need to explicitly specify exported names: see http://openmymind.net/2012/2/3/Node-Require-and-Exports/
module.exports.findDropdownByValue = findDropdownByValue;
module.exports.old_findDropdownByValue = old_findDropdownByValue;

var old_clickDropdownByValue = function(dropdownElement, value) {
  // Select an element of the dropdown based on its value (its text)
  var option = old_findDropdownByValue(dropdownElement, value);
  option.then(function(elem) {
    elem.click();
  });
};
var clickDropdownByValue = function(dropdownElement, value) {
  // Select an element of the dropdown based on its value (its text)
  var option = findDropdownByValue(dropdownElement, value);
  option.then(function(elem) {
    elem.click();
  });
};
module.exports.clickDropdownByValue = clickDropdownByValue;
module.exports.old_clickDropdownByValue = old_clickDropdownByValue;

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
  browser.executeScript("arguments[0].value = arguments[1];", elem.getWebElement(), textString);
};
module.exports.sendText = sendText;

var waitForAlert = function(timeout) {
  if (!timeout) { timeout = 8000; }
  browser.wait(function() {
    var alertPresent = true;
    try {
      browser.switchTo().alert();
    } catch (NoSuchAlertError) {
      alertPresent = false;
    }
    return alertPresent;
  }, timeout);
};
module.exports.waitForAlert = waitForAlert;

var checkModalTextMatches = function(expectedText) {
  var modalBody = $('.modal-body');
  expect(modalBody.getText()).toMatch(expectedText);
};
module.exports.checkModalTextMatches = checkModalTextMatches;
var clickModalButton = function(btnText) {
  var modalFooter = $('.modal-footer');
  var btn = modalFooter.element(by.partialButtonText(btnText));
  
  // Some tests weren't passing without the waitForAngular, presummably because the animation is still moving the dialog into place.
  browser.waitForAngular();
  btn.click();
};
module.exports.clickModalButton = clickModalButton;

var clickBreadcrumb = function clickBreadcrumb(breadcrumbText) {
  element(by.elemMatches("ul.topCrumbs > li", breadcrumbText)).click();
};
module.exports.clickBreadcrumb = clickBreadcrumb;
