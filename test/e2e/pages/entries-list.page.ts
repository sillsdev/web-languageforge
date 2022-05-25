import { expect, Locator, Page } from '@playwright/test';

export class EntriesListPage {
  readonly page: Page;
  readonly projectId: string;

  readonly totalNumberOfEntries: Locator;

  readonly filterInput: Locator;
  readonly filterInputClearButton: Locator;
  readonly matchCount: Locator;

  readonly url: string;

  constructor(page: Page, projectId: string) {
    this.page = page;
    this.projectId = projectId

    this.totalNumberOfEntries = this.page.locator('#totalNumberOfEntries');

    this.filterInput = this.page.locator('[placeholder="Filter Entries"]');
    this.filterInputClearButton = this.page.locator('.clear-search-button');
    this.matchCount = this.page.locator('#totalNumberOfEntries >> span');

    this.url = `/app/lexicon/${this.projectId}/#!/editor/list`;
  }

  async goto() {
    await this.page.goto(this.url);
    // JeanneSonTODO: wait for an element on the page to be visible
    await this.page.waitForTimeout(3000);
  }

  async getTotalNumberOfEntries(): Promise<string> {
    return this.totalNumberOfEntries.innerText();
  }

  async findEntry(lexeme: string): Promise<string> {
    const foundElements = this.page.locator('span:has-text("' + lexeme + '")');
    const nFoundElements = await foundElements.count();
    for (let i = 0; i < nFoundElements; i++) {
      if (await foundElements.nth(i).isVisible()) {
        return 'span:has-text("' + lexeme + '") >> nth=' + i;
      }
    }
    return '-1';
  }

  async clickOnEntry(lexeme: string) {
    const entrySelector: string = await this.findEntry(lexeme);

    expect(entrySelector).not.toEqual('-1');
    await this.page.locator(entrySelector).click();
  }
}
