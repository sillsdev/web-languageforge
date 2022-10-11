import { Locator, Page } from "@playwright/test";

export abstract class BasePage {

  constructor(readonly page: Page, readonly url: string, readonly pageLocator?: Locator) {
  }

  async goto() {
    await this.page.goto(this.url);
    await this.pageLocator?.waitFor();
  }
}
