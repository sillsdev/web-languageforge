import { Locator, Page } from "@playwright/test";

export interface GotoOptions {
  waitFor?: Locator;
}

export abstract class BasePage<T extends BasePage<T>> {

  readonly waitFor?: Locator[];

  constructor(readonly page: Page, readonly url: string, waitFor?: Locator[] | Locator) {
    this.waitFor = Array.isArray(waitFor) ? waitFor
    : waitFor !== undefined ? [waitFor]
    : undefined;
  }

  async goto(options?: GotoOptions): Promise<T> {
    await Promise.all([
      this.page.goto(this.url),
      this.waitForPage(),
      options?.waitFor?.waitFor(),
    ]);
    return this as unknown as T;
  }

  async waitForPage(): Promise<T> {
    await Promise.all([
      this.page.waitForURL(new RegExp(`${this.url}(#|$)`)),
      ...this.waitFor?.map(wait => wait.waitFor()),
    ]);
    return this as unknown as T;
  }
}
