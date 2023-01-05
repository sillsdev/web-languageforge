import { expect, Page } from '@playwright/test';
import { Project } from '../utils';
import { BasePage } from './base-page';

export class ProjectSettingsPage extends BasePage {

  readonly projectTab = {
    tabTitle: this.locator('text=Project Properties'),
    projectNameInput: this.locator('#projName'),
    defaultInterfaceLanguageInput: this.locator('#language'),
    projectOwner: this.locator('label:has-text("Project Owner") ~ div'),
    saveButton: this.locator('#project-settings-save-btn')
  };
  readonly deleteTab = {
    tabTitle: this.locator('li[heading="Delete"]'),
    confirmDeleteInput: this.locator('#deletebox'),
    deleteProjectButton: this.locator('text=Delete this project')
  };

  readonly deleteModal = {
    cancel: this.locator('div.modal-content >> text="Cancel"'),
    confirm: this.locator('div.modal-content >> text="Delete"')
  };

  constructor(page: Page, readonly project: Project) {
    super(page, 'app/lexicon/' + project.id + '/#!/settings', page.locator('text=Project Properties'));
  }

  // navigate to project without UI
  async goto(): Promise<this> {
    await super.goto();
    await this.page.getByLabel('Project Name').waitFor();
    return this;
  }

  async deleteProject() {
    await this.deleteTab.tabTitle.click();
    await this.deleteTab.confirmDeleteInput.fill('delete');
    await this.deleteTab.deleteProjectButton.click();
    await this.deleteModal.confirm.click();
  }

  async setDefaultInterfaceLanguage(language: string) {
    await expect(this.projectTab.tabTitle).toBeVisible();
    await expect(this.projectTab.saveButton).toBeEnabled();
    // This selectOption() seems to sometimes have no effect. Potentially it has to do with the Angular state/lifecycle.
    // The (or perhaps any) two awaits above seems to stabilise it quite well.
    await this.projectTab.defaultInterfaceLanguageInput.selectOption({ label: language });
    await this.projectTab.saveButton.click();
  }
}
