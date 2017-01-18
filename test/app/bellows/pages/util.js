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
      if (checked != value) {
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
    list: element.all(by.repeater('notice in notices()'))
  };
  this.notice.firstCloseButton = this.notice.list.first().element(by.buttonText('×'));
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

  // Errors we choose to ignore because they are typically not encountered by users, but only
  // in testing
  this.isErrorToIgnore = function isErrorToIgnore(message) {
    return /angular.*\.js .* TypeError: undefined is not a function/.test(message) ||
      /angular.*\.js .* Error: \[\$compile:tpload]/.test(message) ||
      /"level":"info"/.test(message) ||
      /next_id/.test(message) ||
      /ERR_INTERNET_DISCONNECTED/.test(message);
  };

}
