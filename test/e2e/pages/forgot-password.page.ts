import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ForgotPasswordPage extends BasePage {
  readonly infoMessages = this.locator('.alert-info');
  readonly errors = this.locator('.alert-danger');
  readonly usernameOrEmailInput = this.locator('#username');
  readonly submitButton = this.locator('#forgot-password-submit-btn');

  constructor(page: Page) {
    super(page, '/auth/forgot_password', page.locator('#forgot-password-form'))
  }
}
