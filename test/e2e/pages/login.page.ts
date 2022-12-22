import { Page } from '@playwright/test';
import { PageHeader } from './components';
import { UserDetails } from '../utils';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  readonly usernameInput = this.locator('#username');
  readonly passwordInput = this.locator('#password');
  readonly submitButton = this.locator('#login-submit');
  readonly forgotPasswordLink = this.locator('#forgot_password');
  readonly alertInfo = this.locator('.alert-info');
  readonly errors = this.locator('.alert-danger');

  constructor(page: Page) {
    super(page, '/auth/login', page.locator('#password'))
  }

  async login(user: UserDetails): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
    await new PageHeader(this.page).userDropdownButton.waitFor();
  }
}
