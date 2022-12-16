import { Locator } from "@playwright/test";

export abstract class BaseComponent {

  constructor(protected readonly componentLocator: Locator) {
  }

  protected locator(selector: string): Locator {
    return this.componentLocator.locator(selector);
  }

  async waitFor(): Promise<this> {
    await this.componentLocator.waitFor();
    return this;
  }
}
