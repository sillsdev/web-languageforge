import { Page } from '@playwright/test';
import { PageHeader } from '../components/page-header.component';
import { BasePage } from './base-page';
import { UserDetails } from '../utils';

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

  async login(user: UserDetails): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
    await new PageHeader(this.page).userDropdownButton.waitFor();
  }
}
