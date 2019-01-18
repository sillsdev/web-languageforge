import { browser, by, element, promise } from 'protractor';

export class AppPage {
  static homepage = {
    homepageHeader: element(by.css('app-home h1')),
    avatar: element(by.id('avatarId')),
    myAccount: element(by.name('myAccount')),
    logoutButton: element(by.name('logout'))
  };

  static navigateTo(): promise.Promise<any> {
    return browser.get('http://localhost:5000/');
  }

  static getMainHeading(): promise.Promise<string> {
    return this.homepage.homepageHeader.getText();
  }
}
