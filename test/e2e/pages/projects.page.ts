import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export type UserRoles =
  'can manage' |
  'can edit' |
  'can comment' |
  'can view'
  ;

export class ProjectsPage extends BasePage<ProjectsPage> {
  readonly projectsList = this.page.locator('[data-ng-repeat="project in visibleProjects"]');
  readonly projectNames = this.projectsList.locator('a[href^="/app/lexicon"]');

  readonly createButton = this.page.locator('button:has-text("Start or Join a New Project")');
  readonly createNonSRProjectButton = this.page.locator('text=Create a non-send/receive project (not recommended)'); // SR - send/receive
  readonly projectNameInput = this.page.locator('[placeholder="eg\\:\\ My\\ Dictionary"]');
  readonly nextButton = this.page.locator('text=Next'); // project creation: step after project name
  readonly skipInitialDataButton = this.page.locator('text=Skip');
  readonly selectLanguageButton = this.page.locator('a:has-text("Select")');
  readonly searchLanguageInput = this.page.locator('[placeholder="Search"]');
  readonly searchLanguageButton = this.page.locator('text=Search');
  readonly addLanguageButton = this.page.locator('#select-language-add-btn');
  readonly finalCreateButton = this.page.locator('button:has-text("Dictionary")');

  readonly shareProjectButton = this.page.locator('span:has-text("Share")');
  readonly shareProjectEmailInput = this.page.locator('[placeholder="Email"]');
  readonly shareProjectUserRoleDropdown = this.page.locator('role-dropdown[target="\'email_invite\'"]');
  readonly shareProjectSendInvitationButton = this.page.locator('button[ng-click="$ctrl.sendEmailInvite()"]');

  readonly projectsPerPageDropdown = this.page.locator('select[data-ng-model="$ctrl.itemsPerPage"]');
  readonly addAsTechSupportBtnText = 'text=Tech Support';

  constructor(page: Page) {
    super(page, '/app/projects', page.locator('button:has-text("Start or Join a New Project")'));
  }

  async goto(): Promise<ProjectsPage> {
    await super.goto();
    if (await this.projectsPerPageDropdown.isVisible()) {
      await this.projectsPerPageDropdown.selectOption('100');
    }
    return this;
  }

  async createEmptyProject(projectName: string) {
    await this.goto();
    await this.createButton.click();
    expect(this.page.url()).toContain('app/lexicon/new-project');
    await this.createNonSRProjectButton.click();
    await this.projectNameInput.fill(projectName);
    await this.nextButton.click();
    await this.skipInitialDataButton.click();
    await this.selectLanguageButton.click();
    await this.searchLanguageInput.fill('swab');
    await this.searchLanguageButton.click();
    await this.page.locator('text=Swabian').click();
    await this.addLanguageButton.click();
    await this.finalCreateButton.click()
  }

  async addUserToProject(projectName: string, userEmail: string, userRole: UserRoles) {
    await this.goto();
    await this.projectLink(projectName).click();
    await this.shareProjectButton.click();
    await this.shareProjectEmailInput.fill(userEmail);
    await this.shareProjectUserRoleDropdown.click();
    await this.page.locator('div.modal-dropdown[style*="display: block"] >> a.dropdown-item >> text=' + userRole).click();
    await this.shareProjectSendInvitationButton.click();
  }

  projectRow(projectName: string): Locator {
    return this.page.locator(`listview .row:has-text("${projectName}")`);
  }

  projectLink(projectName: string): Locator {
    return this.page.locator(`listview .row a:has-text("${projectName}")`);
  }

  projectAddTechSupportButtonLocator(projectName: string): Locator {
    return this.projectRow(projectName).locator('text=Tech Support');
  }

  projectLeaveProjectButtonLocator(projectName: string): Locator {
    return this.projectRow(projectName).locator('text=Leave this project');
  }
}
