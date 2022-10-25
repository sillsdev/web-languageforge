import { expect, Locator, Page } from '@playwright/test';

/**
 * Check whether the option that should be selected is selected.
 * Playwright does not hava a way to directly get the text of the selected option.
 * This function therefore works with the value.
 * @param selectElement , \<select\>
 * @param expectedOptionText , e.g. 'Pizza Margherita' or a substring, e.g. 'Margherita'
 */
export async function expectOptionSelectedInSelectElement(selectElement: Locator, expectedOptionText: string) {
  const expectedOption = selectElement.locator('option').filter({ hasText: expectedOptionText });
  const expectedValue = await expectedOption.getAttribute('value');
  await expect(selectElement).toHaveValue(expectedValue);
}
