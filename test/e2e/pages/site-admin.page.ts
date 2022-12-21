import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class SiteAdminPage extends BasePage<SiteAdminPage> {
  readonly tabs = {
    reports: this.page.locator('#useres'),
    archivedProjects: this.page.locator('#archivedprojects')
  };
  readonly archivedProjectsTab = {
    deleteButton: this.page.locator('#site-admin-delete-btn'),
    republishButton: this.page.locator('#site-admin-republish-btn'),
    projectsList: this.page.locator('[data-ng-repeat="project in visibleProjects"]')
  };

  constructor(page: Page) {
    super(page, '/app/siteadmin', page.locator('.page-name >> text=Site Administration'));
  }
}
