import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  static readonly url: string = '/auth/login';

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#login-submit')
  }

  async goto() {
    await this.page.goto(LoginPage.url);
    await expect(this.passwordInput).toBeVisible();
  }

  async loginAs(username: string, password: string) {
    // navigate to login page if not already there
    if (! this.page.url().endsWith(LoginPage.url)) {
      await this.page.goto(LoginPage.url);
    }
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
