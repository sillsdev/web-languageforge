import { expect, Page } from '@playwright/test';
import { Project } from '../utils/types';
import { BasePage } from './base-page';

export class EntryListPage extends BasePage<EntryListPage> {
  readonly totalNumberOfEntries = this.page.locator('#totalNumberOfEntries');
  readonly filterInput = this.page.locator('[placeholder="Search"]');
  readonly filterInputClearButton = this.page.locator('.clear-search-button');
  readonly matchCount = this.page.locator('#totalNumberOfEntries >> span');
  readonly createNewWordButton = this.page.locator('#newWord:visible, #noEntriesNewWord:visible');

  constructor(page: Page, readonly project: Project) {
    super(page, `/app/lexicon/${project.id}/#!/editor/list`);
  }

  async expectTotalNumberOfEntries(nEntries: number) {
      // format: "3 / 3"
      await expect(this.totalNumberOfEntries).toHaveText(`${nEntries.toString()} / ${nEntries.toString()}`);
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
