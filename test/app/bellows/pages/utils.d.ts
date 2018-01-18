import {Locator} from 'protractor';
declare namespace protractor {
  interface By {
    elemMatches(selector: string, regexString: string): Locator;
  }
}

declare namespace jasmine {
  interface Matchers {
    toContainMultilineMatch(text: string): boolean;
    toContainMatch(text: string): boolean;

  }
}
