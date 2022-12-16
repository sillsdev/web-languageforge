import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class UserProfilePage extends BasePage<UserProfilePage> {
  readonly activitiesList = this.page.locator('[data-ng-repeat="item in filteredActivities"]');
  readonly tabs = {
    aboutMe: this.page.locator('#AboutMeTab'),
    myAccount: this.page.locator('#myAccountTab')
  };

  readonly accountTab = {
    emailField: this.page.getByLabel('Email Address'),
    usernameField: this.page.getByLabel('Username'),
    colorField: this.page.locator('select:has-text("Select a Color...")'),
    animalField: this.page.locator('select:has-text("Choose an animal...")'),
  };

  readonly aboutMeTab = {
    nameField: this.page.getByLabel('Full Name'),
    ageField: this.page.getByLabel('Age'),
    genderField: this.page.getByLabel('Gender'),
  };

  readonly saveBtn = this.page.locator('#saveBtn');

  readonly modal = {
    saveChangesBtn: this.page.locator('.modal-dialog button:has-text("Save changes")'),
  };

  constructor(page: Page) {
    super(page, '/app/userprofile', page.locator('.page-name >> text=\'s User Profile'));
  }
}
