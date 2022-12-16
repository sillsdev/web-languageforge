import { expect } from '@playwright/test';
import { ConfigurationPageInputSystemsTab } from './pages/configuration-input-systems.tab';
import { EditorPage } from './pages/editor.page';
import { projectPerTest, test } from './utils/fixtures';

test.describe('Configuration Input Systems', async () => {

  const project = projectPerTest();

  test('Viewing and editing input systems', async ({ managerTab }) => {
    const inputSystemsTab = await test.step('Navigate to input systems',
      async (): Promise<ConfigurationPageInputSystemsTab> => {
        const editorPage = new EditorPage(managerTab, project());
        await editorPage.goto();
        const configPage = await editorPage.navigateToProjectConfiguration();
        const [_, inputSystemsTab] = await Promise.all([
          configPage.tabLinks.inputSystems.click(),
          new ConfigurationPageInputSystemsTab(managerTab, project()).waitForPage(),
        ]);
        return inputSystemsTab;
      });

    await test.step('Select Thai input system', async () => {
      await inputSystemsTab.inputSystemOption('Thai').click();
      await expect(inputSystemsTab.selectedDisplayName).toContainText('Thai');
      await expect(inputSystemsTab.abbreviationTextBox).toHaveValue('th');
      await expect(inputSystemsTab.applyButton).toBeDisabled(); // selecting an input system here doesn't change settings
    });

    await test.step('Verify special is readonly', async () => {
      await expect(inputSystemsTab.specialTextBox).toBeVisible();
      await expect(inputSystemsTab.specialTextBox).toBeDisabled();
    });

    await test.step('Change abbreviation, font and RTL', async () => {
      await inputSystemsTab.abbreviationTextBox.fill('');
      const abbreviationSuffix_tooLong = 'looong';
      const abbreviation_tooLong = `th${abbreviationSuffix_tooLong}`;
      await inputSystemsTab.abbreviationTextBox.type(abbreviation_tooLong);

      const newFont = `My new font`;
      await inputSystemsTab.fontNameTextBox.type(newFont);

      const newRtl = !(await inputSystemsTab.rtlCheckbox.isChecked());
      await inputSystemsTab.rtlCheckbox.setChecked(newRtl);

      await inputSystemsTab.applyChanges();
      await inputSystemsTab.inputSystemOption('Thai').click();

      // the "too long" abbreviation gets truncated to 4 characters
      const abbreviation = abbreviation_tooLong.slice(0, 4);
      await expect(inputSystemsTab.abbreviationTextBox).toHaveValue(abbreviation);
      await expect(inputSystemsTab.abbreviationTextBox).not.toHaveValue(abbreviation_tooLong);

      await expect(inputSystemsTab.fontNameTextBox).toHaveValue(newFont);

      await expect(inputSystemsTab.rtlCheckbox).toBeChecked({ checked: newRtl });
    });
  });
});
