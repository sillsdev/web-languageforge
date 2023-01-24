import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class UserProfilePage extends BasePage {
  readonly activitiesList = this.locator('[data-ng-repeat="item in filteredActivities"]');
  readonly tabs = {
    aboutMe: this.locator('#AboutMeTab'),
    myAccount: this.locator('#myAccountTab'),
    deleteAccount: this.locator('#DeleteTab')
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

  readonly deleteTab = {
    confirmField: this.page.getByLabel('Confirm deletion by typing DELETE into the box below'),
  }

  private readonly saveBtn = this.locator('#saveMyAccountBtn:visible, #saveAboutMeBtn:visible');
  private readonly deleteAccountButton = this.locator('#deleteAccountBtn')


  readonly changesModal = {
    saveChangesBtn: this.locator('.modal-dialog button:has-text("Save changes")'),
  };

  readonly deleteModal = {
    confirmDeletionBtn: this.locator('.modal-dialog button:has-text("Delete")'),
  };



  private readonly successfulUpdateNotice = this.noticeList.success('Profile updated successfully');
  private readonly successfulDeleteNotice = this.noticeList.success('Your account was permanently deleted');

  constructor(page: Page) {
    super(page, '/app/userprofile', page.locator('.page-name >> text=\'s User Profile'));
  }

  async save(): Promise<void> {
    await this.saveBtn.click();

    await Promise.race([
      // Some changes require confirmation and then log the user out (e.g. username)
      this.changesModal.saveChangesBtn.click(),
      // others just show a success message
      this.successfulUpdateNotice.waitFor(),
    ]);
  }

  async deleteMyAccount(): Promise<void> {
    await this.deleteAccountButton.click();

    await Promise.race([
      // deletion confirmation
      this.deleteModal.confirmDeletionBtn.click(),
      // success message
      this.successfulDeleteNotice.waitFor(),
    ]);
  }

}
