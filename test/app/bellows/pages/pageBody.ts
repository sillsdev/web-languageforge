import {$, $$, browser, by, By, element, ExpectedConditions} from 'protractor';

export class PageBody {
  phpError = element(by.xpath("//*[contains(.,'A PHP Error was encountered')]"));
}


module.exports = new PageBody();
