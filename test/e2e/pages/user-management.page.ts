import { expect, Locator, Page } from '@playwright/test';


export class UserManagementPage {
  readonly page: Page;
  readonly addMembersBtn: Locator;
  readonly userRowSelector: string;
  static readonly url: string = '/app/usermanagement/';

  constructor(page: Page) {
    this.page = page;
    this.addMembersBtn = page.locator('text=Add Members');
    this.userRowSelector = 'tr[data-ng-repeat="user in $ctrl.list.visibleUsers"]';
  }

  async goto(projectId: string) {
    await this.page.goto(UserManagementPage.url + projectId);
    await expect(this.addMembersBtn).toBeVisible();
  }

  // TOASK: or put the projectId in the constructor?
  async getUserRow(projectId: string, userName: string): Promise<Locator> {
    await this.goto(projectId);
    const userRowLocator = this.page.locator(`css=${this.userRowSelector}:has(td:has-text("${userName}"))`);
    if (await userRowLocator.count() == 1) {
      return userRowLocator;
    }
    return undefined;
  }

  async getUserRole(projectId: string, userName: string): Promise<string> {
    const userRow = await this.getUserRow(projectId, userName);
    expect(userRow).not.toBeUndefined();
    return userRow.locator('[selected="selected"]').innerText();
  }

  async getRoleSelectLocator(projectId: string, userName: string): Promise<Locator> {
    const userRow = await this.getUserRow(projectId, userName);
    expect(userRow).not.toBeUndefined();
    return userRow.locator('select[data-ng-model="user.role"]');
  }

  async changeUserRole(projectId: string, userName: string) {

  }

}
