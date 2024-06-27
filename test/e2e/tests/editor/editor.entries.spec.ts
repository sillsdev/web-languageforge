import { expect } from '@playwright/test';
import { entries } from '../../constants';
import { defaultProject, test } from '../../fixtures';
import { ConfigurationPageFieldsTab, EditorPage, EntryListPage } from '../../pages';
import { ConfirmModal } from '../../pages/components';

test.describe('Editor entries', () => {

  const { project, entryIds } = defaultProject();
  let editorPageManager: EditorPage;

  test.beforeEach(({ managerTab }) => {
    editorPageManager = new EditorPage(managerTab, project());
  });

  test('Can go from entry editor to entries list', async () => {
    await editorPageManager.goto();
    await Promise.all([
      editorPageManager.navigateToEntriesList(),
      new EntryListPage(editorPageManager.page, project()).waitFor(),
    ]);
  });

  // left side bar entries list
  test('Editor page has correct entry count in left side bar entries list', async () => {
    await editorPageManager.goto();
    await expect(editorPageManager.compactEntryListItem).toHaveCount(entryIds().length);
  });

  test('URL entry id matches selected entry', async ({ managerTab }) => {
    const editorPageManager = await new EditorPage(managerTab, project()).goto({ entryId: entryIds()[1] });
    expect(editorPageManager.page.url()).toContain(entryIds()[1]);
    expect(editorPageManager.page.url()).not.toContain(entryIds()[0]);

    await editorPageManager.goto({ entryId: entryIds()[0] });
    expect(editorPageManager.page.url()).toContain(entryIds()[0]);
    expect(editorPageManager.page.url()).not.toContain(entryIds()[1]);

    await editorPageManager.goto({ entryId: entryIds()[1] });
    expect(editorPageManager.page.url()).toContain(entryIds()[1]);
    expect(editorPageManager.page.url()).not.toContain(entryIds()[0]);
  });

  test('Entry 1: edit page has correct definition, part of speech', async () => {
    await editorPageManager.goto();
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard, 'Definition', 'en'))
      .toHaveValue(entries.entry1.senses[0].definition.en.value);
    expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard, 'Part of Speech'))
      .toEqual(entries.entry1.senses[0].partOfSpeech.displayName);
  });

  test('Add citation form as visible field', async ({ managerTab }) => {
    const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project()).goto();
    await configurationPage.tabLinks.fields.click();
    await (await configurationPage.getCheckbox('Entry Fields', 'Citation Form', 'Hidden if Empty')).uncheck();
    await configurationPage.applyButton.click();
    await editorPageManager.goto();
    await expect(editorPageManager.getTextarea(editorPageManager.entryCard, 'Citation Form', 'th')).toBeVisible();
  });

  test('Citation form field overrides lexeme form in dictionary citation view', async ({ managerTab }) => {
    const configurationPage = await new ConfigurationPageFieldsTab(managerTab, project()).goto();
    await configurationPage.toggleFieldExpanded('Entry Fields', 'Word');
    await (await configurationPage.getFieldCheckbox('Entry Fields', 'Word', 'ภาษาไทย (IPA)')).check();
    await configurationPage.applyButton.click();

    await editorPageManager.goto();

    // Dictionary citation reflects lexeme form when citation form is empty
    await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme.th.value, entries.entry1.lexeme.th.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme['th-fonipa'].value, entries.entry1.lexeme['th-fonipa'].value]);
    await expect(editorPageManager.renderedDivs).not.toContainText(['citation form', 'citation form']);
    await editorPageManager.showExtraFields();
    const citationFormInput = editorPageManager.getTextarea(editorPageManager.entryCard, 'Citation Form', 'th');
    await citationFormInput.fill('citation form');

    await expect(editorPageManager.renderedDivs).toContainText(['citation form', 'citation form']);
    await expect(editorPageManager.renderedDivs).not.toContainText([entries.entry1.lexeme.th.value, entries.entry1.lexeme.th.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme['th-fonipa'].value, entries.entry1.lexeme['th-fonipa'].value]);

    await citationFormInput.fill('');
    await expect(editorPageManager.renderedDivs).not.toContainText(['citation form', 'citation form']);
    await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme.th.value, entries.entry1.lexeme.th.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.entry1.lexeme['th-fonipa'].value, entries.entry1.lexeme['th-fonipa'].value]);
  });

  test('Navigate to other entries with left entry bar', async () => {
    await editorPageManager.goto({ entryId: entryIds()[1] });

    await Promise.all([
      editorPageManager.page.locator('text=' + entries.multipleMeaningEntry.senses[0].definition.en.value).click(),
      editorPageManager.page.waitForURL(editorPageManager.entryUrl(entryIds()[2])),
    ]);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.first(), 'Definition', 'en')).toHaveValue(entries.multipleMeaningEntry.senses[0].definition.en.value);
  });

  test('Word 2: edit page has correct definition, part of speech', async () => {
    await editorPageManager.goto({ entryId: entryIds()[1] });
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard, 'Definition', 'en'))
      .toHaveValue(entries.entry2.senses[0].definition.en.value);

    expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard, 'Part of Speech'))
      .toEqual(entries.entry2.senses[0].partOfSpeech.displayName);
  });

  test('Dictionary citation reflects example sentences and translations', async () => {
    await editorPageManager.goto({ entryId: entryIds()[2] });

    await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[0].examples[0].sentence.th.value, entries.multipleMeaningEntry.senses[0].examples[0].sentence.th.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[0].examples[0].translation.en.value, entries.multipleMeaningEntry.senses[0].examples[0].translation.en.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[0].examples[1].sentence.th.value, entries.multipleMeaningEntry.senses[0].examples[1].sentence.th.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[0].examples[1].translation.en.value, entries.multipleMeaningEntry.senses[0].examples[1].translation.en.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[1].examples[0].sentence.th.value, entries.multipleMeaningEntry.senses[1].examples[0].sentence.th.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[1].examples[0].translation.en.value, entries.multipleMeaningEntry.senses[1].examples[0].translation.en.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[1].examples[1].sentence.th.value, entries.multipleMeaningEntry.senses[1].examples[1].sentence.th.value]);
    await expect(editorPageManager.renderedDivs).toContainText([entries.multipleMeaningEntry.senses[1].examples[1].translation.en.value, entries.multipleMeaningEntry.senses[1].examples[1].translation.en.value]);
  });

  test('Word with multiple definitions: edit page has correct definitions, parts of speech', async () => {
    await editorPageManager.goto({ entryId: entryIds()[2] });
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.first(), 'Definition', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[0].definition.en.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(1), 'Definition', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[1].definition.en.value);

    expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard.nth(0), 'Part of Speech'))
      .toEqual(entries.multipleMeaningEntry.senses[0].partOfSpeech.displayName);
    expect(await editorPageManager.getSelectedValueFromSelectDropdown(editorPageManager.senseCard.nth(1), 'Part of Speech'))
      .toEqual(entries.multipleMeaningEntry.senses[1].partOfSpeech.displayName);
  });

  test('Word with multiple meanings: edit page has correct example sentences, translations', async () => {
    await editorPageManager.goto({ entryId: entryIds()[2] });

    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Sentence', 'th'))
      .toHaveValue(entries.multipleMeaningEntry.senses[0].examples[0].sentence.th.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Translation', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[0].examples[0].translation.en.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Sentence', 'th'))
      .toHaveValue(entries.multipleMeaningEntry.senses[0].examples[1].sentence.th.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.first().locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Translation', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[0].examples[1].translation.en.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Sentence', 'th'))
      .toHaveValue(entries.multipleMeaningEntry.senses[1].examples[0].sentence.th.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=0'), 'Translation', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[1].examples[0].translation.en.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Sentence', 'th'))
      .toHaveValue(entries.multipleMeaningEntry.senses[1].examples[1].sentence.th.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(1).locator(editorPageManager.exampleCardSelector + ' >> nth=1'), 'Translation', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[1].examples[1].translation.en.value);
  });

  test('While Show Hidden Fields has not been clicked, hidden fields are hidden if they are empty', async () => {
    await editorPageManager.goto({ entryId: entryIds()[2] });
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(0), 'Semantics Note', 'en')).toHaveCount(0);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(0), 'General Note', 'en')).toBeVisible();
    await editorPageManager.showExtraFields();
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(0), 'Semantics Note', 'en')).toBeVisible();
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(0), 'General Note', 'en')).toBeVisible();
  });

  test('Word with multiple meanings: edit page has correct general notes, sources', async () => {
    await editorPageManager.goto({ entryId: entryIds()[2] });
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(0), 'General Note', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[0].generalNote.en.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(1), 'General Note', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[1].generalNote.en.value);
    await editorPageManager.showExtraFields();
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(0), 'Source', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[0].source.en.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(1), 'Source', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[1].source.en.value);
  });

  test('Senses can be reordered and deleted', async () => {
    await editorPageManager.goto({ entryId: entryIds()[2] });
    await editorPageManager.senseCard.first().locator(editorPageManager.moveDownButtonSelector).first().click();
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.first(), 'Definition', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[1].definition.en.value);
    await expect(editorPageManager.getTextarea(
      editorPageManager.senseCard.nth(1), 'Definition', 'en'))
      .toHaveValue(entries.multipleMeaningEntry.senses[0].definition.en.value);
  });

  test('Create new word, modify new word, autosaves changes, new word visible in editor and list', async ({browserName}) => {
    test.skip(browserName === 'firefox', 'locator.fill() has a bug on Firefox that is causing a false-positive test failure as of 2024-04');
    await editorPageManager.goto({ entryId: entryIds()[2] });

    const startEntryCount = await editorPageManager.compactEntryListItem.count();

    await editorPageManager.entryList.createNewWordButton.click();

    const newEntryCount = startEntryCount + 1;
    await expect(editorPageManager.compactEntryListItem).toHaveCount(newEntryCount);

    // go back to editor
    await (editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'th'))
      .fill(entries.entry3.lexeme.th.value);
    await (editorPageManager.getTextarea(editorPageManager.senseCard, 'Definition', 'en'))
      .fill(entries.entry3.senses[0].definition.en.value);

    const partOfSpeedDropdown = editorPageManager.getDropdown(editorPageManager.senseCard, 'Part of Speech');
    partOfSpeedDropdown.selectOption({ label: 'Noun (n)' });

    // Autosaves changes
    await editorPageManager.page.waitForURL(url => !url.hash.includes('editor/entry/_new_'));
    await editorPageManager.page.reload();

    await expect(partOfSpeedDropdown).toHaveSelectedOption({ label: 'Noun (n)' });

    const alreadyThere: string = await editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'th').inputValue();
    await (editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'th'))
      .fill(alreadyThere + 'a'); // Failing on Firefox due to Playwright bug; remove test.skip() above once the Playwright bug is resolved
    await editorPageManager.page.reload();
    await expect((editorPageManager.getTextarea(
      editorPageManager.entryCard, 'Word', 'th')))
      .toHaveValue(entries.entry3.lexeme.th.value + 'a');
    await (editorPageManager.getTextarea(editorPageManager.entryCard, 'Word', 'th'))
      .fill(entries.entry3.lexeme.th.value);

    // New word is visible in list
    await editorPageManager.entryList.filterInput.fill(entries.entry3.senses[0].definition.en.value);
    await expect(editorPageManager.entryList.matchCount).toContainText(/1(?= \/)/);
    await editorPageManager.entryList.filterInputClearButton.click();

    // remove new word to restore original word count
    await editorPageManager.entryCard.first().locator(editorPageManager.deleteCardButtonSelector).first().click();
    const confirmModal = new ConfirmModal(editorPageManager.page);
    await confirmModal.confirmButton.click();

    await expect(editorPageManager.compactEntryListItem).toHaveCount(startEntryCount);

    // previous entry is selected after delete
    await expect(editorPageManager.getTextarea(
      editorPageManager.entryCard, 'Word', 'th'))
      .toHaveValue(entries.entry1.lexeme.th.value);
  });
});
