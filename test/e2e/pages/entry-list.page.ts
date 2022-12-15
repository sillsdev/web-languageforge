import { expect, Locator, Page } from '@playwright/test';
import { Project } from '../utils';
import { BasePage } from './base-page';

export class EntryListPage extends BasePage<EntryListPage> {
  readonly totalNumberOfEntries = this.page.locator('#totalNumberOfEntries');
  readonly filterInput = this.page.locator('[placeholder="Search"]');
  readonly filterInputClearButton = this.page.locator('.clear-search-button');
  readonly matchCount = this.page.locator('#totalNumberOfEntries >> span');
  readonly createNewWordButton = this.page.locator('#newWord:visible, #noEntriesNewWord:visible');

  entry(lexeme: string): Locator {
    return this.locator(`.lexiconListItem:visible:has(span:has-text("${lexeme}"))`);
  }

  constructor(page: Page, readonly project: Project) {
    super(page, `/app/lexicon/${project.id}#!/editor/list`);
  }

  async expectTotalNumberOfEntries(nEntries: number) {
    // format: "3 / 3"
    await expect(this.totalNumberOfEntries).toHaveText(`${nEntries.toString()} / ${nEntries.toString()}`);
  }
}
