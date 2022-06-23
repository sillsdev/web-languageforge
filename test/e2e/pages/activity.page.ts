import { expect, Locator, Page } from '@playwright/test';

export class ActivityPage {
  readonly page: Page;
  readonly pageName: Locator;
  readonly activitiesList: Locator;
  static readonly url: string = '/app/activity';

  constructor(page: Page) {
    this.page = page;
    this.pageName = page.locator('.page-name >> text=Activity');
    this.activitiesList = page.locator('.activity-content');
  }

  async goto(projectCode: string) {
    await this.page.goto(ActivityPage.url + '/' + projectCode);
    await expect(this.pageName).toBeVisible();
  }
}
