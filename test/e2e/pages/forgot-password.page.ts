import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ForgotPasswordPage extends BasePage<ForgotPasswordPage> {
  readonly infoMessages = this.page.locator('.alert-info');
  readonly errors = this.page.locator('.alert-danger');
  readonly usernameOrEmailInput = this.page.locator('#username');
  readonly submitButton = this.page.locator('#forgot-password-submit-btn');

  constructor(page: Page) {
    super(page, '/auth/forgot_password', page.locator('#forgot-password-form'))
  }
}
