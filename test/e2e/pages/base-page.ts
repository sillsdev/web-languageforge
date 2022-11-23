import { Locator, Page } from "@playwright/test";

export interface GotoOptions {
  waitFor?: Locator;
}

export abstract class BasePage<T extends BasePage<T>> {

  constructor(readonly page: Page, readonly url: string, readonly waitFor?: Locator) {
  }

  async goto(options?: GotoOptions): Promise<T> {
    await Promise.all([
      this.page.goto(this.url),
      this.waitForPage(),
      options?.waitFor?.waitFor(),
    ]);
    return this as unknown as T;
  }

  async waitForPage(): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({url: new RegExp(`${this.url}(#|$)`)}),
      this.waitFor?.waitFor(),
    ]);
  }
}
