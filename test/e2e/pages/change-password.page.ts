import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ChangePasswordPage extends BasePage {
  readonly passwordInput = this.locator('#change-password-input');
  readonly confirmInput = this.locator('#change-password-confirm-input');
  readonly passwordMatchImage = this.locator('#change-password-match');
  readonly submitButton = this.locator('#change-password-submit-button');

  constructor(page: Page) {
    super(page, '/app/changepassword', page.locator('#change-password-input'));
  }
}
