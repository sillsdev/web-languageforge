import { browser, by, element, ExpectedConditions } from 'protractor';

export class MyAccountPage {
  private static readonly baseUrl = 'http://localhost:5000';
  static accountpage = {
    accountChangePasswordButton: element(by.id('home-change-password-btn')),
    myAccountHeader: element(by.css('div h2'))
  };
  private readonly constants = require('../testConstants.json');

  async get() {
    await browser.get(MyAccountPage.baseUrl + '/my-account');
    await browser.wait(
      ExpectedConditions.elementToBeClickable(MyAccountPage.accountpage.accountChangePasswordButton),
      this.constants.conditionTimeout
    );
  }
}
