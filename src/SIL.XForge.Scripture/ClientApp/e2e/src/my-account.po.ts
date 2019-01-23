import { browser, by, element, ExpectedConditions } from 'protractor';

export class MyAccountPage {
  static readonly changePasswordButton = element(by.id('my-account-change-password-btn'));

  private static readonly baseUrl = 'http://localhost:5000';

  private readonly constants = require('../testConstants.json');

  async get() {
    await browser.get(MyAccountPage.baseUrl + '/my-account');
    await browser.wait(
      ExpectedConditions.elementToBeClickable(MyAccountPage.changePasswordButton),
      this.constants.conditionTimeout
    );
  }
}
