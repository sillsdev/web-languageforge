import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ActivityPage extends BasePage<ActivityPage> {
  readonly activitiesList = this.page.locator('.activity-content');

  constructor(page: Page) {
    super(page, '/app/activity', page.locator('.page-name >> text=Activity'));
  }
}
