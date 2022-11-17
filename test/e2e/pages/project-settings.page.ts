import { expect, Page } from '@playwright/test';
import { BasePage } from './base-page';
import { Project } from '../utils/types';

export class ProjectSettingsPage extends BasePage {
  readonly noticeList = this.page.locator('[ng-repeat="notice in $ctrl.notices()"]');

  readonly projectTab = {
    tabTitle: this.page.locator('text=Project Properties'),
    projectNameInput: this.page.locator('#projName'),
    defaultInterfaceLanguageInput: this.page.locator('#language'),
    projectOwner: this.page.locator('label:has-text("Project Owner") ~ div'),
    saveButton: this.page.locator('#project-settings-save-btn')
  };
  readonly deleteTab = {
    tabTitle: this.page.locator('li[heading="Delete"]'),
    confirmDeleteInput: this.page.locator('#deletebox'),
    deleteProjectButton: this.page.locator('text=Delete this project')
  };

  readonly deleteModal = {
    cancel: this.page.locator('div.modal-content >> text="Cancel"'),
    confirm: this.page.locator('div.modal-content >> text="Delete"')
  };


  constructor(page: Page, readonly project: Project) {
    super(page, 'app/lexicon/' + project.id + '/#!/settings', page.locator('.page-name >> text=' + project.name));
  }

  // navigate to project without UI
  async goto() {
    await super.goto();
    await this.page.getByLabel('Project Name').waitFor();
  }

  async deleteProject() {
    await this.deleteTab.tabTitle.click();
    await this.deleteTab.confirmDeleteInput.fill('delete');
    await this.deleteTab.deleteProjectButton.click();
    await this.deleteModal.confirm.click();
  }

  async countNotices(): Promise<number> {
    return await this.noticeList.count();
  }

  async setDefaultInterfaceLanguage(toLanguage: string, fromLanguage: string) {
    await expect(this.projectTab.tabTitle).toBeVisible();
    await expect(this.projectTab.saveButton).toBeVisible();
    await expect(this.projectTab.defaultInterfaceLanguageInput).toBeVisible();
    await expect(this.projectTab.defaultInterfaceLanguageInput.locator('option[selected="selected"]')).toHaveText(fromLanguage);
    await this.projectTab.defaultInterfaceLanguageInput.selectOption({ label: toLanguage });
    await this.projectTab.saveButton.click();
  }
}
