import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ChangePasswordPage extends BasePage<ChangePasswordPage> {
  readonly passwordInput = this.page.locator('#change-password-input');
  readonly confirmInput = this.page.locator('#change-password-confirm-input');
  readonly passwordMatchImage = this.page.locator('#change-password-match');
  readonly submitButton = this.page.locator('#change-password-submit-button');

  constructor(page: Page) {
    super(page, '/app/changepassword', page.locator('#change-password-input'));
  }
}
