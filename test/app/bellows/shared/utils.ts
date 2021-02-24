// tslint:disable-next-line:no-reference
///<reference path="utils.d.ts" />
import {browser, by, By, element, ExpectedConditions} from 'protractor';
import {ElementArrayFinder, ElementFinder} from 'protractor/built/element';
import {logging, WebElementPromise} from 'selenium-webdriver';

export class Utils {
  static readonly conditionTimeout: number = 3000;

  setCheckbox(checkboxElement: ElementFinder, value: boolean) {
    // Ensure a checkbox element will be either checked (true) or unchecked (false), regardless of
    // what its current value is
    return checkboxElement.isSelected().then((checked: boolean) => {
      if (checked !== value) {
        checkboxElement.click();
      }
    });
  }

  static findDropdownByValue(dropdownElement: ElementFinder, value: string|RegExp) {
    // Simpler (MUCH simpler) approach based on our custom elemMatches locator (defined below)
    return dropdownElement.element(By.cssContainingText('option', value));
  }

  static clickDropdownByValue(dropdownElement: ElementFinder, value: string|RegExp) {
    // Select an element of the dropdown based on its value (its text)
    return Utils.findDropdownByValue(dropdownElement, value).click();
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
  static sendText(elem: ElementFinder, textString: string) {
    return browser.executeScript('arguments[0].value = arguments[1];', elem.getWebElement(), textString);
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
        Utils.conditionTimeout);
      browser.wait(() =>
        this.noticeList.first().getText().then((text: any) => text.includes(includedText)),
        Utils.conditionTimeout);
    }
  };

  static async checkModalTextMatches(expectedText: string) {
    const modalBody = element(by.css('.modal-body'));

    await browser.wait(ExpectedConditions.visibilityOf(modalBody), Utils.conditionTimeout);
    return expect(modalBody.getText()).toMatch(expectedText);
  }

  static async clickModalButton(buttonText: string) {
    const button = element(by.css('.modal-footer')).element(by.partialButtonText(buttonText));

    await browser.wait(ExpectedConditions.visibilityOf(button), Utils.conditionTimeout);
    await browser.wait(ExpectedConditions.elementToBeClickable(button), Utils.conditionTimeout);
    return button.click();
  }

  static clickBreadcrumb(breadcrumbTextOrRegex: string|RegExp) {
    return element(by.cssContainingText('.breadcrumb > li', breadcrumbTextOrRegex)).click();
  }

  static parent(child: ElementFinder) {
    return child.element(by.xpath('..'));
  }

  // This handy function comes from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  static escapeRegExp(stringToEscape: string) {
    return stringToEscape.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  // Errors we choose to ignore because they are typically not encountered by users, but only
  // in testing
  static isMessageToIgnore(message: logging.Entry ) {
    if (message.level.name === 'WARNING') return true;

    const text = message.message;

    return /angular.*\.js .* TypeError: undefined is not a function/.test(text) ||
      /\[\$compile:tpload] .* HTTP status: -1/.test(text) ||
      text.includes('password or credit card input in a non-secure context.') ||
      text.includes('ERR_INTERNET_DISCONNECTED');
  }

  static scrollTop() {
    return browser.executeScript('window.scroll(0,0)');
  }

  static isAllCheckboxes(elementArray: ElementArrayFinder, state: boolean = true) {
    const all: boolean[] = [];
    return elementArray.map((checkboxElement: ElementFinder) => {
      checkboxElement.isSelected().then((isSelected: boolean) => {
        all.push(isSelected);
      });
    }).then(() => all.every((elem: boolean) => elem === state));
  }

  /**
   * Usage:     browser.executeScript(Utils.simulateDragDrop, source.getWebElement(), destination.getWebElement());
   * Adapted from https://gist.github.com/druska/624501b7209a74040175
   * @param {WebElementPromise} sourceNode
   * @param {WebElementPromise} destinationNode
   */
  static simulateDragDrop = (sourceNode: WebElementPromise, destinationNode: WebElementPromise) => {
    const EVENT_TYPES = {
      DRAG_END: 'dragend',
      DRAG_START: 'dragstart',
      DROP: 'drop'
    };

    function createCustomEvent(type: string): any {
      const customEvent: any = new CustomEvent('CustomEvent');
      customEvent.initCustomEvent(type, true, true, null);
      customEvent.dataTransfer = {
        data: {
        },
        setData(dataType: string, val: any) {
          this.data[dataType] = val;
        },
        getData(dataType: string) {
          return this.data[dataType];
        }
      };
      return customEvent;
    }

    function dispatchEvent(node: any, type: string, customEvent: CustomEvent) {
      if (node.dispatchEvent) {
        return node.dispatchEvent(customEvent);
      }
      if (node.fireEvent) {
        return node.fireEvent('on' + type, customEvent);
      }
    }

    const event = createCustomEvent(EVENT_TYPES.DRAG_START);
    dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event);

    const dropEvent = createCustomEvent(EVENT_TYPES.DROP);
    dropEvent.dataTransfer = event.dataTransfer;
    dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent);

    const dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END);
    dragEndEvent.dataTransfer = event.dataTransfer;
    dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent);
  }

  static waitForNewAngularPage(pageToLoad: string): any {
    // Switching between SPAs often creates a "document unloaded while waiting for result" error
    // After extensive research, a forced sleep is the best solution availible as of June 2019
    return browser.driver.wait( () => {
      return browser.driver.getCurrentUrl().then( url => {
        return url.indexOf(pageToLoad) > -1;
      });
    }, Utils.conditionTimeout).then( () => {
      return browser.sleep(2000);
    });
  }

}
