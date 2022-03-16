import { expect, Locator, Page } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  form: Locator;
  infoMessages: Locator;
  errors: Locator;
  usernameInput: Locator;
  submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#forgot-password-form');
    // infoMessage and errors are dynamic elements, so class name locators seem to be the best option
    this.infoMessages = page.locator('.alert-info');
    this.errors = page.locator('.alert-danger');
    this.usernameInput = page.locator('#username');
    this.submitButton = page.locator('#forgot-password-submit-btn');
  }

  async goto() {
    await this.page.goto('/auth/forgot_password');
    await expect(this.form).toBeVisible();
  }
}
