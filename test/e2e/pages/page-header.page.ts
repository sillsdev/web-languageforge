import { Locator, Page } from "@playwright/test";

type MyProjects = {
  button: Locator;
  links: Locator;
};

export class PageHeader {
  readonly page: Page;
  readonly myProjects: MyProjects;
  readonly loginButton: Locator;
  readonly languageDropdownButton: Locator;
  readonly languageDropdownItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.myProjects = {
      button: page.locator('#myProjectDropdownButton'),
      links: page.locator('#myProjectDropdownMenu >> .dropdown-item')
    };
    this.loginButton = page.locator('text=Login').nth(0);
    this.languageDropdownButton = page.locator('#languageDropdownButton');
    this.languageDropdownItem = page.locator('#languageDropdownMenu >> .dropdown-item');
  }
}
