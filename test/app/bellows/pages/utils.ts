// tslint:disable-next-line:no-reference
///<reference path="utils.d.ts" />
import 'jasmine';
import {$, $$, browser, by, By, element, ExpectedConditions, promise} from 'protractor';
import { ElementArrayFinder, ElementFinder } from 'protractor/built/element';
import { logging } from 'selenium-webdriver';

/*
 * New locator to find elements that match a CSS selector, whose text (via elem.innerText in the
 *   browser) matches a regex
 * Call as by.elemMatches('a', 'my regular expression')
 * To get any element, call as by.elemMatches('*', 'my regex'), but beware: parent elements
 *   "contain" the text of their children.
 * So if your HTML is <div><span><a href="foo">xyzzy</a></span></div> and you call
 *   by.elemMatches('*', 'xyzzy'), your locator will match three elements: the div, the span,
 *   and the a.
 *
 * This function is added to Protractor's "by" namespace
By.addLocator('elemMatches', (cssSelector: string, regexString: string) => {
  const allElems = document.querySelectorAll(selector);
  return Array.prototype.filter.call(allElems, (elem: Element) => {
    const regex = new RegExp(regexString);
    return regex.test(elem.textContent);
  });
});
 */

export class Utils {
  readonly conditionTimeout: number = 3000;

  setCheckbox(checkboxElement: ElementFinder, value: boolean) {
    // Ensure a checkbox element will be either checked (true) or unchecked (false), regardless of
    // what its current value is
    checkboxElement.isSelected().then((checked: boolean) => {
      if (checked !== value) {
        checkboxElement.click();
      }
    });
  }

  findDropdownByValue(dropdownElement: ElementFinder, value: string|RegExp) {
    // Simpler (MUCH simpler) approach based on our custom elemMatches locator (defined below)
    return dropdownElement.element(By.cssContainingText('option', value));
  }

  clickDropdownByValue(dropdownElement: ElementFinder, value: string|RegExp) {
    // Select an element of the dropdown based on its value (its text)
    this.findDropdownByValue(dropdownElement, value).click();
  }

  findRowByFunc(elementArray: ElementArrayFinder, searchFunc: (rowText: string) => boolean): Promise<ElementFinder> {
    // Repeater can be either a string or an already-created by.repeater() object
    let foundRow: ElementFinder;
    return new Promise<ElementFinder>((resolve, reject) => {
      elementArray.map((row: ElementFinder) => {
        row.getText().then((rowText: string) => {
          if (searchFunc(rowText)) {
            foundRow = row;
          }
        });
      }).then(() => {
        if (foundRow) {
          resolve(foundRow);
        } else {
          reject('Row not found');
        }
      });
    });
  }

  findRowByText(elementArray: ElementArrayFinder, searchString: string): Promise<ElementFinder> {
    return this.findRowByFunc(elementArray, (rowText: string) => {
      return rowText.includes(searchString);
    }
  );
  }

  /*
   * This method is an alternative to sendKeys().  It attempts to write the textString to the value
   * of the element instead of sending one keystroke at a time
   *
   * @param elem - ElementFinder
   * @param textString - string of text to set the value to
   */
  sendText(elem: ElementFinder, textString: string) {
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

  private noticeList = element.all(by.repeater('notice in $ctrl.notices()'));

  notice: any = {
    list: this.noticeList,
    firstCloseButton: this.noticeList.first().element(by.partialButtonText('×')),
    waitToInclude: (includedText: any): void => {
      browser.wait(() =>
        this.noticeList.count().then((count: any) =>
          count >= 1),
          this.conditionTimeout);
      browser.wait(() =>
        this.noticeList.first().getText().then((text: any) => text.includes(includedText)),
        this.conditionTimeout);
    }
  };

  checkModalTextMatches(expectedText: string) {
    const modalBody = element(by.css('.modal-body'));

    browser.wait(ExpectedConditions.visibilityOf(modalBody), this.conditionTimeout);
    expect(modalBody.getText()).toMatch(expectedText);
  }

  clickModalButton(buttonText: string) {
    const button = element(by.css('.modal-footer')).element(by.partialButtonText(buttonText));

    browser.wait(ExpectedConditions.visibilityOf(button), this.conditionTimeout);
    browser.wait(ExpectedConditions.elementToBeClickable(button), this.conditionTimeout);
    button.click();
  }

  clickBreadcrumb(breadcrumbTextOrRegex: string|RegExp) {
    element(by.cssContainingText('.breadcrumb > li', breadcrumbTextOrRegex)).click();
  }

  parent(child: ElementFinder) {
    return child.element(by.xpath('..'));
  }

  // This handy function comes from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  escapeRegExp(stringToEscape: string) {
    return stringToEscape.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  // Errors we choose to ignore because they are typically not encountered by users, but only
  // in testing
  isMessageToIgnore(message: logging.Entry ) {
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
