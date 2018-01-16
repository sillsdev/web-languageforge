import {} from 'jasmine';
import {browser, element, by, By, $, $$, ExpectedConditions, promise} from 'protractor';

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
by.addLocator('elemMatches', (selector: any, regexOrString: any, parentElem: any) => {
  var searchScope = parentElem || document;
  var regex = new RegExp(regexOrString);
  var allElems = searchScope.querySelectorAll(selector);
  return Array.prototype.filter.call(allElems, function (elem: any) {
    return regex.test(elem.innerText);
  });
});

export class Utils {
  private readonly CONDITION_TIMEOUT = 3000;

  setCheckbox(checkboxElement: any, value: any) {
    // Ensure a checkbox element will be either checked (true) or unchecked (false), regardless of
    // what its current value is
    checkboxElement.isSelected().then(function (checked: any) {
      if (checked !== value) {
        checkboxElement.click();
      }
    });
  }

  findDropdownByValue(dropdownElement: any, value: any) {
    // Simpler (MUCH simpler) approach based on our custom elemMatches locator (defined below)
    return dropdownElement.element(by.elemMatches('option', value));
  }

  clickDropdownByValue(dropdownElement: any, value: any) {
    // Select an element of the dropdown based on its value (its text)
    this.findDropdownByValue(dropdownElement, value).click();
  }

  async findRowByFunc(repeater: any, searchFunc: any) {
    // Repeater can be either a string or an already-created by.repeater() object
    if (typeof repeater === 'string') {
      repeater = element.all(by.repeater(repeater));
    }

    let foundRow: any = undefined;
    await repeater.map(function (row: any) {
      row.getText().then(function (rowText: any) {
        if (searchFunc(rowText)) {
          foundRow = row;
        }
      });
    });
    return foundRow;
  }

  findRowByText(repeater: any, searchText: any, regExpFlags: any) {
    // regExpFlags is completely optional and can be left out.
    // searchText can be a string, in which case it is turned into a RegExp (with specified flags,
    //   if given), or it can be a RegExp
    // repeater is as in findRowByFunc
    if (typeof searchText === 'string') {
      searchText = new RegExp(searchText, regExpFlags);
    }

    return this.findRowByFunc(repeater, (rowText: any) => searchText.test(rowText));
  }

  /*
   * This method is an alternative to sendKeys().  It attempts to write the textString to the value
   * of the element instead of sending one keystroke at a time
   *
   * @param elem - ElementFinder
   * @param textString - string of text to set the value to
   */
  sendText(elem: any, textString: string) {
    browser.executeScript('arguments[0].value = arguments[1];', elem.getWebElement(), textString);
  }

  //noinspection JSUnusedGlobalSymbols
  waitForAlert(timeout: number) {
    if (!timeout) { timeout = 8000; }

    browser.wait(() => {
      let alertPresent = true;
      try {
        browser.switchTo().alert();
      } catch (NoSuchAlertError) {
        alertPresent = false;
      }

      return alertPresent;
    }, timeout);
  }

  notice: any = {
    list: element.all(by.repeater('notice in $ctrl.notices()')),
    firstCloseButton: this.notice.list.first().element(by.partialButtonText('×')),
    waitToInclude: (includedText: any): void => {
      browser.wait(() =>
        this.notice.list.count().then((count: any) =>
          count >= 1),
          this.CONDITION_TIMEOUT);
      browser.wait(() =>
        this.notice.list.first().getText().then((text: any) => text.includes(includedText)),
        this.CONDITION_TIMEOUT);
    }
  }

  checkModalTextMatches(expectedText: any) {
    const modalBody = element(by.css('.modal-body'));

    browser.wait(ExpectedConditions.visibilityOf(modalBody), this.CONDITION_TIMEOUT);
    expect(modalBody.getText()).toMatch(expectedText);
  };

  clickModalButton(buttonText: string) {
    const button = element(by.css('.modal-footer')).element(by.partialButtonText(buttonText));

    browser.wait(ExpectedConditions.visibilityOf(button), this.CONDITION_TIMEOUT);
    browser.wait(ExpectedConditions.elementToBeClickable(button), this.CONDITION_TIMEOUT);
    button.click();
  }

  clickBreadcrumb(breadcrumbText: string) {
    element(by.elemMatches('.breadcrumb > li', breadcrumbText)).click();
  }

  parent(child: any) {
    return child.element(by.xpath('..'));
  }

  // This handy function comes from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

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
  isMessageToIgnore(message: any) {
    if (message.level.name === 'WARNING') return true;

    const text = message.message;

    return /angular.*\.js .* TypeError: undefined is not a function/.test(text) ||
      /\[\$compile:tpload] .* HTTP status: -1/.test(text) ||
      text.includes('password or credit card input in a non-secure context.') ||
      text.includes('ERR_INTERNET_DISCONNECTED');
  }

  scrollTop() {
    browser.executeScript('window.scroll(0,0)');
  }

}
