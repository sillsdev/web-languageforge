import { expect, Locator, Page } from '@playwright/test';

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
    this.showPassword = page.locator('data-ng-model="$ctrl.showPassword"');

    this.captchaDiv = page.locator('#pui-captcha');
    this.captcha = {
      expectedItemName: this.captchaDiv.locator('#expectedItemName'),
      blueSquareButton: this.captchaDiv.locator('#captcha0'),
      yellowCircleButton: this.captchaDiv.locator('#captcha1'),
      redTriangleButton: this.captchaDiv.locator('#captcha2'),

      setInvalidCaptcha: async () => {
        await this.captcha.blueSquareButton.click();
        if (await this.captcha.expectedItemName.innerText() === 'Blue Square') {
          this.captcha.yellowCircleButton.click();
        }
      },

      setValidCaptcha: async () => {
        switch (await this.captcha.expectedItemName.innerText()) {
          case 'Blue Square':
            this.captcha.blueSquareButton.click();
          case 'Yellow Circle':
            this.captcha.yellowCircleButton.click();
          case 'Red Triangle':
            this.captcha.redTriangleButton.click();
        }
      }
    };
    this.captchaInvalid = page.locator('#captchaInvalid');

    this.signupButton = page.locator('#submit');
  }

  async goto(email: string = '') {
    let appendEmailtoURL: string = '';
    if (email != '') {
      appendEmailtoURL = '#!/?e=' + encodeURIComponent(email);
    }
    await this.page.goto(SignupPage.url + appendEmailtoURL);
    await expect(this.emailInput).toBeVisible();
  }

  async setInvalidCaptcha() {
    await this.captcha.blueSquareButton.click();
    if (await this.captcha.expectedItemName.innerText() === 'Blue Square') {
      this.captcha.yellowCircleButton.click();
    }
  }
}
