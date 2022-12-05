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

  /**
   * The page never loads if the reset password key is invalid. It's immediately redirected to the login page.
   * So, we can't wait for this page, but the page locator above works for the reset password page
   * as well as the login page, so there's still a stable wait in place.
   */
  override async waitForPage(): Promise<ResetPasswordPage> {
    return this;
  }
}
