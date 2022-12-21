import { Locator } from '@playwright/test';
import { BasePage, GotoOptions } from './base-page';

export abstract class TabbedBasePage<T extends TabbedBasePage<T>> extends BasePage<T> {

  protected abstract get tabLink(): Locator;

  async goto(options?: GotoOptions): Promise<T> {
    await Promise.all([
      this.page.goto(this.url),
      options?.waitFor?.waitFor(),
    ]);
    await Promise.all([
      this.tabLink.click(),
      this.waitForPage(),
    ]);
    return this as unknown as T;
  }
}
