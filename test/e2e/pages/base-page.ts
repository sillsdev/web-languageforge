import { Locator, Page } from "@playwright/test";

export interface GotoOptions {
  waitFor?: Locator;
}

export abstract class BasePage {

  constructor(readonly page: Page, readonly url: string, readonly waitFor?: Locator) {
  }

  async goto(options?: GotoOptions): Promise<void> {
    await Promise.all([
      this.page.goto(this.url),
      this.waitForPage(),
      options?.waitFor?.waitFor(),
    ]);
  }

  async waitForPage(): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({url: new RegExp(`${this.url}(#|$)`)}),
      this.waitFor?.waitFor(),
    ]);
  }
}
