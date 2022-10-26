import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class UserProfilePage extends BasePage {
  readonly activitiesList = this.page.locator('[data-ng-repeat="item in filteredActivities"]');
  readonly tabs = {
    aboutMe: this.page.locator('#AboutMeTab'),
    myAccount: this.page.locator('#myAccountTab')
  };

  constructor(page: Page) {
    super(page, '/app/userprofile', page.locator('.page-name >> text=Admin\'s User Profile'));
  }
}
