import {Locator} from 'protractor';
declare namespace protractor {
  interface By {
    elemMatches(selector: string, regex: RegExp): Locator;
  }
}

declare namespace jasmine {
  interface Matchers {
    toContainMultilineMatch(text: string): boolean;
    toContainMatch(text: string): boolean;

  }
}
