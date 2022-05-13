import { expect, Locator, Page } from '@playwright/test';
import { ProjectsPage } from './projects.page';


type ProjectTab = {
  tabTitle: Locator;
  projectNameInput: Locator;
  defaultInterfaceLanguageInput: Locator;
  projectOwner: Locator;
  saveButton: Locator;
}

type DeleteTab = {
  tabTitle: Locator;
  confirmDeleteInput: Locator;
  deleteProjectButton: Locator;
}

// if more modal like this -> create a more general modal
type DeleteModal = {
  cancel: Locator;
  confirm: Locator;
}

export class ProjectSettingsPage {
  readonly page: Page;
  readonly projectsPage: ProjectsPage;
  readonly settingsMenuLink: Locator;
  readonly projectSettingsLink: Locator;
  readonly noticeList: Locator;

  readonly projectTab: ProjectTab;
  readonly deleteTab: DeleteTab;

  readonly deleteModal: DeleteModal;


  constructor(page: Page) {
    this.page = page;
    this.projectsPage = new ProjectsPage(this.page);
    this.settingsMenuLink = page.locator('#settings-dropdown-button');
    this.projectSettingsLink = page.locator('#dropdown-project-settings');
    this.noticeList = page.locator('[ng-repeat="notice in $ctrl.notices()"]');

    this.projectTab = {
      tabTitle: page.locator('text=Project Properties'),
      projectNameInput: page.locator('#projName'),
      defaultInterfaceLanguageInput: page.locator('#language'),
      projectOwner: page.locator('#e2e-test-project-owner'),
      saveButton: page.locator('#project-settings-save-btn')
    };

    this.deleteTab = {
      tabTitle: page.locator('li[heading="Delete"]'),
      confirmDeleteInput: page.locator('#deletebox'),
      deleteProjectButton: page.locator('text=Delete this project')
    };

    this.deleteModal = {
      cancel: page.locator('div.modal-content >> text="Cancel"'),
      confirm: page.locator('div.modal-content >> text="Delete"')
    };
  }

  // Get the projectSettings for project projectName
  async goto(projectName: string) {
    await this.projectsPage.goto();
    await this.projectsPage.clickOnProject(projectName);
    await expect(this.settingsMenuLink).toBeVisible();
    await this.settingsMenuLink.click();
    await expect(this.projectSettingsLink).toBeVisible();
    await this.projectSettingsLink.click();
  }

  // navigate to project without UI
  async gotoProjectSettingsDirectly(projectId: string, projectName: string) {
    await this.page.goto('app/lexicon/' + projectId + '/#!/settings');
    await expect(this.page.locator('.page-name >> text=' + projectName)).toBeVisible();
  }

  async gotoProjectDirectly(projectId: string, projectName: string) {
    await this.page.goto('app/lexicon/' + projectId);
    await expect(this.page.locator('.page-name >> text=' + projectName)).toBeVisible();
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
}
