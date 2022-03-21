import { expect, Locator, Page } from '@playwright/test';

type Tabs = {
  aboutMe: Locator;
  myAccount: Locator;
};

export class UserProfilePage {
  readonly page: Page;
  readonly pageName: Locator;
  readonly activitiesList: Locator;
  readonly tabs: Tabs;
  static readonly url: string = '/app/userprofile';

  constructor(page: Page) {
    this.page = page;
    this.pageName = page.locator('.page-name >> text=Admin\'s User Profile');
    this.activitiesList = page.locator('[data-ng-repeat="item in filteredActivities"]');
    this.tabs = {
      aboutMe: page.locator('#AboutMeTab'),
      myAccount: page.locator('#myAccountTab')
    };
  }

  async goto() {
    await this.page.goto(UserProfilePage.url);
    await expect(this.pageName).toBeVisible();
  }
}
