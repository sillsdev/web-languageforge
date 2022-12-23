import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class SiteAdminPage extends BasePage {
  readonly tabs = {
    reports: this.locator('#useres'),
    archivedProjects: this.locator('#archivedprojects')
  };
  readonly archivedProjectsTab = {
    deleteButton: this.locator('#site-admin-delete-btn'),
    republishButton: this.locator('#site-admin-republish-btn'),
    projectsList: this.locator('[data-ng-repeat="project in visibleProjects"]')
  };

  constructor(page: Page) {
    super(page, '/app/siteadmin', page.locator('.page-name >> text=Site Administration'));
  }
}
