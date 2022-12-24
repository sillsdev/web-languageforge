import { expect, Locator, Page } from '@playwright/test';
import { Project } from '../utils';
import { BasePage } from './base-page';

export class EntryListPage extends BasePage {
  readonly totalNumberOfEntries = this.locator('#totalNumberOfEntries');
  readonly filterInput = this.locator('[placeholder="Search"]');
  readonly filterInputClearButton = this.locator('.clear-search-button');
  readonly matchCount = this.locator('#totalNumberOfEntries >> span');
  readonly createNewWordButton = this.locator('#newWord:visible, #noEntriesNewWord:visible');

  entry(lexeme: string): Locator {
    return this.locator(`.lexiconListItem:visible:has(span:has-text("${lexeme}"))`);
  }

  constructor(page: Page, readonly project: Project) {
    super(page, `/app/lexicon/${project.id}#!/editor/list`, page.locator('#totalNumberOfEntries'));
  }

  async expectTotalNumberOfEntries(nEntries: number) {
    // format: "3 / 3"
    await expect(this.totalNumberOfEntries).toHaveText(`${nEntries.toString()} / ${nEntries.toString()}`);
  }
}
