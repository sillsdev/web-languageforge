import { expect, Locator, Page } from '@playwright/test';

type Captcha = {
  expectedItemName: Locator;
  blueSquareButton: Locator;
  yellowCircleButton: Locator;
  redTriangleButton: Locator;
};

export class SignupPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly nameInput: Locator;
  readonly passwordInput: Locator;
  readonly captchaDiv: Locator;
  readonly captcha: Captcha;
  static readonly url: string = '/public/signup';

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.nameInput = page.locator('#name');
    this.passwordInput = page.locator('#password');

    this.captchaDiv = page.locator('#pui-captcha');
    this.captcha = {
      expectedItemName: this.captchaDiv.locator('#expectedItemName'),
      blueSquareButton: this.captchaDiv.locator('#captcha0'),
      yellowCircleButton: this.captchaDiv.locator('#captcha1'),
      redTriangleButton: this.captchaDiv.locator('#captcha2'),
    }
  }

  async goto() {
    await this.page.goto(SignupPage.url);
    await expect(this.emailInput).toBeVisible();
  }
}
