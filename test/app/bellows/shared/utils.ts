// tslint:disable-next-line:no-reference
///<reference path="utils.d.ts" />
import {browser, by, By, element, ExpectedConditions} from 'protractor';
import {ElementArrayFinder, ElementFinder} from 'protractor/built/element';
import {logging, WebElementPromise} from 'selenium-webdriver';

export class Utils {
  static readonly conditionTimeout: number = 13000;

  async setCheckbox(checkboxElement: ElementFinder, value: boolean) {
    // Ensure a checkbox element will be either checked (true) or unchecked (false), regardless of
    // what its current value is
    await checkboxElement.isSelected().then(async (checked: boolean) => {
      if (await checked !== value) {
        await checkboxElement.click();
      }
    });
  }

  static findDropdownByValue(dropdownElement: ElementFinder, value: string|RegExp) {
    // Simpler (MUCH simpler) approach based on our custom elemMatches locator (defined below)
    return dropdownElement.element(By.cssContainingText('option', value));
  }

  static async clickDropdownByValue(dropdownElement: ElementFinder, value: string|RegExp) {
    // Select an element of the dropdown based on its value (its text)
    await Utils.findDropdownByValue(dropdownElement, value).click();
  }

  async findRowByFunc(elementArray: ElementArrayFinder, searchFunc: (rowText: string) => boolean):
   Promise<ElementFinder> {
    // Repeater can be either a string or an already-created by.repeater() object
    let foundRow: ElementFinder;
    return new Promise<ElementFinder>(async (resolve, reject) => {
      await elementArray.map(async (row: ElementFinder) => {
        await row.getText().then((rowText: string) => {
          if (searchFunc(rowText)) {
            foundRow = row;
          }
        }, () => {}); // added block to avoiding warnings of "project not found"
      }).then(() => {
        if (foundRow) {
          resolve(foundRow);
        } else {
          reject('Row not found');
        }
      }, () => {}); // added block to avoiding warnings of "project not found"
    });
  }

  async findRowByText(elementArray: ElementArrayFinder, searchString: string): Promise<ElementFinder> {
    return await this.findRowByFunc(elementArray, (rowText: string) => {
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
    browser.executeScript('arguments[0].value = arguments[1];', elem.getWebElement(), textString);
  }

  //noinspection JSUnusedGlobalSymbols
  waitForAlert(timeout: number) {
    if (!timeout) { timeout = 9000; }

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
    await expect(modalBody.getText()).toMatch(expectedText);

  }

  static async clickModalButton(buttonText: string) {
    const button = await element(by.css('.modal-footer')).element(by.partialButtonText(buttonText));

    await browser.wait(ExpectedConditions.visibilityOf(button), Utils.conditionTimeout);
    await browser.wait(ExpectedConditions.elementToBeClickable(button), Utils.conditionTimeout);
    await button.click();
  }

  static async clickBreadcrumb(breadcrumbTextOrRegex: string|RegExp) {
    /* await browser.wait(ExpectedConditions.visibilityOf
      (element(by.cssContainingText('.breadcrumb > li', breadcrumbTextOrRegex))),
      Utils.conditionTimeout); */
    await element(by.cssContainingText('.breadcrumb > li', breadcrumbTextOrRegex)).click();
  }

  static async parent(child: ElementFinder) {
    return await child.element(by.xpath('..'));
  }

  // This handy function comes from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  static escapeRegExp(stringToEscape: string) {
    return stringToEscape.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  // Errors we choose to ignore because they are typically not encountered by users, but only
  // in testing
  static async isMessageToIgnore(message: logging.Entry ) {
    if (message.level.name === 'WARNING') return true;

    const text = message.message;

    return await /angular.*\.js .* TypeError: undefined is not a function/.test(text) ||
      /\[\$compile:tpload] .* HTTP status: -1/.test(text) ||
      text.includes('password or credit card input in a non-secure context.') ||
      text.includes('ERR_INTERNET_DISCONNECTED');
  }

  static async scrollTop() {
    await browser.driver.executeScript('window.scroll(0,0)');
  }

  static async isAllCheckboxes(elementArray: ElementArrayFinder, state: boolean = true) {
    const all: boolean[] = [];
    return await elementArray.map(async (checkboxElement: ElementFinder) => {
      // browser.sleep needs to avoid errors and warnings.
      await browser.sleep(1300);
      await checkboxElement.isSelected().then(async (isSelected: boolean) => {
        await all.push(isSelected);
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

}
