import { Page } from "@playwright/test";

export class PageHeader {

  readonly myProjects = {
    button: this.page.locator('#myProjectDropdownButton'),
    links: this.page.locator('#myProjectDropdownMenu >> .dropdown-item'),
  };
  readonly loginButton = this.page.locator('text=Login').nth(0);
  readonly languageDropdownButton = this.page.locator('#languageDropdownButton');
  readonly languageDropdownItem = this.page.locator('#languageDropdownMenu >> .dropdown-item');

  readonly userDropdownButton = this.page.locator('#userDropdown');
  private readonly userDropdownMenu = this.page.locator('#userDropdown ~ .dropdown-menu');
  readonly userDropdown = {
    profile: this.userDropdownMenu.getByText('My Profile'),
    changePassword: this.userDropdownMenu.getByText('Change Password'),
    logout: this.userDropdownMenu.getByText('Logout'),
  };

  constructor(private readonly page: Page) {
  }
}
