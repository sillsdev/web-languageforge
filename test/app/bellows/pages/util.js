'use strict';

/*
 * New locator to find elements that match a CSS selector, whose text (via elem.innerText in the
 *   browser) matches a regex
 * Call as by.elemMatches('a', /my regular expression/)
 * To get any element, call as by.elemMatches('*', /my regex/), but beware: parent elements
 *   "contain" the text of their children.
 * So if your HTML is <div><span><a href="foo">xyzzy</a></span></div> and you call
 *   by.elemMatches('*', /xyzzy/), your locator will match three elements: the div, the span,
 *   and the a.
 *
 * This function is added to Protractor's "by" namespace
 */
by.addLocator('elemMatches', function (selector, regexOrString, parentElem) {
  var searchScope = parentElem || document;
  var regex = new RegExp(regexOrString);
  var allElems = searchScope.querySelectorAll(selector);
  return Array.prototype.filter.call(allElems, function (elem) {
    return regex.test(elem.innerText);
  });
});

module.exports = new Utils();

function Utils() {
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  this.setCheckbox = function setCheckbox(checkboxElement, value) {
    // Ensure a checkbox element will be either checked (true) or unchecked (false), regardless of
    // what its current value is
    checkboxElement.isSelected().then(function (checked) {
      if (checked !== value) {
        checkboxElement.click();
      }
    });
  };

  this.findDropdownByValue = function findDropdownByValue(dropdownElement, value) {
    // Simpler (MUCH simpler) approach based on our custom elemMatches locator (defined below)
    return dropdownElement.element(by.elemMatches('option', value));
  };

  this.clickDropdownByValue = function clickDropdownByValue(dropdownElement, value) {
    // Select an element of the dropdown based on its value (its text)
    this.findDropdownByValue(dropdownElement, value).click();
  };

  this.findRowByFunc = function findRowByFunc(repeater, searchFunc) {
    // Repeater can be either a string or an already-created by.repeater() object
    if (typeof repeater === 'string') {
      repeater = element.all(by.repeater(repeater));
    }

    var foundRow = undefined;
    var result = protractor.promise.defer();
    repeater.map(function (row) {
      row.getText().then(function (rowText) {
        if (searchFunc(rowText)) {
          foundRow = row;
        }
      });
    }).then(function () {
      if (foundRow) {
        result.fulfill(foundRow);
      } else {
        result.reject('Row not found.');
      }
    });

    return result;
  };

  this.findRowByText = function findRowByText(repeater, searchText, regExpFlags) {
    // regExpFlags is completely optional and can be left out.
    // searchText can be a string, in which case it is turned into a RegExp (with specified flags,
    //   if given), or it can be a RegExp
    // repeater is as in findRowByFunc
    if (typeof searchText === 'string') {
      searchText = new RegExp(searchText, regExpFlags);
    }

    return this.findRowByFunc(repeater, function (rowText) {
      return searchText.test(rowText);
    });
  };

  /*
   * This method is an alternative to sendKeys().  It attempts to write the textString to the value
   * of the element instead of sending one keystroke at a time
   *
   * @param elem - ElementFinder
   * @param textString - string of text to set the value to
   */
  this.sendText = function sendText(elem, textString) {
    browser.executeScript('arguments[0].value = arguments[1];', elem.getWebElement(), textString);
  };

  //noinspection JSUnusedGlobalSymbols
  this.waitForAlert = function waitForAlert(timeout) {
    if (!timeout) { timeout = 8000; }

    browser.wait(function () {
      var alertPresent = true;
      try {
        browser.switchTo().alert();
      } catch (NoSuchAlertError) {
        alertPresent = false;
      }

      return alertPresent;
    }, timeout);
  };

  this.notice = {
    list: element.all(by.repeater('notice in $ctrl.notices()'))
  };
  this.notice.firstCloseButton = this.notice.list.first().element(by.partialButtonText('×'));
  this.notice.waitToInclude = function (includedText) {
    browser.wait(function () {
      return this.notice.list.count().then(function (count) {
        return count >= 1;
      });
    }.bind(this), CONDITION_TIMEOUT);
    browser.wait(function () {
      return this.notice.list.first().getText().then(function (text) {
        return text.includes(includedText);
      });
    }.bind(this), CONDITION_TIMEOUT);
  }.bind(this);

  this.checkModalTextMatches = function checkModalTextMatchesfunction(expectedText) {
    var modalBody = element(by.css('.modal-body'));

    browser.wait(expectedCondition.visibilityOf(modalBody), CONDITION_TIMEOUT);
    expect(modalBody.getText()).toMatch(expectedText);
  };

  this.clickModalButton = function clickModalButtonfunction(buttonText) {
    var button = element(by.css('.modal-footer')).element(by.partialButtonText(buttonText));

    browser.wait(expectedCondition.visibilityOf(button), CONDITION_TIMEOUT);
    browser.wait(expectedCondition.elementToBeClickable(button), CONDITION_TIMEOUT);
    button.click();
  };

  this.clickBreadcrumb = function clickBreadcrumb(breadcrumbText) {
    element(by.elemMatches('.breadcrumb > li', breadcrumbText)).click();
  };

  this.parent = function parent(child) {
    return child.element(by.xpath('..'));
  };

  // This handy function comes from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  this.escapeRegExp = function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  };

  /*
   * Jasmine custom matcher (https://jasmine.github.io/2.0/custom_matcher.html) to search a list
   * for a string that matches a given regex. E.g., you have ['an apple', 'a banana'] and you want
   * to know if the list contains a string that matches the regex /banana/.
   *
   * To use this matcher, call util.registerCustomJasmineMatchers() in your beforeEach() function.
   * Then you'll be able to write tests like `expect(item).toContainMatch(regex)`.
   * NOTE: If you want to be able to match across multiple lines with a `.*` component in your regex,
   * you'll need to use .toContainMultilineMatch() instead.
   */

  this.registerCustomJasmineMatchers = function registerCustomJasmineMatchers() {
    jasmine.addMatchers({
        toContainMultilineMatch: function toContainMultilineMatch(jasmineUtil, customTesters) {
          return {
            compare: function checkList(list, regex) {
              var checkItem = function (item) {
                // The dot in Javascript regexes CANNOT match newlines, so we deal with that here
                return regex.test(item.replace(/\n/g, ' '));
              };
              var index = list.findIndex(checkItem);

              var compareResult = {};
              compareResult.pass = index >= 0;
              if (compareResult.pass) {
                compareResult.message = 'Expected list not to contain a match for ' + regex.toString() + ' but it did.';
              } else {
                compareResult.message = 'Expected list to contain a match for ' + regex.toString() + ' but it did not.';
              }

              return compareResult;
            }
          };
        },

        toContainMatch: function toContainMatch(jasmineUtil, customTesters) {
          return {
            compare: function checkList(list, regex) {
              var checkItem = function (item) {
                return regex.test(item);
              };
              var index = list.findIndex(checkItem);

              var compareResult = {};
              compareResult.pass = index >= 0;
              if (compareResult.pass) {
                compareResult.message = 'Expected list not to contain a match for ' + regex.toString() + ' but it did.';
              } else {
                compareResult.message = 'Expected list to contain a match for ' + regex.toString() + ' but it did not.';
              }

              return compareResult;
            }
          }
        }
      });
  };

  // Errors we choose to ignore because they are typically not encountered by users, but only
  // in testing
  this.isMessageToIgnore = function isMessageToIgnore(message) {
    if (message.level.name === 'WARNING') return true;

    var text = message.message;

    return /angular.*\.js .* TypeError: undefined is not a function/.test(text) ||
      /angular.*\.js .* Error: \[\$compile:tpload]/.test(text) ||
      text.includes('password or credit card input in a non-secure context.') ||
      text.includes('ERR_INTERNET_DISCONNECTED');
  };

  this.scrollTop = function () {
    browser.executeScript('window.scroll(0,0)');
  };

}
