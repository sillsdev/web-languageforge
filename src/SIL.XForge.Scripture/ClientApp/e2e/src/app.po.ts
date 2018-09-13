import { browser, by, element } from 'protractor';

export class AppPage {
  static navigateTo() {
    return browser.get('https://beta.scriptureforge.local/');
  }

  static getMainHeading() {
    return element(by.css('app-root h1')).getText();
  }
}
