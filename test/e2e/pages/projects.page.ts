import { expect, Locator, Page } from '@playwright/test';

export class ProjectsPage {
  readonly page: Page;
  readonly pageName: Locator;
  readonly projectsList: Locator;
  readonly projectNames: Locator;
  readonly createButton: Locator;
  static readonly url: string = '/app/projects';

  constructor(page: Page) {
    this.page = page;
    this.pageName = page.locator('.page-name >> text=My Projects');
    this.createButton = page.locator('button:has-text("Start or Join a New Project")');
    this.projectsList = page.locator('[data-ng-repeat="project in visibleProjects"]');
    this.projectNames = this.projectsList.locator('a[href^="/app/lexicon"]');
  }

  async goto() {
    await this.page.goto(ProjectsPage.url);
    await expect(this.pageName).toBeVisible();
  }
}
