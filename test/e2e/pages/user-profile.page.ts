import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class UserProfilePage extends BasePage {
  readonly activitiesList = this.locator('[data-ng-repeat="item in filteredActivities"]');
  readonly tabs = {
    aboutMe: this.locator('#AboutMeTab'),
    myAccount: this.locator('#myAccountTab')
  };

  readonly accountTab = {
    emailField: this.page.getByLabel('Email Address'),
    usernameField: this.page.getByLabel('Username'),
    colorField: this.locator('select:has-text("Select a Color...")'),
    animalField: this.locator('select:has-text("Choose an animal...")'),
  };

  readonly aboutMeTab = {
    nameField: this.page.getByLabel('Full Name'),
    ageField: this.page.getByLabel('Age'),
    genderField: this.page.getByLabel('Gender'),
  };

  readonly saveBtn = this.locator('#saveBtn');

  readonly modal = {
    saveChangesBtn: this.locator('.modal-dialog button:has-text("Save changes")'),
  };

  constructor(page: Page) {
    super(page, '/app/userprofile', page.locator('.page-name >> text=\'s User Profile'));
  }
}
