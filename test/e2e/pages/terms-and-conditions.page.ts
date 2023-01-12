import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class TermsAndConditionsPage extends BasePage {

  constructor(page: Page) {
    super(page, '/terms_and_conditions', page.locator(':text("Website Terms of Use")'));
  }
}
