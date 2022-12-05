import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage<LoginPage> {
  readonly usernameInput = this.page.locator('#username');
  readonly passwordInput = this.page.locator('#password');
  readonly submitButton = this.page.locator('#login-submit');
  readonly forgotPasswordLink = this.page.locator('#forgot_password');
  readonly alertInfo = this.page.locator('.alert-info');
  readonly errors = this.page.locator('.alert-danger');

  constructor(page: Page) {
    super(page, '/auth/login', page.locator('#password'))
  }

  async loginAs(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
