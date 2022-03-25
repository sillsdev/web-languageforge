import { expect, Locator, Page } from '@playwright/test';
import { ProjectsPage } from './projects.page';


type Tabs = {
  project: Locator;
  remove: Locator;
};

export class ProjectSettingsPage {
  readonly page: Page;
  readonly projectsPage: ProjectsPage;
  readonly settingsMenuLink: Locator;
  readonly noticeList: Locator;
  readonly tabs: Tabs;


  constructor(page: Page) {
    this.page = page;
    this.projectsPage = new ProjectsPage(this.page);
    this.settingsMenuLink = page.locator('#settings-dropdown-button');
    this.noticeList = page.locator('[ng-repeat="notice in $ctrl.notices()"]');
    this.tabs = {
      project: page.locator('text=Project Properties'),
      remove: page.locator('text=Delete')
    }
  }

    // Get the projectSettings for project projectName
    async goto(projectName: string) {
      await this.projectsPage.get();
      await this.projectsPage.clickOnProject(projectName);
      await browser.wait(ExpectedConditions.visibilityOf(this.settingsMenuLink), this.conditionTimeout);
      await this.settingsMenuLink.click();
      await browser.wait(ExpectedConditions.visibilityOf(this.projectSettingsLink), this.conditionTimeout);
      return this.projectSettingsLink.click();
    }

    async clickOnProject(projectName: string) {

    }
}
