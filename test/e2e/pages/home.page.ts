import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  readonly signupButton = this.locator('a:text("Sign Up"):visible');
  readonly loginButton = this.locator('a:text("Login"):visible');
  readonly termsAndConditionsLink = this.locator('a:text("terms and conditions"):visible');
  readonly additionalResourceLinkContainer = this.locator('section:has-text("Additional Resources") .actions li');
  readonly videoIFrame = this.locator('div.videoWrapper iframe');

  constructor(page: Page) {
    super(page, '', page.locator('#banner:has-text("syncs with FieldWorks")'));
  }
}
