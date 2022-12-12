import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ResetPasswordPage extends BasePage<ResetPasswordPage> {

  readonly newPasswordField = this.page.getByLabel('New password', { exact: true });
  readonly confirmPasswordField = this.page.getByLabel('Confirm new password', { exact: true });
  readonly resetPasswordButton = this.page.locator('#reset-password-btn');

  constructor(page: Page, resetPasswordKey: string) {
    super(page, `/auth/reset_password/${resetPasswordKey}`,
      page.locator(':text("Your password reset cannot be completed."), :text("Your password has been reset")'));
  }
}
