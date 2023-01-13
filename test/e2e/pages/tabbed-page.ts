import { Locator } from '@playwright/test';
import { BasePage, GotoOptions } from './base-page';

/**
 * Standardizes navigating to a specific tab and waiting for it to be ready before using/testing it.
 */
export abstract class TabbedBasePage extends BasePage {

  /**
   * Where to click to access the tab this tabbed-page represents
   */
  protected abstract get tabLink(): Locator;

  async goto(options?: GotoOptions): Promise<this> {
    await this.page.goto(this.url);
    await Promise.all([
      this.tabLink.click(),
      options?.expectRedirect || this.waitFor(),
    ]);
    return this;
  }
}
