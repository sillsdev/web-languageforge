import { expect, Page } from '@playwright/test';
import { BasePage, GotoOptions } from './base-page';

export interface SignupGotoOptions extends GotoOptions {
  email?: string;
}

export class SignupPage extends BasePage {
  readonly emailInput = this.locator('#email');
  readonly emailInvalid = this.locator('#emailInvalid');
  readonly emailTaken = this.locator('#emailTaken');

  readonly nameInput = this.locator('#name');
  readonly passwordInput = this.locator('#password');
  readonly passwordIsWeak = this.locator('#passwordIsWeak');
  readonly showPassword = this.locator('[data-ng-model="$ctrl.showPassword"]');
  readonly captchaDiv = this.locator('#pui-captcha');
  readonly captchaInvalid = this.locator('#captchaInvalid');
  readonly signupButton = this.locator('#submit');

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

  async goto(options?: SignupGotoOptions): Promise<this> {
    if (options?.email) {
      await this.page.goto(this.url + '#!/?e=' + encodeURIComponent(options?.email));
      await Promise.all([
        this.page.reload(),
        this.waitFor(),
      ]);
    } else {
      await super.goto(options);
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
