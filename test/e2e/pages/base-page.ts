import { Locator, Page } from "@playwright/test";
import { PageHeader } from "../components/page-header.component";

export interface GotoOptions {
  waitFor?: Locator;
  expectRedirect?: boolean;
}

export abstract class BasePage<T extends BasePage<T>> implements Pick<Page, 'locator'> {

  readonly header = new PageHeader(this.page);

  private readonly waitFor: Locator[];
  private readonly urlPattern = this.url.includes('#') ?
    new RegExp(`${this.url}`) : new RegExp(`${this.url}/?(#|$)`);

  private get self(): T {
    return this as unknown as T;
  }

  constructor(readonly page: Page, readonly url: string, waitFor: Locator[] | Locator = []) {
    this.waitFor = Array.isArray(waitFor) ? waitFor : [waitFor];
  }

  async goto(options?: GotoOptions): Promise<T> {
    await Promise.all([
      this.page.goto(this.url),
      options?.expectRedirect || this.waitForPage(), // this page won't load if a redirect happens
      options?.waitFor?.waitFor(),
    ]);
    return this.self;
  }

  async waitForPage(): Promise<T> {
    await Promise.all([
      this.page.url().match(this.urlPattern) ?? this.page.waitForURL(this.urlPattern),
      ...this.waitFor.map(wait => wait.waitFor()),
    ]);
    return this.self;
  }

  async reload(): Promise<T> {
    await Promise.all([
      this.page.reload(),
      this.waitForPage(),
    ]);
    return this.self;
  }

  locator(selector: string, options?: {
    has?: Locator;
    hasText?: string | RegExp;
  }, parent?: Locator): Locator {
    const base = parent ?? this.page;
    return base.locator(selector, options);
  }

  // Custom locators
  label(text: string, parent?: Locator): Locator {
    return this.locator(`label:has-text("${text}")`, undefined, parent);
  }
}
