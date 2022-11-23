import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ForgotPasswordPage extends BasePage<ForgotPasswordPage> {
    // infoMessage and errors are dynamic elements, so class name locators seem to be the best option
  readonly infoMessages = this.page.locator('.alert-info');
  readonly errors = this.page.locator('.alert-danger');
  readonly usernameInput = this.page.locator('#username');
  readonly submitButton = this.page.locator('#forgot-password-submit-btn');

  constructor(page: Page) {
    super(page, '/auth/forgot_password', page.locator('#forgot-password-form'))
  }
}
