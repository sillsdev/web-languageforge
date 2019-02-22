import { browser, by, element, ExpectedConditions } from 'protractor';

export class ChangePasswordPage {
  private static readonly baseUrl = 'http://localhost:5000';

  changePasswordButton = element(by.id('btnChangePassword'));
  newPasswordInput = element(by.id('newPassword'));
  confirmPasswordInput = element(by.id('confirmPassword'));
  warnPasswordNotMatch = element(by.id('passwordNotMatch'));

  private readonly constants = require('../testConstants.json');

  async get() {
    await browser.get(ChangePasswordPage.baseUrl + '/change-password');
    await browser.wait(
      ExpectedConditions.elementToBeClickable(this.changePasswordButton),
      this.constants.conditionTimeout
    );
  }
}
