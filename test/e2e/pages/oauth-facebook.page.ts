import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class OAuthFacebookPage extends BasePage {

  override get isCurrentPage(): boolean {
    return this.page.url().startsWith('https://www.facebook.com/');
  }

  constructor(page: Page) {
    super(page, '/oauthcallback/facebook', page.locator('#facebook'));
  }

}
