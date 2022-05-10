import { expect, Locator, Page } from '@playwright/test';


export class EntriesListPage {
  readonly page: Page;
  readonly totalNumberOfEntries: Locator;
  readonly projectId: string;

  readonly url: string;

  constructor(page: Page, projectId: string) {
    this.page = page;
    this.projectId = projectId
    this.totalNumberOfEntries = this.page.locator('#totalNumberOfEntries');
    this.url = `/app/lexicon/${this.projectId}/#!/editor/list`;
  }

  async goto() {
    // JeanneSonTODO check if already there?
    await this.page.goto(this.url);
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
    // TOASK: do we need this await here
    await this.page.locator(entrySelector).click();
  }
}
