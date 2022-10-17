# Chris's Protractor API cheatsheet

## [WebElement](http://selenium.googlecode.com/git/docs/api/javascript/class_webdriver_WebElement.html) (from WebDriver)

    .clear()

    .click()

    .findElement(locator)

    .findElements(locator)

    .getAttribute(name)

    .getCssValue(stylePropertyName)

    .getDriver()

    .getInnerHtml()

    .getLocation()

    .getOuterHtml()

    .getSize()

    .getTagName()

    .getText()

    .isDisplayed()

    .isElementPresent()

    .isEnabled()

    .isSelected()

    .sendKeys(stringOfKeys - multiple args OK)

    .submit() - if element is in a form

    .toWireValue() - to JSON

## [Locators](http://selenium.googlecode.com/git/docs/api/javascript/namespace_webdriver_By.html) (from WebDriver)

    by.hash({id:'1', className:'foo'})

    by.className(className)

    by.css(selector)

    by.id(id)

    by.js(script, args)

    by.linkText(text)

    by.name(name)

    by.partialLinkText(text)

    by.tagName(text)

    by.xpath(xpath)

## [Locators](https://github.com/angular/protractor/blob/master/docs/api.md#locators) (additions from Protractor)

    by.binding

    by.select

    by.selectedOption - DEPRECATED, use element(by.model('foo')).$('option:checked')

    by.input

    by.model

    by.buttonText

    by.partialButtonText

    by.repeater - can chain .row(index) or .column(partialBindingText);

## Protractor [ElementFinders](https://github.com/angular/protractor/blob/master/docs/api.md#protractor)

    element

    elementFinder.find

    elementFinder.isPresent

    elementFinder.element

    elementFinder.$

    element.all

    elementArrayFinder.count

    elementArrayFinder.get

    elementArrayFinder.first

    elementArrayFinder.last

    elementArrayFinder.each

    elementArrayFinder.map

## Protractor Browser

    browser.get(url)

    browser.pause()

    browser.debugger()
