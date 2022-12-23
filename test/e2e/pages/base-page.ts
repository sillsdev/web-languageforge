import { Locator, Page, APIRequestContext } from '@playwright/test';
import { NoticeElement, PageHeader } from "./components";

export interface GotoOptions {
  waitFor?: Locator;
  expectRedirect?: boolean;
}

/**
 * Standardizes how we navigate to a page and wait until it is ready before using/testing it.
 */
export abstract class BasePage
  implements Pick<Page, 'locator' | 'request'> // a nifty way to pull their documentation onto our class
{

  get page(): Page {
    if (this._page.isClosed()) {
      throw new Error('Page is already closed. Are you accessing a page/tab that was injected into a beforeAll?');
    }
    return this._page;
  }

  readonly request: APIRequestContext;

  readonly header = new PageHeader(this.page);
  readonly noticeList = new NoticeElement(this.page);

  private readonly locators: Locator[];
  private readonly urlPattern = this.url.includes('#') ?
    new RegExp(`${this.url}`) : new RegExp(`${this.url}/?(#|$)`);

  constructor(private readonly _page: Page, readonly url: string, locators: Locator[] | Locator) {
    this.locators = Array.isArray(locators) ? locators : [locators];
    this.request = _page.request;
  }

  /**
   * Navigates to the page via URL and waits for it to load.
   * @returns the page for convenience/chaining
   */
  async goto(options?: GotoOptions): Promise<this> {
    await Promise.all([
      this.page.goto(this.url),
      options?.expectRedirect || this.waitFor(), // this page won't load if a redirect happens
      options?.waitFor?.waitFor(),
    ]).catch(error => {
      console.error(error);
      throw error;
    });
    return this;
  }

  /**
   * Wait for the page to load.
   * @returns the page for convenience/chaining
   */
  async waitFor(): Promise<this> {
    await Promise.all([
      this.page.url().match(this.urlPattern) ?? this.page.waitForURL(this.urlPattern),
      ...this.locators.map(wait => wait.waitFor()),
    ]);
    return this;
  }

  /**
   * Reloads the page and waits for it to load.
   * @returns the page for convenience/chaining
   */
  async reload(): Promise<this> {
    await this.page.reload();
    await this.waitFor().catch(error => {
      console.error(error);
      throw error;
    });
    return this;
  }

  // Convenience method for accessing Page.locator
  // Note: don't provide TS-Doc, so that Page.locator is used
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

  /**
   * Conveneience method for instantiating and navigating to the page.
   */
  static goto<T extends GenericPage<T>>(this: T, ...args: ConstructorParameters<T>): Promise<InstanceType<T>> {
    return new this(...args).goto();
  }

  /**
   * Conveneience method for instantiating and waiting for the page.
   */
  static waitFor<T extends GenericPage<T>>(this: T, ...args: ConstructorParameters<T>): Promise<InstanceType<T>> {
    return new this(...args).waitFor();
  }
}

type GenericPage<T extends new (...args: ConstructorParameters<T>) => InstanceType<T>>
  = new (...args: ConstructorParameters<T>) => InstanceType<T> & BasePage;
