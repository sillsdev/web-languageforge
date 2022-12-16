import { expect, Page } from '@playwright/test';
import { BasePage, GotoOptions } from './base-page';

export interface SignupGotoOptions extends GotoOptions {
  email?: string;
}

export class SignupPage extends BasePage<SignupPage> {
  readonly emailInput = this.page.locator('#email');
  readonly emailInvalid = this.page.locator('#emailInvalid');
  readonly emailTaken = this.page.locator('#emailTaken');

  readonly nameInput = this.page.locator('#name');
  readonly passwordInput = this.page.locator('#password');
  readonly passwordIsWeak = this.page.locator('#passwordIsWeak');
  readonly showPassword = this.page.locator('[data-ng-model="$ctrl.showPassword"]');
  readonly captchaDiv = this.page.locator('#pui-captcha');
  readonly captchaInvalid = this.page.locator('#captchaInvalid');
  readonly signupButton = this.page.locator('#submit');

  readonly captcha = {
    expectedItemName: this.captchaDiv.locator('#expectedItemName'),
    blueSquareButton: this.captchaDiv.locator('#captcha0'),
    yellowCircleButton: this.captchaDiv.locator('#captcha1'),
    redTriangleButton: this.captchaDiv.locator('#captcha2'),

    setInvalidCaptcha: async () => {
      await this.captcha.blueSquareButton.click();
      if (await this.captcha.expectedItemName.innerText() === 'Blue Square') {
        await this.captcha.yellowCircleButton.click();
      }
    },

    setValidCaptcha: async () => {
      await expect(this.captcha.expectedItemName).not.toHaveText('');
      // Could also have done this: -RM
      // const itemNameHandle = (await this.captcha.expectedItemName.elementHandle()) as ElementHandle<HTMLElement>;
      // await this.page.waitForFunction(elem => elem.innerText, itemNameHandle);

      switch (await this.captcha.expectedItemName.innerText()) {
        case 'Blue Square':
          await this.captcha.blueSquareButton.click();
          break;
        case 'Yellow Circle':
          await this.captcha.yellowCircleButton.click();
          break;
        case 'Red Triangle':
          await this.captcha.redTriangleButton.click();
      }
    }
  };

  constructor(page: Page) {
    super(page, '/public/signup', page.locator('#email'));
  }

  async goto(options?: SignupGotoOptions): Promise<SignupPage> {
    if (options?.email) {
      await this.page.goto(this.url + '#!/?e=' + encodeURIComponent(options?.email));
      await Promise.all([
        this.page.reload(),
        this.waitForPage(),
      ]);
    } else {
      await super.goto();
    }
    return this;
  }

  async setInvalidCaptcha() {
    await this.captcha.blueSquareButton.click();
    if (await this.captcha.expectedItemName.innerText() === 'Blue Square') {
      this.captcha.yellowCircleButton.click();
    }
  }
}
