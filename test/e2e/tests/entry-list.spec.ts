import { expect } from '@playwright/test';
import { entries } from '../constants';
import { defaultProject, test } from '../fixtures';
import { EditorPage, EntryListPage } from '../pages';

test.describe('Entries List', () => {

  const { project, entryIds } = defaultProject();

  test.describe('Entries List', () => {

    let entryListPageManager: EntryListPage;

    test.beforeEach(async ({ managerTab }) => {
      entryListPageManager = await EntryListPage.goto(managerTab, project());
    });

    test('Entries list has correct number of entries', async () => {
      await entryListPageManager.expectTotalNumberOfEntries(entryIds().length);
    });

    test('Search function works correctly', async () => {
      await entryListPageManager.filterInput.fill('asparagus');
      await expect(entryListPageManager.matchCount).toContainText(/1(?= \/)/);

      // remove filter, filter again, have same result
      await entryListPageManager.filterInputClearButton.click();
      await entryListPageManager.filterInput.fill('asparagus');
      await expect(entryListPageManager.matchCount).toContainText(/1(?= \/)/);
      await entryListPageManager.filterInputClearButton.click();
    });

    test('Can click on first entry', async () => {
      const [, editorPageManager] = await Promise.all([
        entryListPageManager.entry(entries.entry1.lexeme.th.value).click(),
        new EditorPage(entryListPageManager.page, project()).waitFor(),
      ])
      await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Lexeme', 'th')).toHaveValue(entries.entry1.lexeme.th.value);
    });

    test('Add word buttons works and redirects to editor', async () => {
      const entryCount = await entryListPageManager.entries.count();
      const [editorPageManager] = await Promise.all([
        EditorPage.waitFor(entryListPageManager.page, project()),
        entryListPageManager.createNewWordButton.click(),
      ]);

      const newEntryCount = entryCount + 1;
      await expect(editorPageManager.compactEntryListItem).toHaveCount(newEntryCount);

      await Promise.all([
        editorPageManager.navigateToEntriesList(),
        entryListPageManager.waitFor(),
      ]);

      await entryListPageManager.expectTotalNumberOfEntries(newEntryCount);
    });

  });
});
