import { expect, Locator, Page } from '@playwright/test';

type Tabs = {
  reports: Locator;
  archivedProjects: Locator;
};

type ArchivedProjectsTab = {
  republishButton: Locator;
  deleteButton: Locator;
  projectsList: Locator;
};

export class SiteAdminPage {
  readonly page: Page;
  readonly pageName: Locator;
  readonly tabs: Tabs;
  readonly archivedProjectsTab: ArchivedProjectsTab;
  static readonly url: string = '/app/siteadmin';

  constructor(page: Page) {
    this.page = page;
    this.pageName = page.locator('.page-name >> text=Site Administration');
    this.tabs = {
      reports: page.locator('#useres'),
      archivedProjects: page.locator('#archivedprojects')
    };
    this.archivedProjectsTab = {
      deleteButton: page.locator('#site-admin-delete-btn'),
      republishButton: page.locator('#site-admin-republish-btn'),
      projectsList: page.locator('[data-ng-repeat="project in visibleProjects"]')
    };
  }

  async goto() {
    await this.page.goto(SiteAdminPage.url);
    await expect(this.pageName).toBeVisible();
  }
}
