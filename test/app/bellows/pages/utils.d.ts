import {Locator} from 'protractor';
declare namespace protractor {
  interface By {
    elemMatches(selector: string, regexString: string): Locator;
  }
}
