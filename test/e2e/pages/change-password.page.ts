import { expect, Locator, Page } from '@playwright/test';

export class ChangePasswordPage {
  readonly page: Page;
  readonly password: Locator;
  readonly confirm: Locator;
  readonly passwordMatchImage: Locator;
  readonly submitButton: Locator;
  readonly noticeList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.password = page.locator('#change-password-input');
    this.confirm = page.locator('#change-password-confirm-input');
    this.passwordMatchImage = page.locator('#change-password-match');
    this.submitButton = page.locator('#change-password-submit-button');
    // Note ng-repeat here, not data-ng-repeat. Search for "notice in $ctrl.notices()"
    // and you'll find it in notice.component.html, where you can verify the attribute
    this.noticeList = page.locator('[ng-repeat="notice in $ctrl.notices()"]');
  }

  async goto() {
    await this.page.goto('/app/changepassword');
    await expect(this.password).toBeVisible();
  }
}
