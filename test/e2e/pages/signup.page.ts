import { ElementHandle, expect, Locator, Page } from '@playwright/test';

type Captcha = {
  expectedItemName: Locator;
  blueSquareButton: Locator;
  yellowCircleButton: Locator;
  redTriangleButton: Locator;
  setInvalidCaptcha: Function;
  setValidCaptcha: Function;
};

export class SignupPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly emailInvalid: Locator;
  readonly emailTaken: Locator;

  readonly nameInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordIsWeak: Locator;
  readonly showPassword: Locator;
  readonly captchaDiv: Locator;
  readonly captcha: Captcha;
  readonly captchaInvalid: Locator;
  readonly signupButton: Locator;
  static readonly url: string = '/public/signup';

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.emailInvalid = page.locator('#emailInvalid');
    this.emailTaken = page.locator('#emailTaken');

    this.nameInput = page.locator('#name');
    this.passwordInput = page.locator('#password');
    this.passwordIsWeak = page.locator('#passwordIsWeak');
    this.showPassword = page.locator('[data-ng-model="$ctrl.showPassword"]');

    this.captchaDiv = page.locator('#pui-captcha');
    this.captcha = {
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
    this.captchaInvalid = page.locator('#captchaInvalid');
    this.signupButton = page.locator('#submit');
  }

  async goto(email: string = '') {
    if (email === '') {
      await this.page.goto(SignupPage.url);
    }
    else {
      await this.page.goto(SignupPage.url + '#!/?e=' + encodeURIComponent(email));
      await this.page.reload();
    }
    await expect(this.emailInput).toBeVisible();
  }

  async setInvalidCaptcha() {
    await this.captcha.blueSquareButton.click();
    if (await this.captcha.expectedItemName.innerText() === 'Blue Square') {
      this.captcha.yellowCircleButton.click();
    }
  }
}
