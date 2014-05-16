Chris's Protractor API cheatsheet
=================================
---------------------------------

WebElement (from WebDriver)
===========================
http://selenium.googlecode.com/git/docs/api/javascript/class_webdriver_WebElement.html

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

.isDisplay()

.isElementPresent()

.isEnabled()

.isSelected()

.sendKeys(stringOfKeys - multiple args OK)

.submit() - if element is in a form

.toWireValue() - to JSON


Locators (from WebDriver)
=========================
http://selenium.googlecode.com/git/docs/api/javascript/namespace_webdriver_By.html

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


Locators (additions from Protractor)
====================================
https://github.com/angular/protractor/blob/master/docs/api.md#locators

by.binding

by.select

by.selectedOption

by.input

by.model

by.buttonText

by.partialButtonText

by.repeater

Protractor ElementFinders
=========================
https://github.com/angular/protractor/blob/master/docs/api.md#protractor

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

browser.get(url)

browser.pause()

browser.debugger()
