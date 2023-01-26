import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class OAuthGooglePage extends BasePage {

  override get isCurrentPage(): boolean {
    return this.page.url().startsWith('https://accounts.google.com/');
  }

  constructor(page: Page) {
    super(page, '/oauthcallback/google', page.locator(':text("Google will share your name"), :text("The OAuth client was not found.")'));
  }

}
